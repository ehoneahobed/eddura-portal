import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ApplicationFormRequest from '@/models/ApplicationFormRequest';
import ApplicationTemplate from '@/models/ApplicationTemplate';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const status = searchParams.get('status') || '';
    const userId = searchParams.get('userId') || '';
    const scholarshipId = searchParams.get('scholarshipId') || '';
    
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter: any = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (userId) {
      filter.userId = userId;
    }
    
    if (scholarshipId) {
      filter.scholarshipId = scholarshipId;
    }
    
    // Get total count for pagination
    const totalCount = await ApplicationFormRequest.countDocuments(filter);
    
    // Get paginated requests with populated fields
    const requests = await ApplicationFormRequest.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('scholarship', 'title provider')
      .populate('admin', 'firstName lastName email')
      .populate('applicationTemplate', 'title version')
      .sort({ requestedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      requests,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching application form requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application form requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { scholarshipId, requestReason } = body;

    if (!scholarshipId) {
      return NextResponse.json(
        { error: 'Scholarship ID is required' },
        { status: 400 }
      );
    }

    // Check if user already has a request for this scholarship
    const existingRequest = await ApplicationFormRequest.findOne({
      userId: session.user.id,
      scholarshipId: scholarshipId
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You have already requested an application form for this scholarship' },
        { status: 400 }
      );
    }

    // Check if scholarship already has an application template
    const existingTemplate = await ApplicationTemplate.findOne({
      scholarshipId: scholarshipId,
      isActive: true
    });

    if (existingTemplate) {
      return NextResponse.json(
        { error: 'This scholarship already has an application form available' },
        { status: 400 }
      );
    }

    const applicationFormRequest = new ApplicationFormRequest({
      userId: session.user.id,
      scholarshipId: scholarshipId,
      requestReason: requestReason || '',
      status: 'pending',
      requestedAt: new Date()
    });

    const savedRequest = await applicationFormRequest.save();
    
    // Populate the saved request with user and scholarship info
    const populatedRequest = await ApplicationFormRequest.findById(savedRequest._id)
      .populate('user', 'firstName lastName email')
      .populate('scholarship', 'title provider');

    return NextResponse.json(populatedRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating application form request:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create application form request' },
      { status: 500 }
    );
  }
}