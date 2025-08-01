import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import UserSession from '@/models/UserSession';
import PageView from '@/models/PageView';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.type !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has permission to view analytics
    if (!session.user.permissions?.includes("analytics:read")) {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await connectDB();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Get real-time active users (sessions active in the last 5 minutes)
    const realTimeActiveUsers = await UserSession.countDocuments({
      $or: [
        {
          updatedAt: { $gte: fiveMinutesAgo },
          isActive: true
        },
        {
          startTime: { $gte: fiveMinutesAgo },
          isActive: true
        }
      ]
    });

    // Get today's active users
    const todayActiveUsers = await UserSession.countDocuments({
      startTime: { $gte: today },
      isActive: true
    });

    // Get today's total sessions
    const todaySessions = await UserSession.countDocuments({
      startTime: { $gte: today }
    });

    // Get today's page views
    const todayPageViews = await PageView.countDocuments({
      visitTime: { $gte: today }
    });

    // Get hourly breakdown for today (using UTC for consistency)
    const hourlyData = [];
    for (let i = 0; i < 24; i++) {
      const hourStart = new Date(today);
      hourStart.setUTCHours(i, 0, 0, 0);
      const hourEnd = new Date(hourStart);
      hourEnd.setUTCHours(i + 1, 0, 0, 0);

      const [sessions, pageViews] = await Promise.all([
        UserSession.countDocuments({
          startTime: { $gte: hourStart, $lt: hourEnd }
        }),
        PageView.countDocuments({
          visitTime: { $gte: hourStart, $lt: hourEnd }
        })
      ]);

      hourlyData.push({
        hour: i,
        sessions,
        pageViews
      });
    }

    // Get current hour activity (using UTC for consistency)
    const currentHour = now.getUTCHours();
    const currentHourStart = new Date(today);
    currentHourStart.setUTCHours(currentHour, 0, 0, 0);
    const currentHourEnd = new Date(currentHourStart);
    currentHourEnd.setUTCHours(currentHour + 1, 0, 0, 0);

    const currentHourSessions = await UserSession.countDocuments({
      startTime: { $gte: currentHourStart, $lt: currentHourEnd }
    });

    const currentHourPageViews = await PageView.countDocuments({
      visitTime: { $gte: currentHourStart, $lt: currentHourEnd }
    });

    // Get recent sessions (last hour)
    const recentSessions = await UserSession.find({
      startTime: { $gte: oneHourAgo }
    })
    .sort({ startTime: -1 })
    .limit(10)
    .select('userId startTime userAgent browser device')
    .populate('userId', 'firstName lastName email')
    .lean();

    return NextResponse.json({
      realTimeActiveUsers,
      todayActiveUsers,
      todaySessions,
      todayPageViews,
      currentHourSessions,
      currentHourPageViews,
      hourlyData,
      recentSessions: recentSessions.map(session => ({
        id: session._id,
        user: session.userId ? `${(session.userId as any).firstName} ${(session.userId as any).lastName}` : 'Anonymous',
        email: session.userId ? (session.userId as any).email : null,
        startTime: session.startTime,
        browser: session.browser,
        device: session.device
      })),
      lastUpdated: now.toISOString()
    });
  } catch (error) {
    console.error('Real-time analytics error:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}