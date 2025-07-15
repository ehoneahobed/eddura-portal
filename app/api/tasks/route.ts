import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const tasks = await Task.find({ 
      userId: session.user.id,
      isActive: true 
    })
    .populate('applicationId', 'scholarshipId')
    .populate('applicationId.scholarshipId', 'title value currency deadline type')
    .sort({ dueDate: 1, createdAt: -1 });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, title, description, priority, dueDate, applicationId } = await request.json();

    if (!type || !title) {
      return NextResponse.json({ error: 'Type and title are required' }, { status: 400 });
    }

    await connectDB();

    // Create new task
    const task = new Task({
      userId: session.user.id,
      type,
      title,
      description,
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      applicationId: applicationId || null,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    });

    await task.save();

    return NextResponse.json({ 
      message: 'Task created successfully',
      task 
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}