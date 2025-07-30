import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';

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

    const application = await Application.findById(applicationId);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Return submission status based on existing fields
    const submissionStatus = {
      _id: application._id?.toString() || applicationId,
      applicationSubmitted: application.status === 'submitted' || application.status === 'under_review' || application.status === 'approved' || application.status === 'rejected' || application.status === 'waitlisted',
      submittedAt: application.submittedAt,
      submissionMethod: 'online', // Default for now
      confirmationNumber: '', // Not stored in current model
      confirmationEmail: '', // Not stored in current model
      submissionNotes: '', // Not stored in current model
      followUpRequired: false, // Not stored in current model
      followUpNotes: '', // Not stored in current model
      nextFollowUpDate: '', // Not stored in current model
      followUpCompleted: false, // Not stored in current model
      followUpHistory: [], // Not stored in current model
      createdAt: application.createdAt || new Date().toISOString(),
      updatedAt: application.updatedAt || new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      submissionStatus
    });
  } catch (error) {
    console.error('Error fetching submission status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch submission status' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: applicationId } = await params;
    const updates = await request.json();

    await connectDB();

    const updateData: any = {};

    if (updates.applicationSubmitted !== undefined) {
      if (updates.applicationSubmitted) {
        updateData.submittedAt = updates.submittedAt ? new Date(updates.submittedAt) : new Date();
        updateData.status = 'submitted';
      }
    }

    const application = await Application.findByIdAndUpdate(
      applicationId,
      updateData,
      { new: true }
    );

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Submission status updated successfully'
    });
  } catch (error) {
    console.error('Error updating submission status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update submission status' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const {
      applicationSubmitted,
      submittedAt,
      submissionMethod,
      confirmationNumber,
      followUpRequired,
      followUpNotes,
      nextFollowUpDate
    } = body;

    await connectDB();

    const updateData: any = {};

    if (applicationSubmitted) {
      updateData.submittedAt = submittedAt ? new Date(submittedAt) : new Date();
      updateData.status = 'submitted';
    }

    const application = await Application.findByIdAndUpdate(
      applicationId,
      updateData,
      { new: true }
    );

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Submission status updated successfully'
    });
  } catch (error) {
    console.error('Error updating submission status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update submission status' },
      { status: 500 }
    );
  }
} 