import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// GET /api/admin/settings - Get admin settings
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.type !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Return default settings for now
    const settings = {
      notifications: {
        email: true,
        system: true,
        marketing: false
      },
      security: {
        twoFactorEnabled: false,
        sessionTimeout: 30, // minutes
        passwordExpiry: 90 // days
      },
      display: {
        darkMode: false,
        compactMode: false,
        language: 'en'
      },
      system: {
        maintenanceMode: false,
        debugMode: process.env.NODE_ENV === 'development'
      }
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings - Update admin settings
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.type !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // For now, just return success
    // In the future, this would save settings to database
    return NextResponse.json({ 
      message: 'Settings updated successfully',
      settings: body 
    });
  } catch (error) {
    console.error('Error updating admin settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 