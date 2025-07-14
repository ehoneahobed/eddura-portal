import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import LibraryDocument from '@/models/LibraryDocument';
import DocumentRating from '@/models/DocumentRating';
import { z } from 'zod';

// Validation schema for rating documents
const RateDocumentSchema = z.object({
  rating: z.number().min(1).max(5),
  review: z.string().max(1000).optional(),
});

// POST /api/library/documents/[id]/rate - Rate a library document
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    
    // Validate input
    const validatedData = RateDocumentSchema.parse(body);

    // Check if document exists and is published
    const document = await LibraryDocument.findOne({
      _id: resolvedParams.id,
      status: 'published',
      reviewStatus: 'approved'
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check if user has already rated this document
    const existingRating = await DocumentRating.findOne({
      documentId: resolvedParams.id,
      userId: session.user.id
    });

    if (existingRating) {
      // Update existing rating
      existingRating.rating = validatedData.rating;
      existingRating.review = validatedData.review;
      await existingRating.save();
    } else {
      // Create new rating
      await DocumentRating.create({
        documentId: resolvedParams.id,
        userId: session.user.id,
        rating: validatedData.rating,
        review: validatedData.review,
      });
    }

    // Recalculate document statistics
    const ratings = await DocumentRating.find({ documentId: resolvedParams.id });
    const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / ratings.length;

    // Update document statistics
    document.averageRating = Math.round(averageRating * 10) / 10; // Round to 1 decimal
    document.ratingCount = ratings.length;
    await document.save();

    return NextResponse.json({ 
      message: 'Rating submitted successfully',
      averageRating: document.averageRating,
      ratingCount: document.ratingCount
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error rating library document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 