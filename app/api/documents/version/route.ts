import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Document from '@/models/Document';
import { z } from 'zod';

// Validation schema for creating document version
const CreateVersionSchema = z.object({
  originalDocumentId: z.string().min(1, 'Original document ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().optional(),
  description: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
  targetProgram: z.string().max(200).optional(),
  targetScholarship: z.string().max(200).optional(),
  targetInstitution: z.string().max(200).optional(),
  version: z.number().min(1).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const body = await request.json();
    const validatedData = CreateVersionSchema.parse(body);

    // Get the original document
    const originalDocument = await Document.findById(validatedData.originalDocumentId);
    
    if (!originalDocument) {
      return NextResponse.json({ error: 'Original document not found' }, { status: 404 });
    }

    // Check if user owns the original document
    if (originalDocument.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create new version document
    const newVersion = new Document({
      userId: session.user.id,
      title: validatedData.title,
      type: originalDocument.type,
      content: validatedData.content || originalDocument.content,
      version: validatedData.version || (originalDocument.version + 1),
      isActive: true,
      description: validatedData.description || originalDocument.description,
      tags: validatedData.tags || originalDocument.tags,
      targetProgram: validatedData.targetProgram || originalDocument.targetProgram,
      targetScholarship: validatedData.targetScholarship || originalDocument.targetScholarship,
      targetInstitution: validatedData.targetInstitution || originalDocument.targetInstitution,
      wordCount: validatedData.content ? validatedData.content.trim().split(/\s+/).filter(word => word.length > 0).length : originalDocument.wordCount,
      characterCount: validatedData.content ? validatedData.content.length : originalDocument.characterCount,
      lastEditedAt: new Date(),
      // Copy file-related fields if they exist
      fileUrl: originalDocument.fileUrl,
      fileType: originalDocument.fileType,
      fileSize: originalDocument.fileSize,
    });

    await newVersion.save();

    return NextResponse.json({
      success: true,
      document: newVersion,
      message: 'Document version created successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error creating document version:', error);
    return NextResponse.json(
      { error: 'Failed to create document version' },
      { status: 500 }
    );
  }
}