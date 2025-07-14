import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Document, { IStudentDocument } from '@/models/Document';
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
  version: z.number().min(1).optional(),
  // Enhanced features from our branch
  category: z.enum(['academic', 'professional', 'personal', 'certification', 'other']).optional(),
  isPublic: z.boolean().optional(),
  language: z.string().optional(),
  fileUrl: z.string().optional(),
  fileSize: z.number().optional(),
  fileType: z.string().optional()
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
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const isActive = searchParams.get('isActive');

    // Build query
    const query: any = { 
      userId: session.user.id, 
      isActive: isActive !== null ? isActive === 'true' : true 
    };

    if (type) query.type = type;
    if (category) {
      // Filter by category using the typeConfig
      const categoryTypes = Object.values(DocumentType).filter(docType => {
        const config = DOCUMENT_TYPE_CONFIG[docType];
        return config?.category === category;
      });
      query.type = { $in: categoryTypes };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Get documents with pagination
    const [documents, total] = await Promise.all([
      Document.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Document.countDocuments(query)
    ]);

    return NextResponse.json({
      documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

    // Check if document with same title exists and get next version
    const nextVersion = await (Document as any).getNextVersion(session.user.id, validatedData.title);

    // Create new document
    const document = new Document({
      ...validatedData,
      userId: session.user.id,
      version: nextVersion
    });

    await document.save();

    return NextResponse.json({ 
      message: 'Document created successfully',
      document 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}