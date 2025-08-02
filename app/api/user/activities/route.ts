import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import UserActivity from '@/models/UserActivity';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');

    // Build query
    const query: any = { userId: session.user.id };
    if (type) {
      query.type = type;
    }

    // Get user activities
    const activities = await UserActivity.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    // Transform activities for frontend
    const transformedActivities = activities.map(activity => ({
      id: activity._id.toString(),
      type: activity.type,
      title: activity.title,
      description: activity.description,
      timestamp: activity.timestamp,
      metadata: activity.metadata || {}
    }));

    return NextResponse.json({
      activities: transformedActivities,
      total: transformedActivities.length
    });
  } catch (error) {
    console.error('Error fetching user activities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { type, title, description, metadata } = body;

    // Validate required fields
    if (!type || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new activity
    const activity = new UserActivity({
      userId: session.user.id,
      type,
      title,
      description,
      metadata: metadata || {},
      timestamp: new Date()
    });

    await activity.save();

    return NextResponse.json({
      message: 'Activity logged successfully',
      activity: {
        id: activity._id.toString(),
        type: activity.type,
        title: activity.title,
        description: activity.description,
        timestamp: activity.timestamp,
        metadata: activity.metadata
      }
    });
  } catch (error) {
    console.error('Error logging user activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}