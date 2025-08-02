import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import EdduraSquad from '@/models/Squad';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // 'primary', 'secondary', or 'all'
    const visibility = searchParams.get('visibility'); // 'public', 'private', 'invite_only'

    let query: any = {};

    // Filter by user membership
    if (userId) {
      // Convert email to user ID if needed
      const user = await User.findOne({ email: userId });
      if (user) {
        query.memberIds = user._id;
      } else {
        // If userId is already an ObjectId, use it directly
        query.memberIds = userId;
      }
    }

    // Filter by squad type
    if (type && type !== 'all') {
      query.squadType = type;
    }

    // Filter by visibility
    if (visibility) {
      query.visibility = visibility;
    }

    const squads = await EdduraSquad.find(query)
      .populate('creatorId', 'firstName lastName email profilePicture')
      .populate('memberIds', 'firstName lastName email profilePicture platformStats')
      .sort({ createdAt: -1 });

    return NextResponse.json({ squads });
  } catch (error) {
    console.error('Error fetching squads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch squads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
      visibility = 'invite_only',
      formationType = 'general',
      academicLevel,
      fieldOfStudy,
      geographicRegion,
      activityLevel,
      squadType = 'primary',
      goals = []
    } = body;

    // Validate required fields
    if (!name || !description || !maxMembers) {
      return NextResponse.json(
        { error: 'Name, description, and maxMembers are required' },
        { status: 400 }
      );
    }

    // Get user ID from session
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has a primary squad
    if (squadType === 'primary') {
      const existingPrimarySquad = await EdduraSquad.findOne({
        memberIds: user._id as any,
        squadType: 'primary'
      });

      if (existingPrimarySquad) {
        return NextResponse.json(
          { error: 'User already has a primary squad' },
          { status: 400 }
        );
      }
    }

    // Create new squad
    const newSquad = new EdduraSquad({
      name,
      description,
      maxMembers,
      visibility,
      formationType,
      academicLevel,
      fieldOfStudy,
      geographicRegion,
      activityLevel,
      squadType,
      creatorId: user._id as any,
      memberIds: [user._id as any],
      goals: goals.map((goal: any) => ({
        ...goal,
        startDate: new Date(goal.startDate),
        endDate: new Date(goal.endDate),
        currentProgress: 0,
        progressPercentage: 0,
        daysRemaining: Math.ceil((new Date(goal.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
        isOnTrack: true,
        memberProgress: []
      }))
    });

    await newSquad.save();

    // Update user's squad membership
    if (squadType === 'primary') {
      await User.findByIdAndUpdate(user._id as any, {
        primarySquadId: newSquad._id,
        primarySquadRole: 'creator'
      });
    } else {
      await User.findByIdAndUpdate(user._id as any, {
        $push: { secondarySquadIds: newSquad._id }
      });
    }

    // Populate the response
    const populatedSquad = await EdduraSquad.findById(newSquad._id)
      .populate('creatorId', 'firstName lastName email profilePicture')
      .populate('memberIds', 'firstName lastName email profilePicture platformStats');

    return NextResponse.json({ squad: populatedSquad }, { status: 201 });
  } catch (error) {
    console.error('Error creating squad:', error);
    return NextResponse.json(
      { error: 'Failed to create squad' },
      { status: 500 }
    );
  }
}