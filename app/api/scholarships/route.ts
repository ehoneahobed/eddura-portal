import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Scholarship from '@/models/Scholarship';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const provider = searchParams.get('provider') || '';
    const frequency = searchParams.get('frequency') || '';
    const degreeLevel = searchParams.get('degreeLevel') || '';
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter: any = {};
    
    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { provider: { $regex: search, $options: 'i' } },
        { 'eligibility.degreeLevels': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Provider filter
    if (provider && provider !== 'all') {
      filter.provider = { $regex: provider, $options: 'i' };
    }
    
    // Frequency filter
    if (frequency && frequency !== 'all') {
      filter.frequency = frequency;
    }
    
    // Degree level filter
    if (degreeLevel && degreeLevel !== 'all') {
      filter['eligibility.degreeLevels'] = { $in: [degreeLevel] };
    }
    
    // Get total count for pagination
    const totalCount = await Scholarship.countDocuments(filter);
    
    // Get paginated scholarships
    const scholarships = await Scholarship.find(filter)
      .sort({ createdAt: -1 })
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