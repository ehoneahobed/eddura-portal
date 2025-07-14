import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Document, { IStudentDocument } from '@/models/Document';
import { DocumentType } from '@/types/documents';
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
  isActive: z.boolean().optional(),
  // Enhanced features from our branch
  type: z.nativeEnum(DocumentType).optional(),
  category: z.enum(['academic', 'professional', 'personal', 'certification', 'other']).optional(),
  isPublic: z.boolean().optional(),
  language: z.string().optional(),
  createNewVersion: z.boolean().optional()
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
      userId: session.user.id,
      isActive: true
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

    const existingDocument = await Document.findOne({
      _id: id,
      userId: session.user.id,
      isActive: true
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // If createNewVersion is true, create a new version instead of updating
    if (validatedData.createNewVersion) {
      const newVersion = await (Document as any).createNewVersion(
        session.user.id,
        id,
        {
          title: validatedData.title || existingDocument.title,
          description: validatedData.description !== undefined ? validatedData.description : existingDocument.description,
          content: validatedData.content || existingDocument.content,
          type: validatedData.type || existingDocument.type,
          category: validatedData.category || existingDocument.category,
          tags: validatedData.tags || existingDocument.tags,
          language: validatedData.language || existingDocument.language,
          isPublic: validatedData.isPublic !== undefined ? validatedData.isPublic : existingDocument.isPublic,
          targetProgram: validatedData.targetProgram || existingDocument.targetProgram,
          targetScholarship: validatedData.targetScholarship || existingDocument.targetScholarship,
          targetInstitution: validatedData.targetInstitution || existingDocument.targetInstitution
        }
      );

      return NextResponse.json({ 
        message: 'New version created successfully',
        document: newVersion 
      });
    }

    // Update existing document
    const updateData: any = { ...validatedData };
    delete updateData.createNewVersion; // Remove from update data
    
    // Increment version if content was changed
    if (validatedData.content && validatedData.content !== existingDocument.content) {
      updateData.version = existingDocument.version + 1;
    }

    const updatedDocument = await Document.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({ 
      message: 'Document updated successfully',
      document: updatedDocument 
    });
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

    const document = await Document.findOne({
      _id: id,
      userId: session.user.id,
      isActive: true
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    await Document.findByIdAndUpdate(id, { isActive: false });

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}