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
    const status = searchParams.get('status') || '';
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter: any = {};
    const conditions = [];
    
    // Enhanced search filter - search in more fields
    if (search) {
      conditions.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { provider: { $regex: search, $options: 'i' } },
          { scholarshipDetails: { $regex: search, $options: 'i' } },
          { 'eligibility.degreeLevels': { $regex: search, $options: 'i' } },
          { 'eligibility.fieldsOfStudy': { $regex: search, $options: 'i' } },
          { linkedSchool: { $regex: search, $options: 'i' } },
          { linkedProgram: { $regex: search, $options: 'i' } },
          { coverage: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } }
        ]
      });
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
      // Check if the degree level exists in the array OR if the array is empty (meaning all levels are accepted)
      const degreeLevelCondition = {
        $or: [
          { 'eligibility.degreeLevels': { $in: [degreeLevel] } },
          { 'eligibility.degreeLevels': { $size: 0 } } // Empty array means all levels accepted
        ]
      };
      conditions.push(degreeLevelCondition);
    }

    // Field of study filter
    if (fieldOfStudy && fieldOfStudy !== 'all') {
      // Check if the field of study exists in the array OR if the array is empty (meaning all fields accepted)
      conditions.push({
        $or: [
          { 'eligibility.fieldsOfStudy': { $regex: fieldOfStudy, $options: 'i' } },
          { 'eligibility.fieldsOfStudy': { $size: 0 } } // Empty array means all fields accepted
        ]
      });
    }

    // Nationality filter
    if (nationality && nationality !== 'all') {
      // Check if the nationality exists in the array OR if the array is empty (meaning all nationalities accepted)
      conditions.push({
        $or: [
          { 'eligibility.nationalities': { $in: [nationality] } },
          { 'eligibility.nationalities': { $size: 0 } } // Empty array means all nationalities accepted
        ]
      });
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
    
    // Status-based deadline filtering
    const now = new Date();
    if (status) {
      switch (status) {
        case 'active':
          // Active: opening date has passed (or no opening date) AND deadline hasn't passed
          conditions.push({
            $and: [
              { deadline: { $gte: now.toISOString() } },
              {
                $or: [
                  { openingDate: { $exists: false } },
                  { openingDate: { $lte: now.toISOString() } }
                ]
              }
            ]
          });
          break;
        case 'expired':
          // Expired: deadline has passed
          filter.deadline = { $lt: now.toISOString() };
          break;
        case 'coming-soon':
          // Coming Soon: opening date is within 3 months from now
          const threeMonthsFromNow = new Date();
          threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
          conditions.push({
            $and: [
              { openingDate: { $exists: true } },
              { openingDate: { $gte: now.toISOString() } },
              { openingDate: { $lte: threeMonthsFromNow.toISOString() } }
            ]
          });
          break;
        case 'urgent':
          // Urgent: deadline is within 30 days
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
          filter.deadline = { 
            $gte: now.toISOString(),
            $lte: thirtyDaysFromNow.toISOString()
          };
          break;
      }
    } else if (!includeExpired) {
      // Default behavior: filter out expired scholarships unless explicitly included
      filter.deadline = { $gte: now.toISOString() };
    }
    
    // Apply all conditions using $and if there are multiple conditions
    if (conditions.length > 0) {
      if (conditions.length === 1) {
        Object.assign(filter, conditions[0]);
      } else {
        filter.$and = conditions;
      }
    }
    
    // Get total count for pagination
    const totalCount = await Scholarship.countDocuments(filter);
    
    // Build sort object with simple sorting logic
    let sortObject: any = {};
    
    if (sortBy === 'relevance' && search) {
      // For relevance with search, sort by creation date (newest first)
      // The search filter already handles relevance through the query
      sortObject = { createdAt: -1 };
    } else if (includeExpired && sortBy === 'deadline') {
      // When including expired and sorting by deadline, use simple deadline sorting
      // Active/expired prioritization is handled by the filter logic
      sortObject = { deadline: sortOrder === 'asc' ? 1 : -1 };
    } else if (sortBy === 'openingDate') {
      // For opening date, use simple sorting (null values will be sorted naturally)
      sortObject = { openingDate: sortOrder === 'asc' ? 1 : -1 };
    } else {
      // Normal sorting for other fields
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