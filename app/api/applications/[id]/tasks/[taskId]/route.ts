import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import { ITask } from '@/models/Application';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const resolvedParams = await params;
    const updateData: Partial<ITask> = await request.json();

    // Remove the id field from update data as it shouldn't be changed
    const { id, ...safeUpdateData } = updateData;

    const application = await Application.findOneAndUpdate(
      {
        _id: resolvedParams.id,
        userId: session.user.id,
        isActive: true,
        'tasks.id': resolvedParams.taskId
      },
      {
        $set: {
          'tasks.$': { id: resolvedParams.taskId, ...safeUpdateData },
          lastActivityAt: new Date()
        }
      },
      { new: true, runValidators: true }
    );

    if (!application) {
      return NextResponse.json({ error: 'Application or task not found' }, { status: 404 });
    }

    const updatedTask = application.tasks.find(task => task.id === resolvedParams.taskId);

    return NextResponse.json({ 
      message: 'Task updated successfully',
      task: updatedTask,
      application 
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
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
        $pull: { tasks: { id: resolvedParams.taskId } },
        lastActivityAt: new Date()
      },
      { new: true }
    );

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Task deleted successfully',
      application 
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}