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
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);
    const unreadOnly = searchParams.get('unread') === 'true';

    // Get user ID from session
    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ email: session.user.email }).select('_id updatedAt').lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ETag / Last-Modified support using latest notification timestamp
    const latest = await Notification.findOne({ userId: user._id }).sort({ updatedAt: -1 }).select({ updatedAt: 1, _id: 0 }).lean() as any;
    const latestTs = latest?.updatedAt ? new Date(latest.updatedAt).getTime() : 0;
    const lastModified = latestTs ? new Date(latestTs).toUTCString() : new Date(0).toUTCString();
    const etag = `W/"notif-${user._id}-${latestTs}"`;

    const ifNoneMatch = request.headers.get('if-none-match');
    const ifModifiedSince = request.headers.get('if-modified-since');
    if (ifNoneMatch === etag || (ifModifiedSince && new Date(ifModifiedSince).getTime() >= latestTs)) {
      return new NextResponse(null, { status: 304, headers: { ETag: etag, 'Last-Modified': lastModified } });
    }

    // Build query
    const query: any = { userId: user._id };
    if (unreadOnly) query.isRead = false;

    // Get notifications
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .select('type title message priority isRead createdAt content metadata')
      .lean();

    // Get counts
    const [totalCount, unreadCount] = await Promise.all([
      Notification.countDocuments(query),
      Notification.countDocuments({ userId: user._id, isRead: false })
    ]);

    const res = NextResponse.json({
      notifications,
      pagination: { total: totalCount, unread: unreadCount, limit, offset, hasMore: offset + limit < totalCount }
    });
    res.headers.set('ETag', etag);
    res.headers.set('Last-Modified', lastModified);
    res.headers.set('Cache-Control', 'private, max-age=60');
    return res;
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