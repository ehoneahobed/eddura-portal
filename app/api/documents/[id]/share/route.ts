import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Document from '@/models/Document';
import DocumentShare from '@/models/DocumentShare';
import { sendDocumentShareEmail } from '@/lib/email';
import { z } from 'zod';

// Validation schema for sharing documents
const ShareDocumentSchema = z.object({
  shareType: z.enum(['email', 'link']),
  email: z.string().email().optional(),
  reviewerName: z.string().max(100).optional(),
  message: z.string().max(1000).optional(),
  canComment: z.boolean().default(true),
  canEdit: z.boolean().default(false),
  canDownload: z.boolean().default(true),
  expiresAt: z.string().optional()
});

// POST /api/documents/[id]/share - Share a document
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id: documentId } = await params;
    
    // Check if document exists and belongs to user
    const document = await Document.findOne({
      _id: documentId,
      userId: session.user.id
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = ShareDocumentSchema.parse(body);
    
    // Additional validation for email sharing
    if (validatedData.shareType === 'email' && !validatedData.email) {
      return NextResponse.json(
        { error: 'Email is required for email-based sharing' },
        { status: 400 }
      );
    }

    // Create document share
    const documentShare = new DocumentShare({
      documentId,
      userId: session.user.id,
      ...validatedData,
      expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : undefined
    });

    await documentShare.save();

    // Generate share URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/review/${documentShare.shareToken}`;

    // Send email notification for email-based sharing
    if (validatedData.shareType === 'email' && validatedData.email) {
      try {
        await sendDocumentShareEmail(
          validatedData.email,
          validatedData.reviewerName || 'Reviewer',
          document.title,
          shareUrl,
          validatedData.message
        );
      } catch (error) {
        console.error('Error sending email notification:', error);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      share: {
        _id: documentShare._id,
        shareToken: documentShare.shareToken,
        shareUrl,
        shareType: documentShare.shareType,
        email: documentShare.email,
        reviewerName: documentShare.reviewerName,
        message: documentShare.message,
        canComment: documentShare.canComment,
        canEdit: documentShare.canEdit,
        canDownload: documentShare.canDownload,
        expiresAt: documentShare.expiresAt,
        createdAt: documentShare.createdAt,
        updatedAt: documentShare.updatedAt
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    if (error instanceof Error) {
      console.error('Error sharing document:', error.message);
      if (error.stack) console.error(error.stack);
    } else {
      console.error('Error sharing document:', error);
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/documents/[id]/share - Get all shares for a document
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id: documentId } = await params;
    
    // Check if document exists and belongs to user
    const document = await Document.findOne({
      _id: documentId,
      userId: session.user.id
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Get all shares for this document
    const shares = await DocumentShare.find({
      documentId,
      userId: session.user.id,
      isActive: true
    }).sort({ createdAt: -1 });

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    const sharesWithUrls = shares.map(share => ({
      _id: share._id,
      shareToken: share.shareToken,
      shareUrl: `${baseUrl}/review/${share.shareToken}`,
      shareType: share.shareType,
      email: share.email,
      reviewerName: share.reviewerName,
      message: share.message,
      canComment: share.canComment,
      canEdit: share.canEdit,
      canDownload: share.canDownload,
      expiresAt: share.expiresAt,
      createdAt: share.createdAt,
      updatedAt: share.updatedAt
    }));

    return NextResponse.json({ shares: sharesWithUrls });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching document shares:', error.message);
      if (error.stack) console.error(error.stack);
    } else {
      console.error('Error fetching document shares:', error);
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}