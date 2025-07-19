import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Document from '@/models/Document';
import { DocumentType, DOCUMENT_TYPE_CONFIG } from '@/types/documents';
import { z } from 'zod';

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
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const documents = await Document.find(query)
      .sort({ updatedAt: -1 })
      .lean();

    // Transform documents to match expected format
    const transformedDocuments = documents.map(doc => ({
      _id: doc._id,
      title: doc.title,
      description: doc.description,
      documentType: doc.type, // Map 'type' to 'documentType'
      type: doc.type,
      category: DOCUMENT_TYPE_CONFIG[doc.type]?.category || 'Other',
      status: doc.isActive ? 'approved' : 'draft',
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: {
        name: session.user.name || 'Unknown'
      },
      linkedToRequirements: [], // Will be populated when linking is implemented
      tags: doc.tags || [],
      wordCount: doc.wordCount || 0,
      characterCount: doc.characterCount || 0
    }));

    return NextResponse.json({ data: transformedDocuments });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/documents - Create a new document
export async function POST(request: NextRequest) {
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