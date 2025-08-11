import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import UserSession from '@/models/UserSession';
import PageView from '@/models/PageView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 60; // keep connections short-lived on serverless

async function buildSnapshot() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const [realTimeActiveUsers, todayActiveUsers, todaySessions, todayPageViews] = await Promise.all([
    UserSession.countDocuments({
      $or: [
        { updatedAt: { $gte: fiveMinutesAgo }, isActive: true },
        { startTime: { $gte: fiveMinutesAgo }, isActive: true }
      ]
    }),
    UserSession.countDocuments({ startTime: { $gte: today }, isActive: true }),
    UserSession.countDocuments({ startTime: { $gte: today } }),
    PageView.countDocuments({ visitTime: { $gte: today } })
  ]);

  // Hourly data (UTC)
  const hourlyData: Array<{ hour: number; sessions: number; pageViews: number }> = [];
  for (let i = 0; i < 24; i++) {
    const hourStart = new Date(today);
    hourStart.setUTCHours(i, 0, 0, 0);
    const hourEnd = new Date(hourStart);
    hourEnd.setUTCHours(i + 1, 0, 0, 0);

    const [sessions, pageViews] = await Promise.all([
      UserSession.countDocuments({ startTime: { $gte: hourStart, $lt: hourEnd } }),
      PageView.countDocuments({ visitTime: { $gte: hourStart, $lt: hourEnd } })
    ]);
    hourlyData.push({ hour: i, sessions, pageViews });
  }

  const currentHour = now.getUTCHours();
  const currentHourStart = new Date(today);
  currentHourStart.setUTCHours(currentHour, 0, 0, 0);
  const currentHourEnd = new Date(currentHourStart);
  currentHourEnd.setUTCHours(currentHour + 1, 0, 0, 0);

  const [currentHourSessions, currentHourPageViews] = await Promise.all([
    UserSession.countDocuments({ startTime: { $gte: currentHourStart, $lt: currentHourEnd } }),
    PageView.countDocuments({ visitTime: { $gte: currentHourStart, $lt: currentHourEnd } })
  ]);

  const recentSessions = await UserSession.find({ startTime: { $gte: oneHourAgo } })
    .sort({ startTime: -1 })
    .limit(10)
    .select('userId startTime userAgent browser device')
    .populate('userId', 'firstName lastName email')
    .lean();

  return {
    realTimeActiveUsers,
    todayActiveUsers,
    todaySessions,
    todayPageViews,
    currentHourSessions,
    currentHourPageViews,
    hourlyData,
    recentSessions: recentSessions.map((session: any) => ({
      id: session._id,
      user: session.userId ? `${session.userId.firstName} ${session.userId.lastName}` : 'Anonymous',
      email: session.userId ? session.userId.email : null,
      startTime: session.startTime,
      browser: session.browser,
      device: session.device,
    })),
    lastUpdated: now.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.type !== 'admin' || !session.user.permissions?.includes('analytics:read')) {
    return new Response('Unauthorized', { status: 401 });
  }

  await connectDB();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      try {
        // Send initial snapshot
        const snap = await buildSnapshot();
        send(snap);
      } catch (e) {}

      // Push updates every 60s within the maxDuration window
      const interval = setInterval(async () => {
        try {
          const data = await buildSnapshot();
          send(data);
        } catch (e) {
          // noop
        }
      }, 60000);

      const close = () => {
        clearInterval(interval);
        try { controller.close(); } catch {}
      };

      // Close after maxDuration - 2s to respect platform limits
      const timeout = setTimeout(close, (maxDuration as number) * 1000 - 2000);

      // Abort support
      // @ts-ignore
      request.signal?.addEventListener('abort', () => { clearInterval(interval); clearTimeout(timeout); });
    },
    cancel() {},
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Transfer-Encoding': 'chunked',
    },
  });
}