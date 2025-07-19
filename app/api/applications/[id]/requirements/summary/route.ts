import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { RequirementsService } from '@/lib/services/RequirementsService';

/**
 * GET /api/applications/[id]/requirements/summary
 * Get requirements summary for an application
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const applicationId = params.id;
    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    const summary = await RequirementsService.getApplicationRequirementsSummary(applicationId);
    
    return NextResponse.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching requirements summary:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch requirements summary' },
      { status: 500 }
    );
  }
} 