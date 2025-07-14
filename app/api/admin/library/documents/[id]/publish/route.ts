import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import LibraryDocument from '@/models/LibraryDocument';
import mongoose from 'mongoose';

// POST /api/admin/library/documents/[id]/publish - Publish a library document
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    
    if (!session?.user || session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to update content
    if (!session.user.permissions?.includes("content:update")) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    await connectDB();

    // Find the document
    const document = await LibraryDocument.findById(resolvedParams.id);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check if document is ready for publishing
    if (document.reviewStatus !== 'approved') {
      return NextResponse.json({ 
        error: 'Document must be approved before publishing' 
      }, { status: 400 });
    }

    // Update document status
    document.status = 'published';
    document.publishedAt = new Date();
    document.updatedBy = new mongoose.Types.ObjectId(session.user.id);

    await document.save();

    return NextResponse.json({ 
      message: 'Document published successfully',
      document 
    });
  } catch (error) {
    console.error('Error publishing library document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 