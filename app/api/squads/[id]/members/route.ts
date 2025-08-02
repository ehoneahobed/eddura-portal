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
    const { action, userId } = body; // action: 'join' | 'leave', userId: optional (for invites)

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const squad = await EdduraSquad.findById(params.id);
    if (!squad) {
      return NextResponse.json({ error: 'Squad not found' }, { status: 404 });
    }

    if (action === 'join') {
      // Check if user is already a member
      const isMember = squad.memberIds.some((memberId: any) => memberId.toString() === user._id.toString());
      if (isMember) {
        return NextResponse.json({ error: 'User is already a member' }, { status: 400 });
      }

      // Check if squad is full
      if (squad.memberIds.length >= squad.maxMembers) {
        return NextResponse.json({ error: 'Squad is full' }, { status: 400 });
      }

      // Check squad visibility
      if (squad.visibility === 'private') {
        return NextResponse.json({ error: 'Squad is private' }, { status: 403 });
      }

      // Add user to squad
      squad.memberIds.push(user._id);
      await squad.save();

      // Update user's squad membership
      if (squad.squadType === 'primary') {
        await User.findByIdAndUpdate(user._id, {
          primarySquadId: squad._id,
          primarySquadRole: 'member'
        });
      } else {
        await User.findByIdAndUpdate(user._id, {
          $push: { secondarySquadIds: squad._id }
        });
      }

      return NextResponse.json({ message: 'Successfully joined squad' });
    }

    if (action === 'leave') {
      // Check if user is a member
      const isMember = squad.memberIds.some((memberId: any) => memberId.toString() === user._id.toString());
      if (!isMember) {
        return NextResponse.json({ error: 'User is not a member' }, { status: 400 });
      }

      // Remove user from squad
      squad.memberIds = squad.memberIds.filter((memberId: any) => memberId.toString() !== user._id.toString());
      await squad.save();

      // Update user's squad membership
      if (squad.squadType === 'primary') {
        await User.findByIdAndUpdate(user._id, {
          $unset: { primarySquadId: "", primarySquadRole: "" }
        });
      } else {
        await User.findByIdAndUpdate(user._id, {
          $pull: { secondarySquadIds: squad._id }
        });
      }

      return NextResponse.json({ message: 'Successfully left squad' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error managing squad membership:', error);
    return NextResponse.json(
      { error: 'Failed to manage squad membership' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const squad = await EdduraSquad.findById(params.id);
    if (!squad) {
      return NextResponse.json({ error: 'Squad not found' }, { status: 404 });
    }

    // Check if user is creator or admin
    const isCreator = squad.creatorId.toString() === user._id.toString();
    if (!isCreator) {
      return NextResponse.json({ error: 'Only squad creator can remove members' }, { status: 403 });
    }

    // Remove member from squad
    squad.memberIds = squad.memberIds.filter((memberId: any) => memberId.toString() !== memberId);
    await squad.save();

    // Update removed user's squad membership
    if (squad.squadType === 'primary') {
      await User.findByIdAndUpdate(memberId, {
        $unset: { primarySquadId: "", primarySquadRole: "" }
      });
    } else {
      await User.findByIdAndUpdate(memberId, {
        $pull: { secondarySquadIds: squad._id }
      });
    }

    return NextResponse.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing squad member:', error);
    return NextResponse.json(
      { error: 'Failed to remove squad member' },
      { status: 500 }
    );
  }
}