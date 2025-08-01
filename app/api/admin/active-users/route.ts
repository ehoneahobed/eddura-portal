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

    // Get active sessions in the last X minutes
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    
    const activeSessions = await UserSession.find({
      updatedAt: { $gte: cutoffTime },
      isActive: true,
      userId: { $exists: true, $ne: null } // Only logged-in users
    }).populate('userId', 'firstName lastName email isEmailVerified lastLoginAt loginCount');

    // Get active admin sessions
    const activeAdminSessions = await UserSession.find({
      updatedAt: { $gte: cutoffTime },
      isActive: true,
      adminId: { $exists: true, $ne: null } // Admin sessions
    }).populate('adminId', 'firstName lastName email role isEmailVerified lastLoginAt loginCount');

    // Process user sessions
    const activeUsers = activeSessions.map(session => {
      const user = session.userId as any;
      const sessionDuration = session.startTime ? 
        Math.floor((new Date().getTime() - session.startTime.getTime()) / 1000) : 0;
      
      return {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        type: 'user',
        sessionId: session.sessionId,
        sessionStartTime: session.startTime,
        sessionDuration: sessionDuration, // in seconds
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
    });

    // Process admin sessions
    const activeAdmins = activeAdminSessions.map(session => {
      const admin = session.adminId as any;
      const sessionDuration = session.startTime ? 
        Math.floor((new Date().getTime() - session.startTime.getTime()) / 1000) : 0;
      
      return {
        id: admin._id,
        name: `${admin.firstName} ${admin.lastName}`,
        email: admin.email,
        type: 'admin',
        role: admin.role,
        sessionId: session.sessionId,
        sessionStartTime: session.startTime,
        sessionDuration: sessionDuration, // in seconds
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
    });

    // Combine and sort by session duration (longest first)
    const allActiveUsers = [...activeUsers, ...activeAdmins].sort((a, b) => b.sessionDuration - a.sessionDuration);

    // Calculate summary statistics
    const totalActiveUsers = allActiveUsers.length;
    const totalUsers = activeUsers.length;
    const totalAdmins = activeAdmins.length;
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