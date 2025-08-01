import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import '@/models/index';
import UserSession from '@/models/UserSession';
import User from '@/models/User';
import Admin from '@/models/Admin';

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

    // Get active sessions - use a more lenient filter
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    
    // First try with updatedAt filter
    let activeSessions = await UserSession.find({
      updatedAt: { $gte: cutoffTime },
      isActive: true,
      userId: { $exists: true, $ne: null } // Only logged-in users
    }).populate('userId', 'firstName lastName email isEmailVerified lastLoginAt loginCount');

    let activeAdminSessions = await UserSession.find({
      updatedAt: { $gte: cutoffTime },
      isActive: true,
      adminId: { $exists: true, $ne: null } // Admin sessions
    }).populate('adminId', 'firstName lastName email role isEmailVerified lastLoginAt loginCount');

    // If no sessions found, try without the updatedAt filter
    if (activeSessions.length === 0 && activeAdminSessions.length === 0) {
      activeSessions = await UserSession.find({
        isActive: true,
        userId: { $exists: true, $ne: null }
      }).populate('userId', 'firstName lastName email isEmailVerified lastLoginAt loginCount');

      activeAdminSessions = await UserSession.find({
        isActive: true,
        adminId: { $exists: true, $ne: null }
      }).populate('adminId', 'firstName lastName email role isEmailVerified lastLoginAt loginCount');
    }

    // Also end sessions that are too old (cleanup)
    const oldCutoffTime = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes
    const oldSessions = await UserSession.find({
      isActive: true,
      updatedAt: { $lt: oldCutoffTime }
    });

    // End old sessions in background
    if (oldSessions.length > 0) {
      oldSessions.forEach(async (session) => {
        try {
          await session.endSession();
        } catch (error) {
          console.error('Failed to end old session:', error);
        }
      });
    }

    // Process user sessions and deduplicate by user
    const userSessionMap = new Map();
    activeSessions.forEach(session => {
      const user = session.userId as any;
      const userId = user._id.toString();
      const sessionDuration = session.startTime ? 
        Math.floor((new Date().getTime() - session.startTime.getTime()) / 1000) : 0;
      
      const userSession = {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        type: 'user' as const,
        role: undefined,
        sessionId: session.sessionId,
        sessionStartTime: session.startTime,
        sessionDuration: sessionDuration,
        sessionDurationFormatted: formatDuration(sessionDuration),
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount,
        isEmailVerified: user.isEmailVerified,
        device: session.device,
        browser: session.browser,
        os: session.os,
        ipAddress: session.ipAddress,
        country: session.country,
        city: session.city,
        totalPages: session.totalPages,
        totalTimeOnSite: session.totalTimeOnSite
      };

      // Keep the most recent session for each user
      if (!userSessionMap.has(userId) || 
          session.startTime > userSessionMap.get(userId).sessionStartTime) {
        userSessionMap.set(userId, userSession);
      }
    });

    // Process admin sessions and deduplicate by admin
    const adminSessionMap = new Map();
    activeAdminSessions.forEach(session => {
      const admin = session.adminId as any;
      const adminId = admin._id.toString();
      const sessionDuration = session.startTime ? 
        Math.floor((new Date().getTime() - session.startTime.getTime()) / 1000) : 0;
      
      const adminSession = {
        id: admin._id,
        name: `${admin.firstName} ${admin.lastName}`,
        email: admin.email,
        type: 'admin' as const,
        role: admin.role,
        sessionId: session.sessionId,
        sessionStartTime: session.startTime,
        sessionDuration: sessionDuration,
        sessionDurationFormatted: formatDuration(sessionDuration),
        lastLoginAt: admin.lastLoginAt,
        loginCount: admin.loginCount,
        isEmailVerified: admin.isEmailVerified,
        device: session.device,
        browser: session.browser,
        os: session.os,
        ipAddress: session.ipAddress,
        country: session.country,
        city: session.city,
        totalPages: session.totalPages,
        totalTimeOnSite: session.totalTimeOnSite
      };

      // Keep the most recent session for each admin
      if (!adminSessionMap.has(adminId) || 
          session.startTime > adminSessionMap.get(adminId).sessionStartTime) {
        adminSessionMap.set(adminId, adminSession);
      }
    });

    // Combine unique sessions and sort by session duration (longest first)
    const allActiveUsers = [...Array.from(userSessionMap.values()), ...Array.from(adminSessionMap.values())]
      .sort((a, b) => b.sessionDuration - a.sessionDuration);

    // Calculate summary statistics
    const totalActiveUsers = allActiveUsers.length;
    const totalUsers = userSessionMap.size;
    const totalAdmins = adminSessionMap.size;
    const averageSessionDuration = totalActiveUsers > 0 ? 
      allActiveUsers.reduce((sum, user) => sum + user.sessionDuration, 0) / totalActiveUsers : 0;

    return NextResponse.json({
      success: true,
      data: {
        activeUsers: allActiveUsers,
        summary: {
          totalActiveUsers,
          totalUsers,
          totalAdmins,
          averageSessionDuration: Math.floor(averageSessionDuration),
          averageSessionDurationFormatted: formatDuration(Math.floor(averageSessionDuration)),
          cutoffTime,
          minutes
        }
      }
    });

  } catch (error) {
    console.error('Active users error:', error);
    return NextResponse.json(
      { error: 'Failed to get active users' },
      { status: 500 }
    );
  }
}

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}