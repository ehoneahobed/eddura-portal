import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
// Import models index to ensure proper registration order
import '@/models/index';
import Program from '@/models/Program';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
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
    const skip = (page - 1) * limit;
    
    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { fieldOfStudy: { $regex: search, $options: 'i' } },
        { degreeType: { $regex: search, $options: 'i' } },
        { subfield: { $regex: search, $options: 'i' } }
      ];
    }
    if (schoolId && schoolId !== 'all') filter.schoolId = schoolId;
    if (level && level !== 'all') filter.programLevel = level;
    if (degreeType && degreeType !== 'all') filter.degreeType = degreeType;
    if (fieldOfStudy && fieldOfStudy !== 'all') filter.fieldOfStudy = fieldOfStudy;
    if (mode && mode !== 'all') filter.mode = mode;
    
    const sort: any = {};
    if (sortBy === 'name') sort.name = sortOrder === 'desc' ? -1 : 1;
    else if (sortBy === 'schoolName') sort['schoolId.name'] = sortOrder === 'desc' ? -1 : 1;
    else if (sortBy === 'degreeType') sort.degreeType = sortOrder === 'desc' ? -1 : 1;
    else if (sortBy === 'fieldOfStudy') sort.fieldOfStudy = sortOrder === 'desc' ? -1 : 1;
    else if (sortBy === 'createdAt') sort.createdAt = sortOrder === 'desc' ? -1 : 1;
    else if (sortBy === 'updatedAt') sort.updatedAt = sortOrder === 'desc' ? -1 : 1;
    else sort.name = 1;
    
    const [totalCount, latest] = await Promise.all([
      Program.countDocuments(filter),
      Program.findOne(filter).sort({ updatedAt: -1 }).select({ updatedAt: 1 }).lean() as any
    ]);

    const lastTs = latest?.updatedAt ? new Date(latest.updatedAt).getTime() : 0;
    const lastModified = lastTs ? new Date(lastTs).toUTCString() : new Date(0).toUTCString();
    const etag = `W/"programs-${page}-${limit}-${search}-${schoolId}-${level}-${degreeType}-${fieldOfStudy}-${mode}-${country}-${sortBy}-${sortOrder}-${lastTs}"`;

    const ifNoneMatch = request.headers.get('if-none-match');
    const ifModifiedSince = request.headers.get('if-modified-since');
    if (ifNoneMatch === etag || (ifModifiedSince && new Date(ifModifiedSince).getTime() >= lastTs)) {
      return new NextResponse(null, { status: 304, headers: { ETag: etag, 'Last-Modified': lastModified } });
    }

    let programs;
    try {
      programs = await Program.find(filter)
        .populate('schoolId', 'name country city')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('name degreeType fieldOfStudy programLevel mode updatedAt createdAt schoolId')
        .lean();
    } catch (err) {
      console.error('Error during Program.find/populate:', err);
      return NextResponse.json(
        { error: 'Failed to fetch programs (find/populate)', details: err instanceof Error ? err.message : String(err) },
        { status: 500 }
      );
    }

    let filteredPrograms = programs;
    if (country && country !== 'all') {
      filteredPrograms = programs.filter((program: any) => program.schoolId && typeof program.schoolId === 'object' && program.schoolId.country === country);
    }

    const transformedPrograms = filteredPrograms.map((program: any) => ({
      ...program,
      school: program.schoolId,
      schoolId: (program.schoolId as any)?._id,
    }));

    const totalPages = Math.ceil(totalCount / limit);

    const res = NextResponse.json({
      programs: transformedPrograms,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit
      }
    });
    res.headers.set('ETag', etag);
    res.headers.set('Last-Modified', lastModified);
    res.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    return res;
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
    
    // Transform the response to match frontend expectations
    const transformed = savedProgram.toObject ? savedProgram.toObject() : savedProgram;
    const transformedProgram = {
      ...transformed,
      school: transformed.schoolId, // Rename schoolId to school
      schoolId: transformed.schoolId?._id // Keep the original ID as schoolId
    };
    
    return NextResponse.json(transformedProgram, { status: 201 });
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