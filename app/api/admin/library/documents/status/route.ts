import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import LibraryDocument from '@/models/LibraryDocument';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();

    // Check all documents
    const allDocuments = await LibraryDocument.find({});
    
    // Check published documents
    const publishedDocuments = await LibraryDocument.find({ 
      status: 'published',
      reviewStatus: 'approved'
    });

    // Check by status
    const draftDocuments = await LibraryDocument.find({ status: 'draft' });
    const reviewDocuments = await LibraryDocument.find({ status: 'review' });
    const publishedDocumentsOnly = await LibraryDocument.find({ status: 'published' });
    const archivedDocuments = await LibraryDocument.find({ status: 'archived' });

    // Check by review status
    const pendingDocuments = await LibraryDocument.find({ reviewStatus: 'pending' });
    const approvedDocuments = await LibraryDocument.find({ reviewStatus: 'approved' });
    const rejectedDocuments = await LibraryDocument.find({ reviewStatus: 'rejected' });

    return NextResponse.json({
      summary: {
        totalDocuments: allDocuments.length,
        publishedAndApproved: publishedDocuments.length,
        visibleInLibrary: publishedDocuments.length
      },
      byStatus: {
        draft: draftDocuments.length,
        review: reviewDocuments.length,
        published: publishedDocumentsOnly.length,
        archived: archivedDocuments.length
      },
      byReviewStatus: {
        pending: pendingDocuments.length,
        approved: approvedDocuments.length,
        rejected: rejectedDocuments.length
      },
      publishedDocuments: publishedDocuments.map(doc => ({
        id: doc._id,
        title: doc.title,
        category: doc.category,
        type: doc.type,
        status: doc.status,
        reviewStatus: doc.reviewStatus
      }))
    });

  } catch (error) {
    console.error('Error checking library documents status:', error);
    return NextResponse.json(
      { error: 'Failed to check library documents status' },
      { status: 500 }
    );
  }
}