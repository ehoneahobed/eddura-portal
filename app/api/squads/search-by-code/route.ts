import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import EdduraSquad from '@/models/Squad';
import connectDB from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Shortcode is required' }, { status: 400 });
    }

    // Find squad by shortcode
    const squad = await EdduraSquad.findOne({
      'shortcodes.code': code.toUpperCase(),
      'shortcodes.expiresAt': { $gt: new Date() },
      'shortcodes.usedBy': { $exists: false }
    })
    .populate('creatorId', 'firstName lastName email profilePicture')
    .populate('memberIds', 'firstName lastName email profilePicture');

    if (!squad) {
      return NextResponse.json({ error: 'Squad not found with this shortcode' }, { status: 404 });
    }

    // Check if user is already a member
    const isMember = squad.memberIds.some((member: any) => 
      member.email === session.user.email
    );

    if (isMember) {
      return NextResponse.json({ error: 'You are already a member of this squad' }, { status: 400 });
    }

    // Check if squad is full
    if (squad.memberIds.length >= squad.maxMembers) {
      return NextResponse.json({ error: 'Squad is at maximum capacity' }, { status: 400 });
    }

    // Return squad preview (without sensitive information)
    const squadPreview = {
      _id: squad._id,
      name: squad.name,
      description: squad.description,
      maxMembers: squad.maxMembers,
      visibility: squad.visibility,
      formationType: squad.formationType,
      academicLevel: squad.academicLevel,
      fieldOfStudy: squad.fieldOfStudy,
      geographicRegion: squad.geographicRegion,
      goals: squad.goals,
      squadType: squad.squadType,
      creatorId: squad.creatorId,
      memberIds: squad.memberIds,
      memberCount: squad.memberIds.length,
      activityLevel: squad.activityLevel,
      completionPercentage: squad.completionPercentage,
    };

    return NextResponse.json({ squad: squadPreview });
  } catch (error) {
    console.error('Error searching squad by code:', error);
    return NextResponse.json(
      { error: 'Failed to search squad' },
      { status: 500 }
    );
  }
}