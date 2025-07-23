import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';

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
    const followUpData = await request.json();

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
      message: 'Follow-up added successfully',
      followUp: {
        _id: 'temp-followup-' + Date.now(),
        ...followUpData
      }
    });

  } catch (error) {
    console.error('Error adding follow-up:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add follow-up' },
      { status: 500 }
    );
  }
} 