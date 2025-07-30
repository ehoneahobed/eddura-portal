import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { RequirementsService } from '@/lib/services/RequirementsService';

/**
 * GET /api/applications/[id]/requirements/progress
 * Get requirements progress for an application
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: applicationId } = await params;
    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    const summary = await RequirementsService.getApplicationRequirementsSummary(applicationId);
    
    // Transform the data to match the frontend expectations
    const progress = {
      total: summary.totalRequirements,
      completed: summary.completedRequirements,
      required: summary.requiredRequirements,
      requiredCompleted: summary.completedRequiredRequirements,
      optional: summary.optionalRequirements,
      optionalCompleted: summary.completedOptionalRequirements,
      percentage: summary.progressPercentage,
      requiredPercentage: summary.requiredRequirements > 0 
        ? Math.round((summary.completedRequiredRequirements / summary.requiredRequirements) * 100) 
        : 0,
      byCategory: summary.requirementsByCategory || {
        academic: { total: 0, completed: 0 },
        financial: { total: 0, completed: 0 },
        personal: { total: 0, completed: 0 },
        professional: { total: 0, completed: 0 },
        administrative: { total: 0, completed: 0 }
      },
      byStatus: {} as { [key: string]: number }
    };

    // Calculate byStatus from the requirements
    const requirements = await RequirementsService.getRequirementsByApplication(applicationId);
    requirements.forEach(req => {
      progress.byStatus[req.status] = (progress.byStatus[req.status] || 0) + 1;
    });
    
    return NextResponse.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error fetching requirements progress:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch requirements progress' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/applications/[id]/requirements/progress
 * Update requirements progress for an application
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

    const { id: applicationId } = await params;
    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    await RequirementsService.updateApplicationProgress(applicationId);
    
    return NextResponse.json({
      success: true,
      message: 'Application progress updated successfully'
    });
  } catch (error) {
    console.error('Error updating application progress:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update application progress' },
      { status: 500 }
    );
  }
} 