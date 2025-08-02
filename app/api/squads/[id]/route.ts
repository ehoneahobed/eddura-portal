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
      .populate('creatorId', 'firstName lastName email profilePicture')
      .populate('memberIds', 'firstName lastName email profilePicture platformStats');

    if (!squad) {
      return NextResponse.json({ error: 'Squad not found' }, { status: 404 });
    }

    // Check if user is a member or if squad is public
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isMember = squad.memberIds.some((member: any) => member._id.toString() === (user as any)._id.toString());
    const isPublic = squad.visibility === 'public';

    if (!isMember && !isPublic) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ squad });
  } catch (error) {
    console.error('Error fetching squad:', error);
    return NextResponse.json(
      { error: 'Failed to fetch squad' },
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

    const body = await request.json();
    const {
      name,
      description,
      maxMembers,
      visibility,
      formationType,
      academicLevel,
      fieldOfStudy,
      geographicRegion,
      activityLevel,
      goals
    } = body;

    // Get user and squad
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const squad = await EdduraSquad.findById(id);
    if (!squad) {
      return NextResponse.json({ error: 'Squad not found' }, { status: 404 });
    }

    // Check if user is creator or admin
    const isCreator = squad.creatorId.toString() === (user as any)._id.toString();
    if (!isCreator) {
      return NextResponse.json({ error: 'Only squad creator can edit squad' }, { status: 403 });
    }

    // Update squad
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (maxMembers) updateData.maxMembers = maxMembers;
    if (visibility) updateData.visibility = visibility;
    if (formationType) updateData.formationType = formationType;
    if (academicLevel) updateData.academicLevel = academicLevel;
    if (fieldOfStudy) updateData.fieldOfStudy = fieldOfStudy;
    if (geographicRegion) updateData.geographicRegion = geographicRegion;
    if (activityLevel) updateData.activityLevel = activityLevel;
    if (goals) {
      updateData.goals = goals.map((goal: any) => ({
        ...goal,
        startDate: new Date(goal.startDate),
        endDate: new Date(goal.endDate),
        currentProgress: goal.currentProgress || 0,
        progressPercentage: goal.progressPercentage || 0,
        daysRemaining: Math.ceil((new Date(goal.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
        isOnTrack: goal.isOnTrack !== undefined ? goal.isOnTrack : true,
        memberProgress: goal.memberProgress || []
      }));
    }

    const updatedSquad = await EdduraSquad.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('creatorId', 'firstName lastName email profilePicture')
     .populate('memberIds', 'firstName lastName email profilePicture platformStats');

    return NextResponse.json({ squad: updatedSquad });
  } catch (error) {
    console.error('Error updating squad:', error);
    return NextResponse.json(
      { error: 'Failed to update squad' },
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

    // Get user and squad
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const squad = await EdduraSquad.findById(id);
    if (!squad) {
      return NextResponse.json({ error: 'Squad not found' }, { status: 404 });
    }

    // Check if user is creator
    const isCreator = squad.creatorId.toString() === (user as any)._id.toString();
    if (!isCreator) {
      return NextResponse.json({ error: 'Only squad creator can delete squad' }, { status: 403 });
    }

    // Remove squad from all members
    await User.updateMany(
      { 
        $or: [
          { primarySquadId: squad._id },
          { secondarySquadIds: squad._id }
        ]
      },
      {
        $unset: { primarySquadId: "" },
        $pull: { secondarySquadIds: squad._id }
      }
    );

    // Delete the squad
    await EdduraSquad.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Squad deleted successfully' });
  } catch (error) {
    console.error('Error deleting squad:', error);
    return NextResponse.json(
      { error: 'Failed to delete squad' },
      { status: 500 }
    );
  }
}