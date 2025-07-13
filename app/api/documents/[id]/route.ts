import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Document, { IDocument } from '@/models/Document';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const document = await Document.findOne({
      _id: params.id,
      userId: session.user.id,
      isActive: true
    }).lean();

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, content, type, category, tags, language, isPublic, createNewVersion } = body;

    await connectDB();

    const existingDocument = await Document.findOne({
      _id: params.id,
      userId: session.user.id,
      isActive: true
    });

    if (!existingDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // If createNewVersion is true, create a new version instead of updating
    if (createNewVersion) {
      const newVersion = await Document.createNewVersion(
        session.user.id,
        params.id,
        {
          title: title || existingDocument.title,
          description: description !== undefined ? description : existingDocument.description,
          content: content || existingDocument.content,
          type: type || existingDocument.type,
          category: category || existingDocument.category,
          tags: tags || existingDocument.tags,
          language: language || existingDocument.language,
          isPublic: isPublic !== undefined ? isPublic : existingDocument.isPublic
        }
      );

      return NextResponse.json({ 
        message: 'New version created successfully',
        document: newVersion 
      });
    }

    // Update existing document
    const updatedDocument = await Document.findByIdAndUpdate(
      params.id,
      {
        title: title || existingDocument.title,
        description: description !== undefined ? description : existingDocument.description,
        content: content || existingDocument.content,
        type: type || existingDocument.type,
        category: category || existingDocument.category,
        tags: tags || existingDocument.tags,
        language: language || existingDocument.language,
        isPublic: isPublic !== undefined ? isPublic : existingDocument.isPublic,
        'metadata.lastEdited': new Date()
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ 
      message: 'Document updated successfully',
      document: updatedDocument 
    });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const document = await Document.findOne({
      _id: params.id,
      userId: session.user.id,
      isActive: true
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Soft delete by setting isActive to false
    await Document.findByIdAndUpdate(params.id, { isActive: false });

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}