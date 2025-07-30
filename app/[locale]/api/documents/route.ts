import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Document from '@/models/Document';
import { DocumentType, DOCUMENT_TYPE_CONFIG } from '@/types/documents';
import { z } from 'zod';
import { getPresignedUploadUrl } from '@/lib/s3';
import { randomUUID } from 'crypto';

// Validation schema for creating/updating documents
const DocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  type: z.nativeEnum(DocumentType),
  content: z.string().min(1, 'Content is required'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  tags: z.array(z.string().max(50)).optional(),
  targetProgram: z.string().max(200).optional(),
  targetScholarship: z.string().max(200).optional(),
  targetInstitution: z.string().max(200).optional(),
  version: z.number().min(1).optional()
});

// GET /api/documents - Get all documents for the current user
export async function GET(request: NextRequest) {
  try {
    console.log('=== DOCUMENTS API DEBUG ===');
    const session = await auth();
    console.log('Session:', session);
    console.log('Session user:', session?.user);
    
    if (!session?.user?.id) {
      console.log('❌ No session or user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ User authenticated:', session.user.id);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');

    // Build query
    const query: any = { userId: session.user.id };
    
    if (type) {
      query.type = type;
    }
    
    if (category) {
      // Filter by category using the typeConfig
      const categoryTypes = Object.values(DocumentType).filter(docType => {
        const config = DOCUMENT_TYPE_CONFIG[docType];
        return config?.category === category;
      });
      query.type = { $in: categoryTypes };
    }
    
    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }

    console.log('Query:', query);
    const documents = await Document.find(query)
      .sort({ updatedAt: -1 })
      .lean();
    
    console.log('Found documents:', documents.length);
    console.log('Sample documents:', documents.slice(0, 2));

    // Transform documents to match expected format
    const transformedDocuments = documents.map(doc => ({
      _id: doc._id,
      title: doc.title,
      description: doc.description,
      content: doc.content, // Add the content field
      documentType: doc.type, // Map 'type' to 'documentType'
      type: doc.type,
      category: DOCUMENT_TYPE_CONFIG[doc.type]?.category || 'Other',
      status: doc.isActive ? 'approved' : 'draft',
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      lastEditedAt: doc.lastEditedAt, // Include lastEditedAt field
      createdBy: {
        name: session.user.name || 'Unknown'
      },
      linkedToRequirements: [], // Will be populated when linking is implemented
      tags: doc.tags || [],
      wordCount: doc.wordCount || 0,
      characterCount: doc.characterCount || 0,
      targetProgram: doc.targetProgram || '',
      targetScholarship: doc.targetScholarship || '',
      targetInstitution: doc.targetInstitution || '',
      version: doc.version || 1
    }));

    console.log('Transformed documents:', transformedDocuments.length);
    return NextResponse.json({ documents: transformedDocuments });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/documents/upload - Get S3 presigned URL for file upload (for upload-based document types)
export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  if (url.pathname.endsWith('/upload')) {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const formData = await request.formData();
      const file = formData.get('file') as File;
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }
      // Accept only PDF, DOC, DOCX, TXT, etc.
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
      }
      // 10MB limit
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
      }
      const fileExtension = file.name.split('.').pop();
      const filename = `${randomUUID()}.${fileExtension}`;
      const s3Key = `documents/${session.user.id}/${filename}`;
      const s3Url = await getPresignedUploadUrl({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: s3Key,
        ContentType: file.type,
        expiresIn: 300,
      });
      const s3ObjectUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
      return NextResponse.json({
        presignedUrl: s3Url,
        fileUrl: s3ObjectUrl,
        fileType: file.type,
        fileSize: file.size,
        filename,
      }, { status: 201 });
    } catch (error) {
      console.error('Document upload error:', error);
      return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
    }
  }
  // POST /api/documents - Create a new document
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    
    // Validate input
    const validatedData = DocumentSchema.parse(body);
    
    // Check if document type is coming soon
    const typeConfig = DOCUMENT_TYPE_CONFIG[validatedData.type];
    if (typeConfig?.comingSoon) {
      return NextResponse.json(
        { error: 'This document type is coming soon' },
        { status: 400 }
      );
    }

    // Create new document
    const document = new Document({
      ...validatedData,
      userId: session.user.id,
      version: validatedData.version || 1
    });

    await document.save();

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}