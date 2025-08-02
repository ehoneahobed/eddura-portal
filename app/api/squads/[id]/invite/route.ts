import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import EdduraSquad from '@/models/Squad';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';
import { sendSquadInvitationEmail } from '@/lib/email/squad-invitation';

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

    if (squad.creatorId._id.toString() !== (currentUser._id as any).toString()) {
      return NextResponse.json({ error: 'Only squad creators can invite members' }, { status: 403 });
    }

    // Check if the squad is full
    if (squad.memberIds.length >= squad.maxMembers) {
      return NextResponse.json({ error: 'Squad is at maximum capacity' }, { status: 400 });
    }

    // Generate a short code for easy joining
    const shortCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Check if user exists
    const invitedUser = await User.findOne({ email });
    
    if (invitedUser) {
      // User exists - check if already a member
      if (squad.memberIds.includes(invitedUser._id as any)) {
        return NextResponse.json({ error: 'User is already a member of this squad' }, { status: 400 });
      }
      
      // Add user to squad immediately for existing users
      squad.memberIds.push(invitedUser._id as any);
      await squad.save();
    }
    
    // Send invitation email
    const joinUrl = `${process.env.NEXT_PUBLIC_APP_URL}/squads/${id}/join?code=${shortCode}`;
    
    const emailSent = await sendSquadInvitationEmail({
      invitedUserEmail: email,
      invitedUserName: invitedUser?.firstName ? `${invitedUser.firstName} ${invitedUser.lastName}` : undefined,
      squadName: squad.name,
      squadDescription: squad.description,
      inviterName: `${currentUser.firstName} ${currentUser.lastName}`,
      inviterEmail: currentUser.email,
      message: message || `You've been invited to join ${squad.name}!`,
      joinUrl,
      shortCode
    });
    
    if (!emailSent) {
      return NextResponse.json({ error: 'Failed to send invitation email' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Invitation sent successfully',
      squad: squad,
      shortCode,
      joinUrl
    });
  } catch (error) {
    console.error('Error inviting member:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}