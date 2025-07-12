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
    const schoolId = searchParams.get('schoolId') || '';
    const level = searchParams.get('level') || '';
    const degreeType = searchParams.get('degreeType') || '';
    const fieldOfStudy = searchParams.get('fieldOfStudy') || '';
    const mode = searchParams.get('mode') || '';
    const country = searchParams.get('country') || '';
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter: any = {};
    
    // Search filter - search across program name, field of study, and school name
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { fieldOfStudy: { $regex: search, $options: 'i' } },
        { degreeType: { $regex: search, $options: 'i' } },
        { subfield: { $regex: search, $options: 'i' } }
      ];
    }
    
    // School filter
    if (schoolId && schoolId !== 'all') {
      filter.schoolId = schoolId;
    }
    
    // Level filter
    if (level && level !== 'all') {
      filter.programLevel = level;
    }
    
    // Degree type filter
    if (degreeType && degreeType !== 'all') {
      filter.degreeType = degreeType;
    }
    
    // Field of study filter
    if (fieldOfStudy && fieldOfStudy !== 'all') {
      filter.fieldOfStudy = fieldOfStudy;
    }
    
    // Mode filter
    if (mode && mode !== 'all') {
      filter.mode = mode;
    }
    
    // Build sort object
    const sort: any = {};
    if (sortBy === 'name') {
      sort.name = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'schoolName') {
      sort['schoolId.name'] = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'degreeType') {
      sort.degreeType = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'fieldOfStudy') {
      sort.fieldOfStudy = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'createdAt') {
      sort.createdAt = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'updatedAt') {
      sort.updatedAt = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.name = 1; // Default sort by name ascending
    }
    
    // Get total count for pagination
    const totalCount = await Program.countDocuments(filter);
    
    // Get paginated programs
    let programs;
    try {
      programs = await Program.find(filter)
        .populate('schoolId', 'name country city')
        .sort(sort)
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
    
    // Apply country filter after population (since country is in the school document)
    let filteredPrograms = programs;
    if (country && country !== 'all') {
      filteredPrograms = programs.filter((program: any) => 
        program.schoolId && 
        typeof program.schoolId === 'object' && 
        program.schoolId.country === country
      );
    }
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      programs: filteredPrograms,
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