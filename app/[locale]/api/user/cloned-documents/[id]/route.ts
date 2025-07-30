import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import DocumentClone from '@/models/DocumentClone';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.type !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;

    // Find the cloned document and populate original document info
    const document = await DocumentClone.findOne({ _id: id, userId: session.user.id })
      .populate('originalDocumentId', 'title type description category tags');

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      );
    }

    // Update access count and last accessed time
    await DocumentClone.findByIdAndUpdate(id, {
      $inc: { accessCount: 1 },
      lastAccessedAt: new Date()
    });

    return NextResponse.json({
      document: {
        _id: (document._id as any).toString(),
        originalDocument: {
          _id: (document.originalDocumentId as any)._id.toString(),
          title: (document.originalDocumentId as any).title,
          type: (document.originalDocumentId as any).type,
          description: (document.originalDocumentId as any).description,
          category: (document.originalDocumentId as any).category,
          tags: (document.originalDocumentId as any).tags
        },
        clonedContent: document.clonedContent,
        customizations: document.customizations || {},
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
        lastAccessedAt: document.lastAccessedAt,
        accessCount: document.accessCount || 0
      }
    });
  } catch (error) {
    console.error('Error fetching cloned document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.type !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const { clonedContent, customizations } = await request.json();

    // Find and update the cloned document
    const document = await DocumentClone.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { 
        clonedContent,
        customizations,
        lastAccessedAt: new Date()
      },
      { new: true }
    ).populate('originalDocumentId', 'title type description category tags');

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Document updated successfully',
      document: {
        _id: (document._id as any).toString(),
        originalDocument: {
          _id: (document.originalDocumentId as any)._id.toString(),
          title: (document.originalDocumentId as any).title,
          type: (document.originalDocumentId as any).type,
          description: (document.originalDocumentId as any).description,
          category: (document.originalDocumentId as any).category,
          tags: (document.originalDocumentId as any).tags
        },
        clonedContent: document.clonedContent,
        customizations: document.customizations || {},
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
        lastAccessedAt: document.lastAccessedAt,
        accessCount: document.accessCount || 0
      }
    });
  } catch (error) {
    console.error('Error updating cloned document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.type !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;

    // Find and delete the cloned document
    const document = await DocumentClone.findOneAndDelete({
      _id: id,
      userId: session.user.id
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Document deleted successfully',
      documentId: id
    });
  } catch (error) {
    console.error('Error deleting cloned document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
} 