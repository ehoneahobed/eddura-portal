import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { RequirementsService } from '@/lib/services/RequirementsService';
import { UpdateRequirementData } from '@/types/requirements';

/**
 * GET /api/application-requirements/[id]
 * Get a specific requirement by ID
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

    const { id: requirementId } = await params;
    if (!requirementId) {
      return NextResponse.json({ error: 'Requirement ID is required' }, { status: 400 });
    }

    const requirement = await RequirementsService.getRequirementById(requirementId);
    
    if (!requirement) {
      return NextResponse.json({ error: 'Requirement not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: requirement
    });
  } catch (error) {
    console.error('Error fetching requirement:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requirement' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/application-requirements/[id]
 * Update a specific requirement
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: requirementId } = await params;
    const body: UpdateRequirementData = await request.json();

    const requirement = await RequirementsService.updateRequirement(requirementId, body);
    
    return NextResponse.json({
      success: true,
      data: requirement,
      message: 'Requirement updated successfully'
    });
  } catch (error) {
    console.error('Error updating requirement:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update requirement' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/application-requirements/[id]
 * Delete a specific requirement
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: requirementId } = await params;

    await RequirementsService.deleteRequirement(requirementId);
    
    return NextResponse.json({
      success: true,
      message: 'Requirement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting requirement:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete requirement' },
      { status: 500 }
    );
  }
} 