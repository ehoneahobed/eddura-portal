import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import EdduraSquad from '@/models/Squad';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const squad = await EdduraSquad.findById(id)
      .populate('creatorId', 'firstName lastName email')
      .populate('memberIds', 'firstName lastName email');

    if (!squad) {
      return NextResponse.json({ error: 'Squad not found' }, { status: 404 });
    }

    return NextResponse.json({ goals: squad.goals });
  } catch (error) {
    console.error('Error fetching squad goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch squad goals' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const squad = await EdduraSquad.findById(id);
    if (!squad) {
      return NextResponse.json({ error: 'Squad not found' }, { status: 404 });
    }

    // Check if user is the creator
    if (squad.creatorId.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ error: 'Only squad creators can add goals' }, { status: 403 });
    }

    const body = await request.json();
    const {
      type,
      target,
      timeframe,
      startDate,
      endDate,
      description,
      individualTarget
    } = body;

    if (!type || !target || !timeframe || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newGoal = {
      type,
      target,
      timeframe,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      description,
      individualTarget,
      currentProgress: 0,
      progressPercentage: 0,
      daysRemaining: Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      isOnTrack: true,
      memberProgress: []
    };

    squad.goals.push(newGoal);
    await squad.save();

    return NextResponse.json({
      message: 'Goal added successfully',
      goal: newGoal
    });
  } catch (error) {
    console.error('Error adding squad goal:', error);
    return NextResponse.json(
      { error: 'Failed to add squad goal' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const squad = await EdduraSquad.findById(id);
    if (!squad) {
      return NextResponse.json({ error: 'Squad not found' }, { status: 404 });
    }

    const body = await request.json();
    const { goalId, progress } = body;

    if (!goalId || progress === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const goal = squad.goals.id(goalId);
    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Update user's progress for this goal
    const existingProgress = goal.memberProgress.find(
      (p: any) => p.userId.toString() === currentUser._id.toString()
    );

    if (existingProgress) {
      existingProgress.progress = progress;
      existingProgress.percentage = Math.round((progress / goal.target) * 100);
      existingProgress.lastActivity = new Date();
      existingProgress.isOnTrack = existingProgress.percentage >= (goal.daysRemaining / goal.timeframe) * 100;
    } else {
      goal.memberProgress.push({
        userId: currentUser._id,
        progress,
        target: goal.target,
        percentage: Math.round((progress / goal.target) * 100),
        lastActivity: new Date(),
        needsHelp: false,
        isOnTrack: true
      });
    }

    // Update overall goal progress
    const totalProgress = goal.memberProgress.reduce((sum: number, p: any) => sum + p.progress, 0);
    goal.currentProgress = totalProgress;
    goal.progressPercentage = Math.round((totalProgress / (goal.target * squad.memberIds.length)) * 100);

    await squad.save();

    return NextResponse.json({
      message: 'Progress updated successfully',
      goal
    });
  } catch (error) {
    console.error('Error updating goal progress:', error);
    return NextResponse.json(
      { error: 'Failed to update goal progress' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const squad = await EdduraSquad.findById(id);
    if (!squad) {
      return NextResponse.json({ error: 'Squad not found' }, { status: 404 });
    }

    // Check if user is the creator
    if (squad.creatorId.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ error: 'Only squad creators can delete goals' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get('goalId');

    if (!goalId) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });
    }

    squad.goals = squad.goals.filter((goal: any) => goal._id.toString() !== goalId);
    await squad.save();

    return NextResponse.json({
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting squad goal:', error);
    return NextResponse.json(
      { error: 'Failed to delete squad goal' },
      { status: 500 }
    );
  }
}