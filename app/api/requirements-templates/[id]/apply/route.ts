import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { RequirementsTemplateService } from '@/lib/services/RequirementsTemplateService';

/**
 * POST /api/requirements-templates/[id]/apply
 * Apply a template to an application
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: templateId } = await params;
    if (!templateId) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { applicationId } = body;

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    await RequirementsTemplateService.applyTemplateToApplication(templateId, applicationId);
    
    return NextResponse.json({
      success: true,
      message: 'Template applied to application successfully'
    });
  } catch (error) {
    console.error('Error applying template:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to apply template' },
      { status: 500 }
    );
  }
} 