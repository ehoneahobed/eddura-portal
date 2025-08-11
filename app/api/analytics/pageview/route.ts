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
    // Forward to batch endpoint to unify pipeline
    const body = await request.json();
    const events = [{ type: 'pageview', payload: body }];
    const res = await fetch(new URL('/api/analytics/batch', request.url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', dnt: request.headers.get('dnt') || '' },
      body: JSON.stringify({ events })
    });
    return new NextResponse(await res.text(), { status: res.status, headers: res.headers });
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