import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import '@/models/index';
import UserSession from '@/models/UserSession';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Find sessions that haven't been updated in the last 30 minutes
    const cutoffTime = new Date(Date.now() - 30 * 60 * 1000);
    
    const oldSessions = await UserSession.find({
      isActive: true,
      updatedAt: { $lt: cutoffTime }
    });

    // End old sessions
    for (const session of oldSessions) {
      await session.endSession();
    }

    return NextResponse.json({
      success: true,
      endedSessions: oldSessions.length
    });

  } catch (error) {
    console.error('Session cleanup error:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup sessions' },
      { status: 500 }
    );
  }
}