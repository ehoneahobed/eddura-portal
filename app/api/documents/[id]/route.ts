import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Document, { IDocument, DocumentType } from '@/models/Document';
import { z } from 'zod';

// Validation schema for updating documents
const UpdateDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  tags: z.array(z.string().max(50)).optional(),
  targetProgram: z.string().max(200).optional(),
  targetScholarship: z.string().max(200).optional(),
  targetInstitution: z.string().max(200).optional(),
  isActive: z.boolean().optional()
});

// GET /api/documents/[id] - Get a specific document
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const document = await Document.findOne({
      _id: id,
      userId: session.user.id
    }).lean();

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/documents/[id] - Update a document
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    
    // Validate input
    const validatedData = UpdateDocumentSchema.parse(body);

    const document = await Document.findOne({
      _id: id,
      userId: session.user.id
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Update document fields
    Object.assign(document, validatedData);
    
    // Increment version if content was changed
    if (validatedData.content && validatedData.content !== document.content) {
      document.version += 1;
    }

    await document.save();

    return NextResponse.json({ document });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/[id] - Delete a document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const document = await Document.findOneAndDelete({
      _id: id,
      userId: session.user.id
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}