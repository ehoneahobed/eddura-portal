import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Program from '@/models/Program';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const school = searchParams.get('school') || '';
    const level = searchParams.get('level') || '';
    const degreeType = searchParams.get('degreeType') || '';
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter: any = {};
    
    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { fieldOfStudy: { $regex: search, $options: 'i' } },
        { degreeType: { $regex: search, $options: 'i' } }
      ];
    }
    
    // School filter
    if (school && school !== 'all') {
      filter.schoolId = school;
    }
    
    // Level filter
    if (level && level !== 'all') {
      filter.programLevel = level;
    }
    
    // Degree type filter
    if (degreeType && degreeType !== 'all') {
      filter.degreeType = degreeType;
    }
    
    // Get total count for pagination
    const totalCount = await Program.countDocuments(filter);
    
    // Get paginated programs
    let programs;
    try {
      programs = await Program.find(filter)
        .populate('schoolId', 'name country city')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    } catch (err) {
      console.error('Error during Program.find/populate:', err);
      return NextResponse.json(
        { error: 'Failed to fetch programs (find/populate)', details: err instanceof Error ? err.message : String(err) },
        { status: 500 }
      );
    }
    
    if (!Array.isArray(programs)) {
      console.error('Programs is not an array:', programs);
      return NextResponse.json({ programs: [], totalCount: 0, currentPage: page, totalPages: 0 }, { status: 200 });
    }
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      programs,
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
    console.error('Error fetching programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programs', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    const program = new Program(body);
    const savedProgram = await program.save();
    
    // Populate the school information for the response
    await savedProgram.populate('schoolId', 'name country city');
    
    return NextResponse.json(savedProgram, { status: 201 });
  } catch (error) {
    console.error('Error creating program:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create program' },
      { status: 500 }
    );
  }
}