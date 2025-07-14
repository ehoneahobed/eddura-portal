import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import LibraryDocument from '@/models/LibraryDocument';
import { z } from 'zod';
import mongoose from 'mongoose';

// Validation schema for reviewing documents
const ReviewDocumentSchema = z.object({
  reviewStatus: z.enum(['pending', 'approved', 'rejected']),
  qualityScore: z.number().min(1).max(10),
  reviewNotes: z.string().max(1000).optional(),
});

// POST /api/admin/library/documents/[id]/review - Review a library document
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

    const body = await request.json();
    
    // Validate input
    const validatedData = ReviewDocumentSchema.parse(body);

    // Find the document
    const document = await LibraryDocument.findById(resolvedParams.id);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Update review fields
    document.reviewStatus = validatedData.reviewStatus;
    document.qualityScore = validatedData.qualityScore;
    document.reviewNotes = validatedData.reviewNotes;
    document.reviewedBy = new mongoose.Types.ObjectId(session.user.id);
    document.reviewedAt = new Date();
    document.updatedBy = new mongoose.Types.ObjectId(session.user.id);

    await document.save();

    // Populate reviewer info
    await document.populate('reviewedBy', 'firstName lastName email');

    return NextResponse.json({ 
      message: 'Document reviewed successfully',
      document 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error reviewing library document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 