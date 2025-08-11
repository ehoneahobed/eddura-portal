import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import '@/models/index';
import PageView from '@/models/PageView';
import UserEvent from '@/models/UserEvent';
import UserSession from '@/models/UserSession';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Basic rate limit: 60 requests/minute per IP
    const limited = await rateLimit(request, 60, 60);
    if (!limited.ok) return limited.response;

    await connectDB();
    const { events } = await request.json();

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ success: true, processed: 0 });
    }

    const pageViewOps: any[] = [];
    const eventOps: any[] = [];
    const heartbeatOps: any[] = [];

    for (const item of events) {
      if (!item || !item.type) continue;
      switch (item.type) {
        case 'pageview':
          pageViewOps.push({ insertOne: { document: new PageView(item.payload) } });
          break;
        case 'event':
          eventOps.push({ insertOne: { document: new UserEvent(item.payload) } });
          break;
        case 'heartbeat':
          heartbeatOps.push({
            updateOne: {
              filter: { sessionId: item.payload.sessionId },
              update: { $set: { updatedAt: new Date(), isActive: true } },
              upsert: false,
            },
          });
          break;
        default:
          break;
      }
    }

    const results: any = {};
    if (pageViewOps.length) results.pageViews = await PageView.bulkWrite(pageViewOps, { ordered: false });
    if (eventOps.length) results.events = await UserEvent.bulkWrite(eventOps, { ordered: false });
    if (heartbeatOps.length) results.heartbeats = await UserSession.bulkWrite(heartbeatOps, { ordered: false });

    return NextResponse.json({ success: true, counts: {
      pageViews: pageViewOps.length,
      events: eventOps.length,
      heartbeats: heartbeatOps.length,
    }});
  } catch (error) {
    console.error('Analytics batch error:', error);
    return NextResponse.json({ error: 'Failed to process analytics batch' }, { status: 500 });
  }
}