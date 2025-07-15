import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import { ITask } from '@/models/Application';

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

    return NextResponse.json({ tasks: application.tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
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
    const taskData: Omit<ITask, 'id'> = await request.json();

    // Generate a unique ID for the task
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newTask: ITask = {
      id: taskId,
      ...taskData
    };

    const application = await Application.findOneAndUpdate(
      {
        _id: resolvedParams.id,
        userId: session.user.id,
        isActive: true
      },
      {
        $push: { tasks: newTask },
        lastActivityAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Task added successfully',
      task: newTask,
      application 
    });
  } catch (error) {
    console.error('Error adding task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}