import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import DocumentClone from '@/models/DocumentClone';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.type !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = params;
    const { isBookmarked } = await request.json();

    // Find and update the cloned document
    const document = await DocumentClone.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { 
        isBookmarked,
        lastAccessedAt: new Date()
      },
      { new: true }
    );

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Document ${isBookmarked ? 'bookmarked' : 'unbookmarked'} successfully`,
      document: {
        _id: (document._id as any).toString(),
        isBookmarked: document.isBookmarked
      }
    });
  } catch (error) {
    console.error('Error updating bookmark status:', error);
    return NextResponse.json(
      { error: 'Failed to update bookmark status' },
      { status: 500 }
    );
  }
} 