import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RecommendationRequest, RecommendationLetter, User, Recipient } from '@/lib/models';

/**
 * GET /api/recommendations/recipient/[token]
 * Get recommendation request details for recipient
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
    })
    .populate('studentId', 'firstName lastName email')
    .populate('recipientId', 'name email title institution department')
    .populate('applicationId', 'title')
    .populate('scholarshipId', 'title');

    if (!recommendationRequest) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 });
    }

    // Check if request is still valid
    if (recommendationRequest.status === 'cancelled') {
      return NextResponse.json({ error: 'Request has been cancelled' }, { status: 400 });
    }

    // Get existing letter if any
    const existingLetter = await RecommendationLetter.findOne({
      requestId: recommendationRequest._id
    }).sort({ version: -1 });

    return NextResponse.json({ 
      request: recommendationRequest,
      existingLetter 
    });
  } catch (error) {
    console.error('Error fetching recommendation request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recommendations/recipient/[token]/submit
 * Submit recommendation letter
 */
export async function POST(
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
    })
    .populate('recipientId', 'name email');

    if (!recommendationRequest) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 });
    }

    // Check if request is still valid
    if (recommendationRequest.status === 'cancelled') {
      return NextResponse.json({ error: 'Request has been cancelled' }, { status: 400 });
    }

    const body = await request.json();
    const { content, fileName, fileUrl, fileType, fileSize } = body;

    // Validate required fields - either content or file upload is required
    if (!content && !fileUrl) {
      return NextResponse.json(
        { error: 'Either letter content or file upload is required' },
        { status: 400 }
      );
    }

    // Create new letter
    const recommendationLetter = new RecommendationLetter({
      requestId: recommendationRequest._id,
      recipientId: recommendationRequest.recipientId._id,
      content,
      fileName,
      fileUrl,
      fileType,
      fileSize,
      submittedAt: new Date(),
      submittedBy: recommendationRequest.recipientId._id,
      isVerified: false,
      version: 1
    });

    await recommendationLetter.save();

    // Update request status
    recommendationRequest.status = 'received';
    recommendationRequest.receivedAt = new Date();
    await recommendationRequest.save();

    return NextResponse.json({ 
      message: 'Recommendation letter submitted successfully',
      letter: recommendationLetter 
    });
  } catch (error) {
    console.error('Error submitting recommendation letter:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}