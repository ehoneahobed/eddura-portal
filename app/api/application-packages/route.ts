import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import '@/models/index';
import ApplicationPackage from '@/models/ApplicationPackage';
import UserInterest from '@/models/UserInterest';
import Program from '@/models/Program';
import School from '@/models/School';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const isReady = searchParams.get('isReady');

    let query: any = { userId: session.user.id };

    if (status && status !== 'all') {
      query.applicationStatus = status;
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    if (isReady !== null && isReady !== undefined) {
      query.isReady = isReady === 'true';
    }

    const packages = await ApplicationPackage.find(query)
      .populate('interestId')
      .populate({
        path: 'interestId',
        populate: [
          {
            path: 'programId',
            select: 'name degreeType fieldOfStudy schoolId applicationRequirements'
          },
          {
            path: 'schoolId',
            select: 'name country city'
          }
        ]
      })
      .populate({
        path: 'interestId',
        populate: {
          path: 'programId',
          populate: {
            path: 'schoolId',
            select: 'name country city'
          }
        }
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ packages });
  } catch (error) {
    console.error('Error fetching application packages:', error);
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
      interestId, 
      name, 
      type, 
      documents, 
      notes,
      linkedScholarships 
    } = body;

    await connectDB();

    // Validate required fields
    if (!interestId || !name || !type) {
      return NextResponse.json({ 
        error: 'interestId, name, and type are required' 
      }, { status: 400 });
    }

    // Verify the interest exists and belongs to the user
    const interest = await UserInterest.findOne({
      _id: interestId,
      userId: session.user.id
    });

    if (!interest) {
      return NextResponse.json({ error: 'Interest not found' }, { status: 404 });
    }

    // Check if package already exists for this interest
    const existingPackage = await ApplicationPackage.findOne({
      userId: session.user.id,
      interestId: interestId
    });

    if (existingPackage) {
      return NextResponse.json({ 
        error: 'Application package already exists for this interest',
        packageId: existingPackage._id 
      }, { status: 409 });
    }

    // Create new application package
    const applicationPackage = new ApplicationPackage({
      userId: session.user.id,
      interestId: interestId,
      name,
      type,
      documents: documents || [],
      notes,
      linkedScholarships: linkedScholarships || []
    });

    await applicationPackage.save();

    // Populate the created package
    await applicationPackage.populate('interestId');
    await applicationPackage.populate({
      path: 'interestId',
      populate: [
        {
          path: 'programId',
          select: 'name degreeType fieldOfStudy schoolId applicationRequirements'
        },
        {
          path: 'schoolId',
          select: 'name country city'
        }
      ]
    });
    await applicationPackage.populate({
      path: 'interestId',
      populate: {
        path: 'programId',
        populate: {
          path: 'schoolId',
          select: 'name country city'
        }
      }
    });

    return NextResponse.json({ 
      message: 'Application package created successfully',
      package: applicationPackage 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating application package:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}