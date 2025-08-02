import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import Notification from '@/models/Notification';
import connectDB from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const unreadOnly = searchParams.get('unread') === 'true';

    // Get user ID from session
    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build query
    const query: any = { userId: user._id };
    if (unreadOnly) {
      query.isRead = false;
    }

    // Get notifications
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .populate('content.squadId', 'name')
      .populate('content.memberId', 'firstName lastName');

    // Get total count
    const totalCount = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId: user._id, isRead: false });

    return NextResponse.json({
      notifications,
      pagination: {
        total: totalCount,
        unread: unreadCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { action, notificationId } = body;

    // Get user ID from session
    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (action === 'markAsRead' && notificationId) {
      await Notification.findOneAndUpdate(
        { _id: notificationId, userId: user._id },
        { isRead: true, readAt: new Date() }
      );
    } else if (action === 'markAllAsRead') {
      await Notification.updateMany(
        { userId: user._id, isRead: false },
        { isRead: true, readAt: new Date() }
      );
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}