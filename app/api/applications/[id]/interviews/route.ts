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

    const application = await Application.findOne({
      _id: applicationId,
      userId: session.user.id
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // For now, return empty interviews array - this will be enhanced when we add interview model
    return NextResponse.json({
      success: true,
      interviews: []
    });

  } catch (error) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch interviews' },
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
    const interviewData = await request.json();

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
      message: 'Interview scheduled successfully',
      interview: {
        _id: 'temp-id-' + Date.now(),
        ...interviewData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error creating interview:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create interview' },
      { status: 500 }
    );
  }
} 