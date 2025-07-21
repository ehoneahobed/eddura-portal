import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import '@/models/index';
import UserInterest from '@/models/UserInterest';
import Program from '@/models/Program';
import School from '@/models/School';
import Scholarship from '@/models/Scholarship';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const type = searchParams.get('type'); // 'program', 'school', 'scholarship'

    let query: any = { userId: session.user.id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (type) {
      if (type === 'program') {
        query.programId = { $exists: true, $ne: null };
      } else if (type === 'school') {
        query.schoolId = { $exists: true, $ne: null };
      } else if (type === 'external') {
        query.$or = [
          { schoolName: { $exists: true, $ne: null } },
          { programName: { $exists: true, $ne: null } }
        ];
      }
    }

    const interests = await UserInterest.find(query)
      .populate('programId', 'name degreeType fieldOfStudy schoolId')
      .populate('schoolId', 'name country city')
      .populate({
        path: 'programId',
        populate: {
          path: 'schoolId',
          select: 'name country city'
        }
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ interests });
  } catch (error) {
    console.error('Error fetching user interests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      programId, 
      schoolId, 
      schoolName, 
      programName, 
      applicationUrl, 
      status, 
      priority, 
      notes,
      requiresInterview,
      interviewType 
    } = body;

    await connectDB();

    // Validate that at least one target is specified
    if (!programId && !schoolId && !schoolName && !programName) {
      return NextResponse.json({ 
        error: 'Must specify either programId, schoolId, schoolName, or programName' 
      }, { status: 400 });
    }

    // Check if interest already exists
    let existingQuery: any = { userId: session.user.id };
    
    if (programId) {
      existingQuery.programId = programId;
    } else if (schoolId) {
      existingQuery.schoolId = schoolId;
    } else if (schoolName && programName) {
      existingQuery.schoolName = schoolName;
      existingQuery.programName = programName;
    }

    const existingInterest = await UserInterest.findOne(existingQuery);
    
    if (existingInterest) {
      return NextResponse.json({ 
        error: 'Interest already exists',
        interestId: existingInterest._id 
      }, { status: 409 });
    }

    // Create new interest
    const interest = new UserInterest({
      userId: session.user.id,
      programId,
      schoolId,
      schoolName,
      programName,
      applicationUrl,
      status: status || 'interested',
      priority: priority || 'medium',
      notes,
      requiresInterview,
      interviewType
    });

    await interest.save();

    // Populate the created interest
    await interest.populate('programId', 'name degreeType fieldOfStudy schoolId');
    await interest.populate('schoolId', 'name country city');
    await interest.populate({
      path: 'programId',
      populate: {
        path: 'schoolId',
        select: 'name country city'
      }
    });

    return NextResponse.json({ 
      message: 'Interest created successfully',
      interest 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user interest:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}