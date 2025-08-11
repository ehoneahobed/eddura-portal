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
    
    // Backward-compatible: forward to batch endpoint to unify pipeline
    const body = await request.json();
    const events = [{ type: 'event', payload: body }];
    const res = await fetch(new URL('/api/analytics/batch', request.url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', dnt: request.headers.get('dnt') || '' },
      body: JSON.stringify({ events })
    });
    return new NextResponse(await res.text(), { status: res.status, headers: res.headers });
  } catch (error) {
    console.error('Event tracking error:', error);
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