import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import ScholarshipApplication from '@/models/ScholarshipApplication';
import { z } from 'zod';

// Validation schema for interview scheduling
const scheduleInterviewSchema = z.object({
  interviewDate: z.string().min(1, 'Interview date is required'),
  interviewType: z.enum(['in-person', 'virtual', 'phone'], {
    required_error: 'Interview type is required'
  }),
  interviewNotes: z.string().optional()
});

// POST /api/scholarship-applications/[id]/interview
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const body = await request.json();
    const validatedData = scheduleInterviewSchema.parse(body);

    // Find and update application with interview details
    const application = await ScholarshipApplication.findOneAndUpdate(
      {
        _id: id,
        userId: session.user.id
      },
      {
        interviewScheduled: true,
        interviewDate: new Date(validatedData.interviewDate),
        interviewType: validatedData.interviewType,
        interviewNotes: validatedData.interviewNotes,
        // Update status if not already submitted
        ...(validatedData.interviewType && { status: 'interviewed' })
      },
      { new: true, runValidators: true }
    )
    .populate('scholarshipId', 'name amount deadline requirements')
    .populate('applicationPackageId', 'name type');

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Interview scheduled successfully',
      application
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error scheduling interview:', error);
    return NextResponse.json(
      { error: 'Failed to schedule interview' },
      { status: 500 }
    );
  }
}

// PUT /api/scholarship-applications/[id]/interview
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const body = await request.json();
    const validatedData = scheduleInterviewSchema.partial().parse(body);

    // Build update object
    const updateData: any = {};
    if (validatedData.interviewDate) {
      updateData.interviewDate = new Date(validatedData.interviewDate);
    }
    if (validatedData.interviewType) {
      updateData.interviewType = validatedData.interviewType;
    }
    if (validatedData.interviewNotes !== undefined) {
      updateData.interviewNotes = validatedData.interviewNotes;
    }

    // Find and update application
    const application = await ScholarshipApplication.findOneAndUpdate(
      {
        _id: id,
        userId: session.user.id
      },
      updateData,
      { new: true, runValidators: true }
    )
    .populate('scholarshipId', 'name amount deadline requirements')
    .populate('applicationPackageId', 'name type');

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Interview updated successfully',
      application
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating interview:', error);
    return NextResponse.json(
      { error: 'Failed to update interview' },
      { status: 500 }
    );
  }
}

// DELETE /api/scholarship-applications/[id]/interview
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    // Remove interview details
    const application = await ScholarshipApplication.findOneAndUpdate(
      {
        _id: id,
        userId: session.user.id
      },
      {
        interviewScheduled: false,
        interviewDate: undefined,
        interviewType: undefined,
        interviewNotes: undefined
      },
      { new: true, runValidators: true }
    )
    .populate('scholarshipId', 'name amount deadline requirements')
    .populate('applicationPackageId', 'name type');

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Interview cancelled successfully',
      application
    });

  } catch (error) {
    console.error('Error cancelling interview:', error);
    return NextResponse.json(
      { error: 'Failed to cancel interview' },
      { status: 500 }
    );
  }
}