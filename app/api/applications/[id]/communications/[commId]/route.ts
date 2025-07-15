import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import { ICommunication } from '@/models/Application';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const resolvedParams = await params;
    const updateData: Partial<ICommunication> = await request.json();

    // Remove the id field from update data as it shouldn't be changed
    const { id, ...safeUpdateData } = updateData;

    const application = await Application.findOneAndUpdate(
      {
        _id: resolvedParams.id,
        userId: session.user.id,
        isActive: true,
        'communications.id': resolvedParams.commId
      },
      {
        $set: {
          'communications.$': { id: resolvedParams.commId, ...safeUpdateData },
          lastActivityAt: new Date()
        }
      },
      { new: true, runValidators: true }
    );

    if (!application) {
      return NextResponse.json({ error: 'Application or communication not found' }, { status: 404 });
    }

    const updatedCommunication = application.communications.find(comm => comm.id === resolvedParams.commId);

    return NextResponse.json({ 
      message: 'Communication updated successfully',
      communication: updatedCommunication,
      application 
    });
  } catch (error) {
    console.error('Error updating communication:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const resolvedParams = await params;

    const application = await Application.findOneAndUpdate(
      {
        _id: resolvedParams.id,
        userId: session.user.id,
        isActive: true
      },
      {
        $pull: { communications: { id: resolvedParams.commId } },
        lastActivityAt: new Date()
      },
      { new: true }
    );

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Communication deleted successfully',
      application 
    });
  } catch (error) {
    console.error('Error deleting communication:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}