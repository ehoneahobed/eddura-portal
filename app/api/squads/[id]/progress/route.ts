import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import EdduraSquad from '@/models/Squad';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json();
    const { goalType, progress, userId } = body;

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const squad = await EdduraSquad.findById(params.id);
    if (!squad) {
      return NextResponse.json({ error: 'Squad not found' }, { status: 404 });
    }

    // Check if user is a member
    const isMember = squad.memberIds.some((memberId: any) => memberId.toString() === user._id.toString());
    if (!isMember) {
      return NextResponse.json({ error: 'User is not a member of this squad' }, { status: 403 });
    }

    // Find the goal to update
    const goalIndex = squad.goals.findIndex((goal: any) => goal.type === goalType);
    if (goalIndex === -1) {
      return NextResponse.json({ error: 'Goal type not found' }, { status: 404 });
    }

    const goal = squad.goals[goalIndex];
    
    // Update member progress
    const memberProgressIndex = goal.memberProgress.findIndex(
      (mp: any) => mp.userId.toString() === user._id.toString()
    );

    if (memberProgressIndex === -1) {
      // Add new member progress
      goal.memberProgress.push({
        userId: user._id,
        progress: progress,
        target: goal.individualTarget || goal.target,
        percentage: Math.round((progress / (goal.individualTarget || goal.target)) * 100),
        lastActivity: new Date(),
        needsHelp: false,
        isOnTrack: true
      });
    } else {
      // Update existing member progress
      goal.memberProgress[memberProgressIndex].progress = progress;
      goal.memberProgress[memberProgressIndex].percentage = Math.round((progress / (goal.individualTarget || goal.target)) * 100);
      goal.memberProgress[memberProgressIndex].lastActivity = new Date();
      goal.memberProgress[memberProgressIndex].isOnTrack = goal.memberProgress[memberProgressIndex].percentage >= 75;
      goal.memberProgress[memberProgressIndex].needsHelp = goal.memberProgress[memberProgressIndex].percentage < 25;
    }

    // Update squad progress
    const totalProgress = goal.memberProgress.reduce((sum: number, mp: any) => sum + mp.progress, 0);
    goal.currentProgress = totalProgress;
    goal.progressPercentage = Math.round((totalProgress / goal.target) * 100);
    goal.daysRemaining = Math.ceil((new Date(goal.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    goal.isOnTrack = goal.progressPercentage >= 75;

    // Update squad activity tracking
    squad.totalApplications = squad.goals.reduce((sum: number, g: any) => {
      if (g.type === 'applications_started' || g.type === 'applications_completed') {
        return sum + g.currentProgress;
      }
      return sum;
    }, 0);

    squad.totalDocuments = squad.goals.reduce((sum: number, g: any) => {
      if (g.type === 'documents_created') {
        return sum + g.currentProgress;
      }
      return sum;
    }, 0);

    squad.totalReviews = squad.goals.reduce((sum: number, g: any) => {
      if (g.type === 'peer_reviews_provided') {
        return sum + g.currentProgress;
      }
      return sum;
    }, 0);

    // Calculate average activity score
    const totalMembers = squad.memberIds.length;
    const activeMembers = goal.memberProgress.filter((mp: any) => {
      const daysSinceLastActivity = Math.ceil((new Date().getTime() - new Date(mp.lastActivity).getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceLastActivity <= 7;
    }).length;

    squad.averageActivityScore = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;

    await squad.save();

    // Populate the response
    const updatedSquad = await EdduraSquad.findById(params.id)
      .populate('creatorId', 'firstName lastName email profilePicture')
      .populate('memberIds', 'firstName lastName email profilePicture platformStats');

    return NextResponse.json({ 
      squad: updatedSquad,
      message: 'Progress updated successfully'
    });
  } catch (error) {
    console.error('Error updating squad progress:', error);
    return NextResponse.json(
      { error: 'Failed to update squad progress' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const squad = await EdduraSquad.findById(params.id)
      .populate('creatorId', 'firstName lastName email profilePicture')
      .populate('memberIds', 'firstName lastName email profilePicture platformStats');

    if (!squad) {
      return NextResponse.json({ error: 'Squad not found' }, { status: 404 });
    }

    // Check if user is a member
    const isMember = squad.memberIds.some((member: any) => member._id.toString() === user._id.toString());
    if (!isMember) {
      return NextResponse.json({ error: 'User is not a member of this squad' }, { status: 403 });
    }

    // Calculate progress summary
    const progressSummary = {
      totalGoals: squad.goals.length,
      completedGoals: squad.goals.filter((goal: any) => goal.progressPercentage >= 100).length,
      onTrackGoals: squad.goals.filter((goal: any) => goal.isOnTrack).length,
      membersNeedingHelp: squad.goals.flatMap((goal: any) => 
        goal.memberProgress.filter((mp: any) => mp.needsHelp)
      ).length,
      averageProgress: squad.goals.length > 0 
        ? Math.round(squad.goals.reduce((sum: number, goal: any) => sum + goal.progressPercentage, 0) / squad.goals.length)
        : 0
    };

    return NextResponse.json({ 
      squad,
      progressSummary
    });
  } catch (error) {
    console.error('Error fetching squad progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch squad progress' },
      { status: 500 }
    );
  }
}