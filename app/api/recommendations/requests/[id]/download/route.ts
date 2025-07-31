import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import RecommendationRequest from '@/models/RecommendationRequest';
import RecommendationLetter from '@/models/RecommendationLetter';
import User from '@/models/User';
import { getPresignedDownloadUrl } from '@/lib/s3';

/**
 * GET /api/recommendations/requests/[id]/download
 * Get presigned download URL for recommendation letter (student access)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    await connectDB();
    
    // Get user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get request
    const recommendationRequest = await RecommendationRequest.findOne({
      _id: resolvedParams.id,
      studentId: user._id
    });

    if (!recommendationRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Check if request has been received
    if (recommendationRequest.status !== 'received') {
      return NextResponse.json({ error: 'Recommendation letter not yet received' }, { status: 400 });
    }

    // Get the latest recommendation letter
    const recommendationLetter = await RecommendationLetter.findOne({
      requestId: recommendationRequest._id
    }).sort({ version: -1 });

    if (!recommendationLetter || !recommendationLetter.fileUrl) {
      return NextResponse.json({ error: 'No recommendation letter found' }, { status: 404 });
    }

    // Extract S3 key from the file URL
    // URL format: https://bucket.s3.region.amazonaws.com/key
    const fileUrl = recommendationLetter.fileUrl;
    const urlParts = fileUrl.split('/');
    const s3Key = urlParts.slice(3).join('/'); // Remove https://bucket.s3.region.amazonaws.com/

    if (!s3Key) {
      return NextResponse.json({ error: 'Invalid file URL format' }, { status: 400 });
    }

    // Generate presigned download URL
    const presignedUrl = await getPresignedDownloadUrl({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: s3Key,
      expiresIn: 3600, // 1 hour
      forceDownload: true,
    });

    return NextResponse.json({ 
      downloadUrl: presignedUrl,
      fileName: recommendationLetter.fileName || 'recommendation-letter.pdf'
    });
  } catch (error) {
    console.error('Error generating download URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 