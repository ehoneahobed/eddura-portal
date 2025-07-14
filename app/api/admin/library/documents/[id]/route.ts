import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import LibraryDocument from '@/models/LibraryDocument';
import { z } from 'zod';
import mongoose from 'mongoose';

// Validation schema for updating library documents
const UpdateLibraryDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  type: z.string().min(1, 'Document type is required').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters').optional(),
  category: z.string().min(1, 'Category is required').optional(),
  subcategory: z.string().optional(),
  tags: z.array(z.string().max(50)).optional(),
  targetAudience: z.enum(['undergraduate', 'graduate', 'professional', 'all']).optional(),
  fieldOfStudy: z.array(z.string()).optional(),
  country: z.array(z.string()).optional(),
  author: z.string().max(100).optional(),
  source: z.string().max(200).optional(),
  language: z.string().optional(),
  status: z.enum(['draft', 'review', 'published', 'archived']).optional(),
  reviewStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
  qualityScore: z.number().min(1).max(10).optional(),
  reviewNotes: z.string().max(1000).optional(),
});

// GET /api/admin/library/documents/[id] - Get a specific library document
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    
    if (!session?.user || session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to view library content
    if (!session.user.permissions?.includes("content:read")) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    await connectDB();

    const document = await LibraryDocument.findById(resolvedParams.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName email')
      .lean();

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error fetching library document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/library/documents/[id] - Update a library document
export async function PUT(
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

    const body = await request.json();
    
    // Validate input
    const validatedData = UpdateLibraryDocumentSchema.parse(body);

    // Find the document
    const document = await LibraryDocument.findById(resolvedParams.id);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Update fields
    Object.assign(document, validatedData);
    document.updatedBy = new mongoose.Types.ObjectId(session.user.id);

    // Recalculate word and character counts if content changed
    if (validatedData.content) {
      document.wordCount = validatedData.content.trim().split(/\s+/).filter(word => word.length > 0).length;
      document.characterCount = validatedData.content.length;
    }

    // Set publishedAt if status is being changed to published
    if (validatedData.status === 'published' && document.status !== 'published') {
      document.publishedAt = new Date();
    }

    await document.save();

    // Populate updated info
    await document.populate('updatedBy', 'firstName lastName email');

    return NextResponse.json({ document });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error updating library document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/library/documents/[id] - Delete a library document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    
    if (!session?.user || session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to delete content
    if (!session.user.permissions?.includes("content:delete")) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    await connectDB();

    const document = await LibraryDocument.findById(resolvedParams.id);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check if document has been cloned (for analytics)
    if (document.cloneCount > 0) {
      // Instead of deleting, archive the document
      document.status = 'archived';
      document.updatedBy = new mongoose.Types.ObjectId(session.user.id);
      await document.save();
      return NextResponse.json({ 
        message: 'Document archived successfully (cannot delete documents that have been cloned)',
        document 
      });
    }

    // Delete the document
    await LibraryDocument.findByIdAndDelete(resolvedParams.id);

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting library document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 