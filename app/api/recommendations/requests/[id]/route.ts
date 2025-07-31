import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import RecommendationRequest from '@/models/RecommendationRequest';
import RecommendationLetter from '@/models/RecommendationLetter';
import Recipient from '@/models/Recipient';
import User from '@/models/User';

/**
 * GET /api/recommendations/requests/[id]
 * Get a specific recommendation request
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
    console.log('Session user email:', session.user.email);
    const user = await User.findOne({ email: session.user.email });
    console.log('User found:', user ? { id: user._id, email: user.email } : 'Not found');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get request
    console.log('Looking for request with ID:', resolvedParams.id);
    console.log('User ID:', user._id);
    console.log('User ID type:', typeof user._id);
    console.log('User ID string:', (user._id as any).toString());
    
    // First, let's check if the request exists at all
    const allRequests = await RecommendationRequest.find({ _id: resolvedParams.id });
    console.log('All requests with this ID:', allRequests.length);
    if (allRequests.length > 0) {
      console.log('Request student ID:', allRequests[0].studentId);
      console.log('Request student ID type:', typeof allRequests[0].studentId);
      console.log('Request student ID string:', allRequests[0].studentId.toString());
      console.log('User ID matches request student ID:', (user._id as any).toString() === allRequests[0].studentId.toString());
    }
    
    // For debugging, let's also try without the studentId filter
    const request = await RecommendationRequest.findOne({
      _id: resolvedParams.id,
      // studentId: user._id  // Temporarily commented out for debugging
    })
    .populate('recipientId', 'name email title institution department prefersDrafts')
    .populate('applicationId', 'title')
    .populate('scholarshipId', 'title');

    console.log('Request found:', request ? { id: request._id, title: request.title } : 'Not found');

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // If the request has been received, fetch the recommendation letter
    let recommendationLetter = null;
    if (request.status === 'received') {
      recommendationLetter = await RecommendationLetter.findOne({
        requestId: request._id
      }).sort({ version: -1 });
    }

    return NextResponse.json({ 
      request,
      recommendationLetter 
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
 * PUT /api/recommendations/requests/[id]
 * Update a recommendation request
 */
export async function PUT(
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

    const body = await request.json();
    const { 
      title, 
      description, 
      deadline, 
      priority, 
      includeDraft, 
      draftContent,
      reminderIntervals 
    } = body;

    // Get request
    const recommendationRequest = await RecommendationRequest.findOne({
      _id: resolvedParams.id,
      studentId: user._id as any
    });

    if (!recommendationRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Only allow updates if request hasn't been sent yet
    if (recommendationRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Cannot update request that has already been sent' },
        { status: 400 }
      );
    }

    // Update fields
    if (title) recommendationRequest.title = title;
    if (description) recommendationRequest.description = description;
    if (deadline) {
      const deadlineDate = new Date(deadline);
      if (deadlineDate <= new Date()) {
        return NextResponse.json(
          { error: 'Deadline must be in the future' },
          { status: 400 }
        );
      }
      recommendationRequest.deadline = deadlineDate;
    }
    if (priority) recommendationRequest.priority = priority;
    if (includeDraft !== undefined) recommendationRequest.includeDraft = includeDraft;
    if (draftContent !== undefined) recommendationRequest.draftContent = draftContent;
    if (reminderIntervals) {
      recommendationRequest.reminderIntervals = reminderIntervals;
      // Recalculate next reminder date
      const deadlineDate = new Date(recommendationRequest.deadline);
      const nextReminderDate = new Date(deadlineDate.getTime() - (reminderIntervals[0] * 24 * 60 * 60 * 1000));
      recommendationRequest.nextReminderDate = nextReminderDate;
    }

    await recommendationRequest.save();

    // Populate recipient info for response
    await recommendationRequest.populate('recipientId', 'name email title institution');

    return NextResponse.json({ request: recommendationRequest });
  } catch (error) {
    console.error('Error updating recommendation request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/recommendations/requests/[id]
 * Cancel a recommendation request
 */
export async function DELETE(
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

    // Only allow cancellation if request hasn't been received yet
    if (recommendationRequest.status === 'received') {
      return NextResponse.json(
        { error: 'Cannot cancel request that has already been received' },
        { status: 400 }
      );
    }

    // Cancel the request
    recommendationRequest.status = 'cancelled';
    await recommendationRequest.save();

    return NextResponse.json({ message: 'Request cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling recommendation request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}