import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ProgressTracker } from '@/lib/services/progressTracker';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { activityType, metadata } = body;

    if (!activityType) {
      return NextResponse.json({ error: 'Activity type is required' }, { status: 400 });
    }

    // Get user ID from session
    const { User } = await import('@/models/User');
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Track the activity
    await ProgressTracker.trackActivity({
      userId: user._id.toString(),
      activityType,
      timestamp: new Date(),
      metadata
    });

    return NextResponse.json({ 
      message: 'Activity tracked successfully',
      activityType,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error tracking activity:', error);
    return NextResponse.json(
      { error: 'Failed to track activity' },
      { status: 500 }
    );
  }
}