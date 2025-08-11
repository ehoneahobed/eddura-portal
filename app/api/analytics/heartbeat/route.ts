import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import '@/models/index';
import UserSession from '@/models/UserSession';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const limited = await rateLimit(request as any, 30, 60);
    if (!limited.ok) return limited.response as any;

    // Forward to batch endpoint to unify pipeline
    const body = await request.json();
    const events = [{ type: 'heartbeat', payload: body }];
    const res = await fetch(new URL('/api/analytics/batch', request.url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events })
    });
    return new NextResponse(await res.text(), { status: res.status, headers: res.headers });

  } catch (error) {
    console.error('Heartbeat error:', error);
    return NextResponse.json(
      { error: 'Failed to update heartbeat' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const minutes = parseInt(searchParams.get('minutes') || '5');

    // Get active sessions in the last X minutes
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    
    const activeSessions = await UserSession.find({
      updatedAt: { $gte: cutoffTime },
      isActive: true
    }).populate('userId', 'firstName lastName email');

    const activeUsers = activeSessions.filter(session => session.userId).length;
    const anonymousUsers = activeSessions.filter(session => !session.userId).length;

    return NextResponse.json({
      activeSessions: activeSessions.length,
      activeUsers,
      anonymousUsers,
      sessions: activeSessions
    });

  } catch (error) {
    console.error('Active sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to get active sessions' },
      { status: 500 }
    );
  }
}