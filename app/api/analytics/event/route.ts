import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import '@/models/index';
import UserEvent from '@/models/UserEvent';
import { headers } from 'next/headers';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const limited = await rateLimit(request as any, 120, 60); // Allow more but still bounded
    if (!limited.ok) return limited.response as any;
    await connectDB();
    
    const headersList = await headers();
    const body = await request.json();
    
    // Get client information
    const userAgent = headersList.get('user-agent') || '';
    const ipAddress = headersList.get('x-forwarded-for') || 
                     headersList.get('x-real-ip') || 
                     'unknown';

    // Parse user agent for browser/OS info
    const browserInfo = parseUserAgent(userAgent);
    
    // Create event data
    const eventData = {
      userId: body.userId || null,
      sessionId: body.sessionId,
      eventType: body.eventType,
      eventCategory: body.eventCategory,
      eventName: body.eventName,
      eventData: body.eventData || null,
      pageUrl: body.pageUrl,
      pageTitle: body.pageTitle,
      userType: body.userType || 'anonymous',
      userRole: body.userRole || null,
      userAgent,
      browser: browserInfo.browser,
      os: browserInfo.os,
      device: browserInfo.device,
      ipAddress,
      country: body.country,
      city: body.city,
      eventTime: new Date()
    };

    // Create new event
    const userEvent = new UserEvent(eventData);
    await userEvent.save();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Event tracking error:', error);
    // Return success even on error to prevent frontend issues
    return NextResponse.json({ success: true, error: 'Event tracking failed but continuing' });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const eventType = searchParams.get('eventType');
    const eventCategory = searchParams.get('eventCategory');

    // Build query
    const query: any = {};
    
    if (startDate && endDate) {
      query.eventTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (eventType) {
      query.eventType = eventType;
    }
    
    if (eventCategory) {
      query.eventCategory = eventCategory;
    }

    // Get events with pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const events = await UserEvent.find(query)
      .sort({ eventTime: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'firstName lastName email');

    const total = await UserEvent.countDocuments(query);

    return NextResponse.json({
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Event retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve events' },
      { status: 500 }
    );
  }
}

function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase();
  
  // Browser detection
  let browser = 'Unknown';
  
  if (ua.includes('chrome')) {
    browser = 'Chrome';
  } else if (ua.includes('firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
  } else if (ua.includes('edge')) {
    browser = 'Edge';
  } else if (ua.includes('opera')) {
    browser = 'Opera';
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
    os,
    device
  };
}