import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Document from '@/models/Document';
import { DocumentType, DOCUMENT_TYPE_CONFIG } from '@/types/documents';
import { z } from 'zod';
import { ActivityTracker } from '@/lib/services/activityTracker';

// Upload-based document types
const UPLOAD_BASED_TYPES = [
  DocumentType.REFERENCE_LETTER,
  DocumentType.RECOMMENDATION_LETTER,
  DocumentType.SCHOOL_CERTIFICATE,
  DocumentType.TRANSCRIPT,
  DocumentType.DEGREE_CERTIFICATE,
  DocumentType.LANGUAGE_CERTIFICATE,
  DocumentType.TEST_SCORES,
  DocumentType.FINANCIAL_DOCUMENTS,
  DocumentType.MEDICAL_RECORDS,
  DocumentType.LEGAL_DOCUMENTS,
  DocumentType.AWARDS_HONORS,
  DocumentType.OTHER_CERTIFICATE,
];

// Validation schema for creating/updating documents
const DocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  type: z.nativeEnum(DocumentType),
  content: z.string().optional(), // Optional for upload-based documents, required for text-based
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  tags: z.array(z.string().max(50)).optional(),
  targetProgram: z.string().max(200).optional(),
  targetScholarship: z.string().max(200).optional(),
  targetInstitution: z.string().max(200).optional(),
  version: z.number().min(1).optional(),
  // File upload fields for upload-based documents
  fileUrl: z.string().optional(),
  fileType: z.string().optional(),
  fileSize: z.number().optional()
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
      content: doc.content || '', // Add the content field (empty string for upload-based docs)
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
      version: doc.version || 1,
      // File upload fields
      fileUrl: doc.fileUrl || null,
      fileType: doc.fileType || null,
      fileSize: doc.fileSize || null
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

    // Additional validation for upload-based vs text-based documents
    const typeConfig = DOCUMENT_TYPE_CONFIG[validatedData.type];
    const isUploadBased = UPLOAD_BASED_TYPES.includes(validatedData.type);
    
    if (isUploadBased) {
      if (!validatedData.fileUrl) {
        return NextResponse.json(
          { error: 'File upload is required for this document type' },
          { status: 400 }
        );
      }
      // For upload-based documents, content is optional
      validatedData.content = undefined;
    } else {
      if (!validatedData.content || validatedData.content.trim().length === 0) {
        return NextResponse.json(
          { error: 'Content is required for this document type' },
          { status: 400 }
        );
      }
    }

    // Create document data object
    const documentData = {
      ...validatedData,
      userId: session.user.id,
      version: validatedData.version || 1
    };

    // Remove undefined content for upload-based documents
    if (isUploadBased && documentData.content === undefined) {
      delete documentData.content;
    }

    // Create new document
    const document = new Document(documentData);

    await document.save();

    // Track document creation activity
    await ActivityTracker.trackDocumentActivity(
      session.user.id,
      'created',
      document._id.toString()
    );

    // Update squad progress if user is in squads
    try {
      const { ProgressTracker } = await import('@/lib/services/progressTracker');
      await ProgressTracker.trackActivity({
        userId: session.user.id,
        activityType: 'document_created',
        timestamp: new Date(),
        metadata: { documentId: document._id.toString() }
      });
    } catch (error) {
      console.error('Error updating squad progress:', error);
      // Don't fail the request if squad tracking fails
    }

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