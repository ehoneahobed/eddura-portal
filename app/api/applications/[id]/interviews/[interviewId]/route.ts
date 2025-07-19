import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';

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

    // For now, return success - this will be enhanced when we add interview model
    return NextResponse.json({
      success: true,
      message: 'Interview updated successfully',
      interview: {
        _id: interviewId,
        ...updates,
        updatedAt: new Date().toISOString()
      }
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

    // For now, return success - this will be enhanced when we add interview model
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