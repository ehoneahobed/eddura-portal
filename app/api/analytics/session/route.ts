import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import '@/models/index';
import UserSession from '@/models/UserSession';
import User from '@/models/User';
import Admin from '@/models/Admin';
import { headers } from 'next/headers';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const limited = await rateLimit(request as any, 30, 60); // 30 req/min per IP
    if (!limited.ok) return limited.response as any;

    await connectDB();
    
    const session = await auth();
    const headersList = await headers();
    
    // Get client information
    const userAgent = headersList.get('user-agent') || '';
    const ipAddress = headersList.get('x-forwarded-for') || 
                     headersList.get('x-real-ip') || 
                     'unknown';
    
    const body = await request.json();
    const { userId, adminId, referrer, entryPage } = body;
    const clientSessionId = body.sessionId as string | undefined;

    // If client provided a sessionId, reuse/update that exact session only
    if (clientSessionId) {
      const existingById = await UserSession.findOne({ sessionId: clientSessionId });
      if (existingById) {
        existingById.updatedAt = new Date();
        await existingById.save();
        return NextResponse.json({ sessionId: existingById.sessionId, success: true, reused: true });
      }
    }

    // For authenticated users, reuse only by exact user/admin, not anonymous nulls
    if (userId || adminId) {
      const existingSession = await UserSession.findOne({
        $or: [
          userId ? { userId } : { _id: null },
          adminId ? { adminId } : { _id: null }
        ],
        isActive: true,
        updatedAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) }
      });
      if (existingSession) {
        existingSession.updatedAt = new Date();
        await existingSession.save();
        return NextResponse.json({ sessionId: existingSession.sessionId, success: true, reused: true });
      }
    }

    // Generate or use provided session ID
    const sessionId = clientSessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Parse user agent for browser/OS info
    const browserInfo = parseUserAgent(userAgent);
    
    // Create session data
    const sessionData = {
      sessionId,
      userId: userId || null,
      adminId: adminId || null,
      startTime: new Date(),
      isActive: true,
      userAgent,
      browser: browserInfo.browser,
      browserVersion: browserInfo.browserVersion,
      os: browserInfo.os,
      device: browserInfo.device,
      screenResolution: body.screenResolution,
      ipAddress,
      country: body.country,
      city: body.city,
      timezone: body.timezone,
      referrer,
      entryPage: entryPage || '/',
      totalPages: 0,
      totalTimeOnSite: 0,
      averageTimePerPage: 0,
      bounceRate: false
    };

    const userSession = new UserSession(sessionData);
    await userSession.save();

    if (userId) {
      await User.findByIdAndUpdate(userId, { lastLoginAt: new Date(), $inc: { loginCount: 1 } });
    }
    if (adminId) {
      await Admin.findByIdAndUpdate(adminId, { lastLoginAt: new Date(), $inc: { loginCount: 1 } });
    }

    return NextResponse.json({ sessionId, success: true });

  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { sessionId, endTime, totalPages, totalTime } = body;

    const session = await UserSession.findOne({ sessionId });
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (endTime) {
      // End the session
      await session.endSession();
    } else if (totalPages !== undefined && totalTime !== undefined) {
      // Update session metrics
      await session.updateMetrics(totalPages, totalTime);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Session update error:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase();
  
  // Browser detection
  let browser = 'Unknown';
  let browserVersion = '';
  
  if (ua.includes('chrome')) {
    browser = 'Chrome';
    const match = ua.match(/chrome\/(\d+)/);
    browserVersion = match ? match[1] : '';
  } else if (ua.includes('firefox')) {
    browser = 'Firefox';
    const match = ua.match(/firefox\/(\d+)/);
    browserVersion = match ? match[1] : '';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
    const match = ua.match(/version\/(\d+)/);
    browserVersion = match ? match[1] : '';
  } else if (ua.includes('edge')) {
    browser = 'Edge';
    const match = ua.match(/edge\/(\d+)/);
    browserVersion = match ? match[1] : '';
  } else if (ua.includes('opera')) {
    browser = 'Opera';
    const match = ua.match(/opera\/(\d+)/);
    browserVersion = match ? match[1] : '';
  }

  // OS detection
  let os = 'Unknown';
  if (ua.includes('windows')) {
    os = 'Windows';
  } else if (ua.includes('mac')) {
    os = 'macOS';
  } else if (ua.includes('linux')) {
    os = 'Linux';
  } else if (ua.includes('android')) {
    os = 'Android';
  } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    os = 'iOS';
  }

  // Device detection
  let device = 'desktop';
  if (/android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    device = 'mobile';
  }

  return {
    browser,
    browserVersion,
    os,
    device
  };
}