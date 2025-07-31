import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RecommendationRequest, RecommendationLetter } from '@/lib/models';
import { getPresignedDownloadUrl } from '@/lib/s3';

/**
 * GET /api/recommendations/recipient/[token]/view
 * Get presigned view URL for recommendation letter (opens in browser)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const resolvedParams = await params;
    await connectDB();
    
    // Find request by token
    const recommendationRequest = await RecommendationRequest.findOne({
      secureToken: resolvedParams.token,
      tokenExpiresAt: { $gt: new Date() }
    });

    if (!recommendationRequest) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 });
    }

    // Check if request is still valid
    if (recommendationRequest.status === 'cancelled') {
      return NextResponse.json({ error: 'Request has been cancelled' }, { status: 400 });
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

    // Generate presigned view URL (without attachment disposition)
    const presignedUrl = await getPresignedDownloadUrl({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: s3Key,
      expiresIn: 3600, // 1 hour
      forceDownload: false, // This will open in browser instead of downloading
    });

    return NextResponse.json({ 
      viewUrl: presignedUrl,
      fileName: recommendationLetter.fileName || 'recommendation-letter.pdf'
    });
  } catch (error) {
    console.error('Error generating view URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 