import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import { ICommunication } from '@/models/Application';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const resolvedParams = await params;

    const application = await Application.findOne({
      _id: resolvedParams.id,
      userId: session.user.id,
      isActive: true
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ communications: application.communications });
  } catch (error) {
    console.error('Error fetching communications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

    await connectDB();
    
    const resolvedParams = await params;
    const communicationData: Omit<ICommunication, 'id'> = await request.json();

    // Generate a unique ID for the communication
    const communicationId = `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newCommunication: ICommunication = {
      id: communicationId,
      ...communicationData
    };

    const application = await Application.findOneAndUpdate(
      {
        _id: resolvedParams.id,
        userId: session.user.id,
        isActive: true
      },
      {
        $push: { communications: newCommunication },
        lastActivityAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Communication logged successfully',
      communication: newCommunication,
      application 
    });
  } catch (error) {
    console.error('Error logging communication:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}