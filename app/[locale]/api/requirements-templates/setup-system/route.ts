import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { RequirementsTemplateService } from '@/lib/services/RequirementsTemplateService';
import connectDB from '@/lib/mongodb';

/**
 * POST /api/requirements-templates/setup-system
 * Setup system templates (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();
    
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.type !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await RequirementsTemplateService.createSystemTemplates();
    
    return NextResponse.json({
      success: true,
      message: 'System templates created successfully'
    });
  } catch (error) {
    console.error('Error setting up system templates:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to setup system templates' },
      { status: 500 }
    );
  }
} 