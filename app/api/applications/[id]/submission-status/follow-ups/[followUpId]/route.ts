import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; followUpId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: applicationId, followUpId } = await params;
    const updates = await request.json();

    await connectDB();

    const application = await Application.findOne({
      _id: applicationId,
      userId: session.user.id
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // For now, return success - this will be enhanced when we add follow-up model
    return NextResponse.json({
      success: true,
      message: 'Follow-up updated successfully',
      followUp: {
        _id: followUpId,
        ...updates
      }
    });

  } catch (error) {
    console.error('Error updating follow-up:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update follow-up' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; followUpId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: applicationId, followUpId } = await params;

    await connectDB();

    const application = await Application.findOne({
      _id: applicationId,
      userId: session.user.id
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // For now, return success - this will be enhanced when we add follow-up model
    return NextResponse.json({
      success: true,
      message: 'Follow-up deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting follow-up:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete follow-up' },
      { status: 500 }
    );
  }
} 