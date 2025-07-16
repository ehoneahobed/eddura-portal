import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Document from '@/models/Document';
import DocumentFeedback from '@/models/DocumentFeedback';
import DocumentShare from '@/models/DocumentShare';
import { sendFeedbackReceivedEmail } from '@/lib/email';
import { z } from 'zod';

// Validation schema for creating feedback
const CreateFeedbackSchema = z.object({
  documentShareId: z.string(),
  reviewerName: z.string().min(1, 'Reviewer name is required').max(100),
  reviewerEmail: z.string().email().optional(),
  comments: z.array(z.object({
    content: z.string().min(1, 'Comment content is required').max(2000),
    position: z.object({
      start: z.number(),
      end: z.number(),
      text: z.string()
    }).optional(),
    type: z.enum(['general', 'suggestion', 'correction', 'question']).default('general')
  })).min(1, 'At least one comment is required'),
  overallRating: z.number().min(1).max(5).optional(),
  generalFeedback: z.string().max(5000).optional()
});

// Validation schema for updating feedback
const UpdateFeedbackSchema = z.object({
  comments: z.array(z.object({
    id: z.string(),
    content: z.string().min(1).max(2000),
    position: z.object({
      start: z.number(),
      end: z.number(),
      text: z.string()
    }).optional(),
    type: z.enum(['general', 'suggestion', 'correction', 'question']),
    status: z.enum(['pending', 'addressed', 'ignored'])
  })).optional(),
  overallRating: z.number().min(1).max(5).optional(),
  generalFeedback: z.string().max(5000).optional(),
  isResolved: z.boolean().optional()
});

// POST /api/documents/[id]/feedback - Create feedback for a document
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: documentId } = await context.params;
  try {
    await connectDB();

    const body = await request.json();
    
    // Validate input
    const validatedData = CreateFeedbackSchema.parse(body);
    
    // Check if document exists
    const document = await Document.findById(documentId);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check if share exists and is active
    const share = await DocumentShare.findOne({
      _id: validatedData.documentShareId,
      documentId,
      isActive: true
    });

    if (!share) {
      return NextResponse.json({ error: 'Invalid or expired share link' }, { status: 400 });
    }

    // Check if share has expired
    if (share.expiresAt && new Date() > share.expiresAt) {
      return NextResponse.json({ error: 'Share link has expired' }, { status: 400 });
    }

    // Check if feedback already exists for this share
    const existingFeedback = await DocumentFeedback.findOne({
      documentShareId: validatedData.documentShareId
    });

    if (existingFeedback) {
      return NextResponse.json(
        { error: 'Feedback already exists for this share' },
        { status: 400 }
      );
    }

    // Create feedback
    const feedback = new DocumentFeedback({
      documentId,
      documentShareId: validatedData.documentShareId,
      reviewerName: validatedData.reviewerName,
      reviewerEmail: validatedData.reviewerEmail,
      comments: validatedData.comments,
      overallRating: validatedData.overallRating,
      generalFeedback: validatedData.generalFeedback
    });

    await feedback.save();

    // Send email notification to document owner
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const feedbackUrl = `${baseUrl}/(user-portal)/documents`;
      
      await sendFeedbackReceivedEmail(
        document.userId.toString(), // This would need to be the actual user email
        document.title,
        feedback.reviewerName,
        feedbackUrl
      );
    } catch (error) {
      console.error('Error sending feedback notification:', error);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      feedback: {
        _id: feedback._id,
        documentId: feedback.documentId,
        documentShareId: feedback.documentShareId,
        reviewerName: feedback.reviewerName,
        reviewerEmail: feedback.reviewerEmail,
        comments: feedback.comments,
        overallRating: feedback.overallRating,
        generalFeedback: feedback.generalFeedback,
        isResolved: feedback.isResolved,
        createdAt: feedback.createdAt,
        updatedAt: feedback.updatedAt
      }
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error creating feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/documents/[id]/feedback - Get all feedback for a document (document owner only)
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: documentId } = await context.params;
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Check if document exists and belongs to user
    const document = await Document.findOne({
      _id: documentId,
      userId: session.user.id
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Get all feedback for this document
    const feedback = await DocumentFeedback.find({ documentId })
      .populate('documentShareId')
      .sort({ createdAt: -1 });

    // Calculate feedback statistics
    const totalFeedback = feedback.length;
    const pendingFeedback = feedback.filter(f => !f.isResolved).length;
    const resolvedFeedback = feedback.filter(f => f.isResolved).length;
    
    const ratings = feedback.filter(f => f.overallRating).map(f => f.overallRating!);
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : 0;

    const feedbackByType = feedback.reduce((acc, f) => {
      f.comments.forEach(comment => {
        acc[comment.type] = (acc[comment.type] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      feedback: feedback.map(f => ({
        _id: f._id,
        documentId: f.documentId,
        documentShareId: f.documentShareId,
        reviewerName: f.reviewerName,
        reviewerEmail: f.reviewerEmail,
        comments: f.comments,
        overallRating: f.overallRating,
        generalFeedback: f.generalFeedback,
        isResolved: f.isResolved,
        resolvedAt: f.resolvedAt,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt
      })),
      stats: {
        totalFeedback,
        pendingFeedback,
        resolvedFeedback,
        averageRating: Math.round(averageRating * 10) / 10,
        feedbackByType,
        recentFeedback: feedback.slice(0, 5).map(f => ({
          _id: f._id,
          reviewerName: f.reviewerName,
          overallRating: f.overallRating,
          commentCount: f.comments.length,
          createdAt: f.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching document feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/documents/[id]/feedback - Update feedback (document owner only)
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: documentId } = await context.params;
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    
    // Validate input
    const validatedData = UpdateFeedbackSchema.parse(body);
    
    // Check if document exists and belongs to user
    const document = await Document.findOne({
      _id: documentId,
      userId: session.user.id
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Get feedback ID from query params
    const { searchParams } = new URL(request.url);
    const feedbackId = searchParams.get('feedbackId');

    if (!feedbackId) {
      return NextResponse.json({ error: 'Feedback ID is required' }, { status: 400 });
    }

    // Check if feedback exists and belongs to this document
    const feedback = await DocumentFeedback.findOne({
      _id: feedbackId,
      documentId
    });

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    // Update feedback
    if (validatedData.comments) {
      // Map the validated comments to include timestamps
      feedback.comments = validatedData.comments.map(comment => ({
        ...comment,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
    }
    if (validatedData.overallRating !== undefined) {
      feedback.overallRating = validatedData.overallRating;
    }
    if (validatedData.generalFeedback !== undefined) {
      feedback.generalFeedback = validatedData.generalFeedback;
    }
    if (validatedData.isResolved !== undefined) {
      feedback.isResolved = validatedData.isResolved;
      if (validatedData.isResolved) {
        feedback.resolvedAt = new Date();
      } else {
        feedback.resolvedAt = undefined;
      }
    }

    await feedback.save();

    return NextResponse.json({
      success: true,
      feedback: {
        _id: feedback._id,
        documentId: feedback.documentId,
        documentShareId: feedback.documentShareId,
        reviewerName: feedback.reviewerName,
        reviewerEmail: feedback.reviewerEmail,
        comments: feedback.comments,
        overallRating: feedback.overallRating,
        generalFeedback: feedback.generalFeedback,
        isResolved: feedback.isResolved,
        resolvedAt: feedback.resolvedAt,
        createdAt: feedback.createdAt,
        updatedAt: feedback.updatedAt
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error updating feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}