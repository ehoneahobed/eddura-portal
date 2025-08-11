import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import '@/models/index';
import PageView from '@/models/PageView';
import { headers } from 'next/headers';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const limited = await rateLimit(request as any, 60, 60);
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
    
    // Create page view data
    const pageViewData = {
      userId: body.userId || null,
      sessionId: body.sessionId,
      pageUrl: body.pageUrl,
      pageTitle: body.pageTitle,
      pageType: body.pageType,
      visitTime: new Date(),
      timeOnPage: body.timeOnPage || 0,
      isBounce: body.isBounce || false,
      scrollDepth: body.scrollDepth || 0,
      interactions: [],
      userAgent,
      browser: browserInfo.browser,
      os: browserInfo.os,
      device: browserInfo.device,
      screenResolution: body.screenResolution,
      ipAddress,
      country: body.country,
      city: body.city,
      referrer: body.referrer,
      referrerDomain: body.referrerDomain,
      pageLoadTime: body.pageLoadTime,
      domContentLoaded: body.domContentLoaded
    };

    // Create new page view
    const pageView = new PageView(pageViewData);
    await pageView.save();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Page view tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track page view' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { sessionId, pageUrl, timeOnPage, scrollDepth, isBounce } = body;

    // Find the most recent page view for this session and URL
    const pageView = await PageView.findOne({
      sessionId,
      pageUrl
    }).sort({ visitTime: -1 });

    if (!pageView) {
      return NextResponse.json(
        { error: 'Page view not found' },
        { status: 404 }
      );
    }

    // Update page view metrics
    if (timeOnPage !== undefined) {
      pageView.timeOnPage = timeOnPage;
    }
    
    if (scrollDepth !== undefined) {
      pageView.scrollDepth = Math.max(pageView.scrollDepth, scrollDepth);
    }
    
    if (isBounce !== undefined) {
      pageView.isBounce = isBounce;
    }

    await pageView.save();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Page view update error:', error);
    return NextResponse.json(
      { error: 'Failed to update page view' },
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