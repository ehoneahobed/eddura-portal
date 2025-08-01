import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import '@/models/index';
import UserSession from '@/models/UserSession';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await auth();
    if (!session?.user || session.user.type !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const minutes = parseInt(searchParams.get('minutes') || '5');

    // Get all sessions for debugging
    const allSessions = await UserSession.find({}).populate('userId', 'firstName lastName email').populate('adminId', 'firstName lastName email role');
    
    // Get active sessions in the last X minutes
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    
    const activeSessions = await UserSession.find({
      updatedAt: { $gte: cutoffTime },
      isActive: true,
      userId: { $exists: true, $ne: null }
    }).populate('userId', 'firstName lastName email isEmailVerified lastLoginAt loginCount');

    const activeAdminSessions = await UserSession.find({
      updatedAt: { $gte: cutoffTime },
      isActive: true,
      adminId: { $exists: true, $ne: null }
    }).populate('adminId', 'firstName lastName email role isEmailVerified lastLoginAt loginCount');

    // Get sessions without the updatedAt filter
    const allActiveSessions = await UserSession.find({
      isActive: true,
      userId: { $exists: true, $ne: null }
    }).populate('userId', 'firstName lastName email');

    const allActiveAdminSessions = await UserSession.find({
      isActive: true,
      adminId: { $exists: true, $ne: null }
    }).populate('adminId', 'firstName lastName email role');

    return NextResponse.json({
      success: true,
      debug: {
        totalSessions: allSessions.length,
        cutoffTime: cutoffTime.toISOString(),
        minutes,
        activeSessions: activeSessions.length,
        activeAdminSessions: activeAdminSessions.length,
        allActiveSessions: allActiveSessions.length,
        allActiveAdminSessions: allActiveAdminSessions.length,
        sessions: allSessions.map(s => ({
          sessionId: s.sessionId,
          userId: s.userId,
          adminId: s.adminId,
          isActive: s.isActive,
          startTime: s.startTime,
          updatedAt: s.updatedAt,
          user: s.userId ? {
            name: `${s.userId.firstName} ${s.userId.lastName}`,
            email: s.userId.email
          } : null,
          admin: s.adminId ? {
            name: `${s.adminId.firstName} ${s.adminId.lastName}`,
            email: s.adminId.email,
            role: s.adminId.role
          } : null
        }))
      }
    });

  } catch (error) {
    console.error('Debug sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to debug sessions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}