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

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Join code is required' }, { status: 400 });
    }

    // Find the squad
    const squad = await EdduraSquad.findById(id)
      .populate('creatorId', 'firstName lastName email');

    if (!squad) {
      return NextResponse.json({ error: 'Squad not found' }, { status: 404 });
    }

    // Get current user
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is already a member
    if (squad.memberIds.includes(currentUser._id as any)) {
      return NextResponse.json({ error: 'You are already a member of this squad' }, { status: 400 });
    }

    // Check if squad is full
    if (squad.memberIds.length >= squad.maxMembers) {
      return NextResponse.json({ error: 'Squad is at maximum capacity' }, { status: 400 });
    }

    // For now, we'll accept any code (in a real implementation, you'd validate against stored codes)
    // Add user to squad
    squad.memberIds.push(currentUser._id as any);
    await squad.save();

    return NextResponse.json({
      message: 'Successfully joined squad',
      squad: squad
    });
  } catch (error) {
    console.error('Error joining squad:', error);
    return NextResponse.json(
      { error: 'Failed to join squad' },
      { status: 500 }
    );
  }
}