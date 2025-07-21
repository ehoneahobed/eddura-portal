import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import ApplicationRequirement from '@/models/ApplicationRequirement';
import { RequirementsService } from '@/lib/services/RequirementsService';

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

    await connectDB();

    const requirements = await ApplicationRequirement.find({
      applicationId: applicationId,
      isActive: true
    }).populate('linkedDocumentId');

    return NextResponse.json({
      success: true,
      requirements: requirements
    });
  } catch (error) {
    console.error('Error fetching requirements:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch requirements' },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();
    
    // Create the requirement using the service
    const requirement = await RequirementsService.createRequirement({
      ...body,
      applicationId
    });

    return NextResponse.json({
      success: true,
      requirement: requirement
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating requirement:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create requirement' },
      { status: 500 }
    );
  }
}