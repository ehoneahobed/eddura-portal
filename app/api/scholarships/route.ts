import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Scholarship from '@/models/Scholarship';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15'); // Default to 15 per page
    const search = searchParams.get('search') || '';
    const provider = searchParams.get('provider') || '';
    const coverage = searchParams.get('coverage') || '';
    const frequency = searchParams.get('frequency') || '';
    const degreeLevel = searchParams.get('degreeLevel') || '';
    const fieldOfStudy = searchParams.get('fieldOfStudy') || '';
    const minValue = searchParams.get('minValue') || '';
    const maxValue = searchParams.get('maxValue') || '';
    const nationality = searchParams.get('nationality') || '';
    const minGPA = searchParams.get('minGPA') || '';
    const hasEssay = searchParams.get('hasEssay') === 'true';
    const hasCV = searchParams.get('hasCV') === 'true';
    const hasRecommendations = searchParams.get('hasRecommendations') === 'true';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const includeExpired = searchParams.get('includeExpired') === 'true';
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter: any = {};
    
    // Enhanced search filter - search in more fields
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { provider: { $regex: search, $options: 'i' } },
        { scholarshipDetails: { $regex: search, $options: 'i' } },
        { 'eligibility.degreeLevels': { $regex: search, $options: 'i' } },
        { 'eligibility.fieldsOfStudy': { $regex: search, $options: 'i' } },
        { linkedSchool: { $regex: search, $options: 'i' } },
        { linkedProgram: { $regex: search, $options: 'i' } },
        { coverage: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Provider filter
    if (provider && provider !== 'all') {
      filter.provider = { $regex: provider, $options: 'i' };
    }
    
    // Coverage filter
    if (coverage && coverage !== 'all') {
      filter.coverage = { $in: [coverage] };
    }
    
    // Frequency filter
    if (frequency && frequency !== 'all') {
      filter.frequency = frequency;
    }
    
    // Degree level filter
    if (degreeLevel && degreeLevel !== 'all') {
      filter['eligibility.degreeLevels'] = { $in: [degreeLevel] };
    }

    // Field of study filter
    if (fieldOfStudy && fieldOfStudy !== 'all') {
      filter['eligibility.fieldsOfStudy'] = { $regex: fieldOfStudy, $options: 'i' };
    }

    // Value range filter
    if (minValue || maxValue) {
      filter.value = {};
      if (minValue) {
        filter.value.$gte = parseFloat(minValue);
      }
      if (maxValue) {
        filter.value.$lte = parseFloat(maxValue);
      }
    }

    // Nationality filter
    if (nationality && nationality !== 'all') {
      filter['eligibility.nationalities'] = { $in: [nationality] };
    }

    // Min GPA filter
    if (minGPA) {
      filter['eligibility.minGPA'] = { $gte: parseFloat(minGPA) };
    }

    // Application requirements filters
    if (hasEssay) {
      filter['applicationRequirements.essay'] = true;
    }

    if (hasCV) {
      filter['applicationRequirements.cv'] = true;
    }

    if (hasRecommendations) {
      filter['applicationRequirements.recommendationLetters'] = { $gt: 0 };
    }
    
    // Filter out expired scholarships by default
    if (!includeExpired) {
      const now = new Date();
      filter.deadline = { $gte: now.toISOString() };
    }
    
    // Get total count for pagination
    const totalCount = await Scholarship.countDocuments(filter);
    
    // Build sort object with custom logic for expired scholarships
    let sortObject: any = {};
    
    if (includeExpired && sortBy === 'deadline') {
      // When including expired and sorting by deadline, use a compound sort
      // to show active scholarships first, then expired ones
      const now = new Date();
      sortObject = {
        $expr: {
          $cond: {
            if: { $gte: ['$deadline', now.toISOString()] },
            then: 0,
            else: 1
          }
        },
        deadline: sortOrder === 'asc' ? 1 : -1
      };
    } else {
      // Normal sorting
      sortObject[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }
    
    // Get paginated scholarships with sorting
    const scholarships = await Scholarship.find(filter)
      .sort(sortObject)
      .skip(skip)
      .limit(limit);
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      scholarships,
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
    console.error('Error fetching scholarships:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scholarships' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    const scholarship = new Scholarship(body);
    const savedScholarship = await scholarship.save();
    
    return NextResponse.json(savedScholarship, { status: 201 });
  } catch (error) {
    console.error('Error creating scholarship:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create scholarship' },
      { status: 500 }
    );
  }
}