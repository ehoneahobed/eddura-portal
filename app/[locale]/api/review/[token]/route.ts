import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Document from '@/models/Document';
import DocumentShare from '@/models/DocumentShare';
import DocumentFeedback from '@/models/DocumentFeedback';

// GET /api/review/[token] - Get shared document for review
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    await connectDB();

    const { token: shareToken } = await params;
    
    // Find the share
    const share = await DocumentShare.findOne({
      shareToken,
      isActive: true
    });

    if (!share) {
      return NextResponse.json({ error: 'Invalid or expired share link' }, { status: 404 });
    }

    // Check if share has expired
    if (share.expiresAt && new Date() > share.expiresAt) {
      return NextResponse.json({ error: 'Share link has expired' }, { status: 410 });
    }

    // Get the document
    const document = await Document.findById(share.documentId);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check if feedback already exists for this share
    const existingFeedback = await DocumentFeedback.findOne({
      documentShareId: share._id
    });

    return NextResponse.json({
      document: {
        _id: document._id,
        title: document.title,
        type: document.type,
        content: document.content,
        description: document.description,
        wordCount: document.wordCount,
        characterCount: document.characterCount,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt
      },
      share: {
        _id: share._id,
        shareType: share.shareType,
        email: share.email,
        reviewerName: share.reviewerName,
        message: share.message,
        canComment: share.canComment,
        canEdit: share.canEdit,
        canDownload: share.canDownload,
        expiresAt: share.expiresAt,
        createdAt: share.createdAt
      },
      existingFeedback: existingFeedback ? {
        _id: existingFeedback._id,
        reviewerName: existingFeedback.reviewerName,
        reviewerEmail: existingFeedback.reviewerEmail,
        comments: existingFeedback.comments,
        overallRating: existingFeedback.overallRating,
        generalFeedback: existingFeedback.generalFeedback,
        createdAt: existingFeedback.createdAt,
        updatedAt: existingFeedback.updatedAt
      } : null
    });
  } catch (error) {
    console.error('Error fetching shared document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}