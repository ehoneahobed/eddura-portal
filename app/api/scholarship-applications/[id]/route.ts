import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import ScholarshipApplication from '@/models/ScholarshipApplication';
import { z } from 'zod';

// Validation schema for updates
const updateScholarshipApplicationSchema = z.object({
  status: z.enum(['draft', 'submitted', 'under_review', 'interviewed', 'awarded', 'rejected']).optional(),
  formResponses: z.array(z.object({
    questionId: z.string(),
    answer: z.string(),
    attachments: z.array(z.string()).optional()
  })).optional(),
  interviewScheduled: z.boolean().optional(),
  interviewDate: z.string().optional(),
  interviewType: z.enum(['in-person', 'virtual', 'phone']).optional(),
  interviewNotes: z.string().optional(),
  awardAmount: z.number().optional(),
  awardCurrency: z.string().optional(),
  awardConditions: z.string().optional(),
  notes: z.string().optional()
});

// GET /api/scholarship-applications/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const application = await ScholarshipApplication.findOne({
      _id: id,
      userId: session.user.id
    })
    .populate('scholarshipId', 'name amount deadline requirements description eligibilityCriteria')
    .populate('applicationPackageId', 'name type documents')
    .lean();

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json(application);

  } catch (error) {
    console.error('Error fetching scholarship application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scholarship application' },
      { status: 500 }
    );
  }
}

// PUT /api/scholarship-applications/[id]
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
    await connectDB();

    const body = await request.json();
    const validatedData = updateScholarshipApplicationSchema.parse(body);

    // Find and update application
    const application = await ScholarshipApplication.findOneAndUpdate(
      {
        _id: id,
        userId: session.user.id
      },
      {
        ...validatedData,
        // Handle date conversion
        ...(validatedData.interviewDate && {
          interviewDate: new Date(validatedData.interviewDate)
        })
      },
      { new: true, runValidators: true }
    )
    .populate('scholarshipId', 'name amount deadline requirements')
    .populate('applicationPackageId', 'name type');

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json(application);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating scholarship application:', error);
    return NextResponse.json(
      { error: 'Failed to update scholarship application' },
      { status: 500 }
    );
  }
}

// DELETE /api/scholarship-applications/[id]
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
    await connectDB();

    const application = await ScholarshipApplication.findOneAndDelete({
      _id: id,
      userId: session.user.id
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Application deleted successfully' });

  } catch (error) {
    console.error('Error deleting scholarship application:', error);
    return NextResponse.json(
      { error: 'Failed to delete scholarship application' },
      { status: 500 }
    );
  }
}