import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { RequirementsService } from '@/lib/services/RequirementsService';
import { RequirementStatus } from '@/types/requirements';

/**
 * PUT /api/application-requirements/[id]/status
 * Update requirement status
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requirementId = params.id;
    if (!requirementId) {
      return NextResponse.json({ error: 'Requirement ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { status, notes } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Validate status
    const validStatuses: RequirementStatus[] = ['pending', 'in_progress', 'completed', 'waived', 'not_applicable'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const requirement = await RequirementsService.updateRequirementStatus(requirementId, status, notes);
    
    return NextResponse.json({
      success: true,
      data: requirement,
      message: 'Requirement status updated successfully'
    });
  } catch (error) {
    console.error('Error updating requirement status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update requirement status' },
      { status: 500 }
    );
  }
} 