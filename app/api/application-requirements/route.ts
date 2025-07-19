import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { RequirementsService } from '@/lib/services/RequirementsService';
import { CreateRequirementData, RequirementsQueryOptions } from '@/types/requirements';

/**
 * GET /api/application-requirements
 * Get requirements for an application with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');
    
    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    // Build query options
    const options: RequirementsQueryOptions = {
      filters: {
        status: searchParams.getAll('status') as any,
        category: searchParams.getAll('category') as any,
        requirementType: searchParams.getAll('requirementType') as any,
        isRequired: searchParams.get('isRequired') === 'true' ? true : 
                   searchParams.get('isRequired') === 'false' ? false : undefined,
        isOptional: searchParams.get('isOptional') === 'true' ? true : 
                   searchParams.get('isOptional') === 'false' ? false : undefined
      },
      sortBy: searchParams.get('sortBy') as any || 'order',
      sortOrder: searchParams.get('sortOrder') as 'asc' | 'desc' || 'asc',
      limit: parseInt(searchParams.get('limit') || '100'),
      offset: parseInt(searchParams.get('offset') || '0')
    };

    const requirements = await RequirementsService.getRequirementsByApplication(applicationId, options);
    
    return NextResponse.json({
      success: true,
      data: requirements,
      count: requirements.length
    });
  } catch (error) {
    console.error('Error fetching requirements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requirements' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/application-requirements
 * Create a new requirement
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateRequirementData = await request.json();

    // Validate required fields
    if (!body.applicationId || !body.name || !body.requirementType || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields: applicationId, name, requirementType, category' },
        { status: 400 }
      );
    }

    const requirement = await RequirementsService.createRequirement(body);
    
    return NextResponse.json({
      success: true,
      data: requirement,
      message: 'Requirement created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating requirement:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create requirement' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/application-requirements
 * Bulk update requirements
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { requirementIds, updateData } = body;

    if (!requirementIds || !Array.isArray(requirementIds) || requirementIds.length === 0) {
      return NextResponse.json(
        { error: 'Requirement IDs array is required' },
        { status: 400 }
      );
    }

    if (!updateData || typeof updateData !== 'object') {
      return NextResponse.json(
        { error: 'Update data is required' },
        { status: 400 }
      );
    }

    await RequirementsService.bulkUpdateRequirements(requirementIds, updateData);
    
    return NextResponse.json({
      success: true,
      message: 'Requirements updated successfully'
    });
  } catch (error) {
    console.error('Error bulk updating requirements:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update requirements' },
      { status: 500 }
    );
  }
} 