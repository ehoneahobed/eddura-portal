import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import LibraryDocument from '@/models/LibraryDocument';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const { isTemplate } = await request.json();

    // Find and update the document
    const document = await LibraryDocument.findByIdAndUpdate(
      id,
      { 
        isTemplate,
        updatedBy: session.user.id
      },
      { new: true }
    );

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Document ${isTemplate ? 'marked as' : 'removed from'} template successfully`,
      document: {
        _id: (document._id as any).toString(),
        title: document.title,
        isTemplate: document.isTemplate
      }
    });
  } catch (error) {
    console.error('Error toggling template status:', error);
    return NextResponse.json(
      { error: 'Failed to update template status' },
      { status: 500 }
    );
  }
} 