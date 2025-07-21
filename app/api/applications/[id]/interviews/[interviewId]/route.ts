import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import Interview from '@/models/Interview';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; interviewId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: applicationId, interviewId } = await params;
    const updates = await request.json();

    await connectDB();

    const application = await Application.findOne({
      _id: applicationId,
      userId: session.user.id
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Update the interview
    const interview = await Interview.findOneAndUpdate(
      { _id: interviewId, applicationId },
      { $set: updates },
      { new: true }
    );

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Interview updated successfully',
      interview: interview
    });

  } catch (error) {
    console.error('Error updating interview:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update interview' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; interviewId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: applicationId, interviewId } = await params;

    await connectDB();

    const application = await Application.findOne({
      _id: applicationId,
      userId: session.user.id
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Delete the interview
    const interview = await Interview.findOneAndDelete({ _id: interviewId, applicationId });

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Interview deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting interview:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete interview' },
      { status: 500 }
    );
  }
} 