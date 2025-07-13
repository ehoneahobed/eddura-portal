import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import SavedScholarship from '@/models/SavedScholarship';
import Scholarship from '@/models/Scholarship';

// GET /api/user/saved-scholarships - Get user's saved scholarships
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const scholarshipId = searchParams.get('scholarshipId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build query
    const query: any = { userId: session.user.id };
    if (status && status !== 'all') {
      query.status = status;
    }
    if (scholarshipId) {
      query.scholarshipId = scholarshipId;
    }

    // Get saved scholarships with scholarship details
    const savedScholarships = await SavedScholarship.find(query)
      .populate({
        path: 'scholarshipId',
        select: 'title provider value currency deadline frequency linkedSchool tags eligibility applicationRequirements selectionCriteria'
      })
      .sort({ savedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await SavedScholarship.countDocuments(query);

    return NextResponse.json({
      savedScholarships,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching saved scholarships:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/user/saved-scholarships - Save a scholarship
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { scholarshipId, notes, status = 'saved', reminderDate } = body;

    if (!scholarshipId) {
      return NextResponse.json(
        { error: 'Scholarship ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if scholarship exists
    const scholarship = await Scholarship.findById(scholarshipId);
    if (!scholarship) {
      return NextResponse.json(
        { error: 'Scholarship not found' },
        { status: 404 }
      );
    }

    // Check if already saved
    const existingSave = await SavedScholarship.findOne({
      userId: session.user.id,
      scholarshipId
    });

    if (existingSave) {
      // Update existing save
      existingSave.notes = notes;
      existingSave.status = status;
      existingSave.reminderDate = reminderDate;
      existingSave.isReminderSet = !!reminderDate;
      await existingSave.save();

      return NextResponse.json({
        message: 'Scholarship updated successfully',
        savedScholarship: existingSave
      });
    }

    // Create new save
    const savedScholarship = new SavedScholarship({
      userId: session.user.id,
      scholarshipId,
      notes,
      status,
      reminderDate,
      isReminderSet: !!reminderDate
    });

    await savedScholarship.save();

    return NextResponse.json({
      message: 'Scholarship saved successfully',
      savedScholarship
    }, { status: 201 });

  } catch (error) {
    console.error('Error saving scholarship:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}