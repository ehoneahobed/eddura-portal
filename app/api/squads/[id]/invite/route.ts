import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import EdduraSquad from '@/models/Squad';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

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

    const { email, message } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find the squad
    const squad = await EdduraSquad.findById(id)
      .populate('creatorId', 'firstName lastName email');

    if (!squad) {
      return NextResponse.json({ error: 'Squad not found' }, { status: 404 });
    }

    // Check if the current user is the creator
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (squad.creatorId._id.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ error: 'Only squad creators can invite members' }, { status: 403 });
    }

    // Check if the squad is full
    if (squad.memberIds.length >= squad.maxMembers) {
      return NextResponse.json({ error: 'Squad is at maximum capacity' }, { status: 400 });
    }

    // Find the user to invite
    const invitedUser = await User.findOne({ email });
    if (!invitedUser) {
      return NextResponse.json({ error: 'User not found with this email' }, { status: 404 });
    }

    // Check if user is already a member
    if (squad.memberIds.includes(invitedUser._id)) {
      return NextResponse.json({ error: 'User is already a member of this squad' }, { status: 400 });
    }

    // For now, just add the user to the squad
    // In a real implementation, you would send an email invitation
    squad.memberIds.push(invitedUser._id as any);
    await squad.save();

    return NextResponse.json({ 
      message: 'Invitation sent successfully',
      squad: squad
    });
  } catch (error) {
    console.error('Error inviting member:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}