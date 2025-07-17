import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import ScholarshipApplication from '@/models/ScholarshipApplication';
import { z } from 'zod';

// Validation schemas
const createScholarshipApplicationSchema = z.object({
  scholarshipId: z.string().min(1, 'Scholarship ID is required'),
  applicationPackageId: z.string().optional(),
  status: z.enum(['draft', 'submitted', 'under_review', 'interviewed', 'awarded', 'rejected']).default('draft'),
  formResponses: z.array(z.object({
    questionId: z.string(),
    answer: z.string(),
    attachments: z.array(z.string()).optional()
  })).optional(),
  requiresInterview: z.boolean().optional(),
  notes: z.string().optional()
});

const updateScholarshipApplicationSchema = z.object({
  status: z.enum(['draft', 'submitted', 'under_review', 'interviewed', 'awarded', 'rejected']).optional(),
  formResponses: z.array(z.object({
    questionId: z.string(),
    answer: z.string(),
    attachments: z.array(z.string()).optional()
  })).optional(),
  interviewScheduled: z.boolean().optional(),
  interviewDate: z.string().optional(),
  interviewType: z.enum(['in-person', 'virtual', 'phone']).optional(),
  interviewNotes: z.string().optional(),
  awardAmount: z.number().optional(),
  awardCurrency: z.string().optional(),
  awardConditions: z.string().optional(),
  notes: z.string().optional()
});

// GET /api/scholarship-applications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const scholarshipId = searchParams.get('scholarshipId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build query
    const query: any = { userId: session.user.id };
    if (status) query.status = status;
    if (scholarshipId) query.scholarshipId = scholarshipId;

    // Get applications with pagination
    const applications = await ScholarshipApplication.find(query)
      .populate('scholarshipId', 'name amount deadline requirements')
      .populate('applicationPackageId', 'name type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await ScholarshipApplication.countDocuments(query);

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching scholarship applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scholarship applications' },
      { status: 500 }
    );
  }
}

// POST /api/scholarship-applications
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json();
    const validatedData = createScholarshipApplicationSchema.parse(body);

    // Check if application already exists
    const existingApplication = await ScholarshipApplication.findOne({
      userId: session.user.id,
      scholarshipId: validatedData.scholarshipId
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'Application for this scholarship already exists' },
        { status: 400 }
      );
    }

    // Create new application
    const application = new ScholarshipApplication({
      userId: session.user.id,
      ...validatedData
    });

    await application.save();

    // Populate references
    await application.populate('scholarshipId', 'name amount deadline requirements');
    if (application.applicationPackageId) {
      await application.populate('applicationPackageId', 'name type');
    }

    return NextResponse.json(application, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating scholarship application:', error);
    return NextResponse.json(
      { error: 'Failed to create scholarship application' },
      { status: 500 }
    );
  }
}