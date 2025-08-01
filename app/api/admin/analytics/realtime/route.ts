import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import UserSession from '@/models/UserSession';
import PageView from '@/models/PageView';

// Helper functions for device, browser, and OS data
async function getDeviceData(startDate: Date, endDate: Date) {
  const deviceStats = await UserSession.aggregate([
    {
      $match: {
        startTime: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$device',
        sessions: { $sum: 1 }
      }
    },
    {
      $sort: { sessions: -1 }
    }
  ]);

  const totalSessions = deviceStats.reduce((sum, device) => sum + device.sessions, 0);
  
  return deviceStats.map(device => ({
    device: device._id || 'Unknown',
    sessions: device.sessions,
    percentage: totalSessions > 0 ? Math.round((device.sessions / totalSessions) * 100) : 0
  }));
}

async function getBrowserData(startDate: Date, endDate: Date) {
  const browserStats = await UserSession.aggregate([
    {
      $match: {
        startTime: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$browser',
        sessions: { $sum: 1 }
      }
    },
    {
      $sort: { sessions: -1 }
    }
  ]);

  const totalSessions = browserStats.reduce((sum, browser) => sum + browser.sessions, 0);
  
  return browserStats.map(browser => ({
    browser: browser._id || 'Unknown',
    sessions: browser.sessions,
    percentage: totalSessions > 0 ? Math.round((browser.sessions / totalSessions) * 100) : 0
  }));
}

async function getOSData(startDate: Date, endDate: Date) {
  const osStats = await UserSession.aggregate([
    {
      $match: {
        startTime: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$os',
        sessions: { $sum: 1 }
      }
    },
    {
      $sort: { sessions: -1 }
    }
  ]);

  const totalSessions = osStats.reduce((sum, os) => sum + os.sessions, 0);
  
  return osStats.map(os => ({
    os: os._id || 'Unknown',
    sessions: os.sessions,
    percentage: totalSessions > 0 ? Math.round((os.sessions / totalSessions) * 100) : 0
  }));
}

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

    // Get device and browser data for today
    const deviceData = await getDeviceData(today, now);
    const browserData = await getBrowserData(today, now);
    const osData = await getOSData(today, now);

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
      deviceData,
      browserData,
      osData,
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