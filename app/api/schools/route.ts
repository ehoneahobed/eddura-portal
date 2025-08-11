import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
// Import models index to ensure proper registration order
import '@/models/index';
import School from '@/models/School';

/**
 * Transform MongoDB document to include id field
 */
function transformSchool(school: any) {
  if (!school) return school;
  
  const transformed = school.toObject ? school.toObject() : school;
  return {
    ...transformed,
    id: transformed._id?.toString()
  };
}

/**
 * Transform array of schools
 */
function transformSchools(schools: any[]) {
  return schools.map(transformSchool);
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12')));
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;
    
    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }
    
    const [totalCount, latest] = await Promise.all([
      School.countDocuments(filter),
      School.findOne(filter).sort({ updatedAt: -1 }).select({ updatedAt: 1 }).lean() as any
    ]);

    const lastTs = latest?.updatedAt ? new Date(latest.updatedAt).getTime() : 0;
    const lastModified = lastTs ? new Date(lastTs).toUTCString() : new Date(0).toUTCString();
    const etag = `W/"schools-${page}-${limit}-${search}-${lastTs}"`;

    const ifNoneMatch = request.headers.get('if-none-match');
    const ifModifiedSince = request.headers.get('if-modified-since');
    if (ifNoneMatch === etag || (ifModifiedSince && new Date(ifModifiedSince).getTime() >= lastTs)) {
      return new NextResponse(null, { status: 304, headers: { ETag: etag, 'Last-Modified': lastModified } });
    }

    const schools = await School.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('name country city createdAt updatedAt')
      .lean();

    const totalPages = Math.ceil(totalCount / limit) || 1;

    const res = NextResponse.json({
      schools: schools.map(s => ({ ...s, id: s._id?.toString() })),
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
    console.error('Error fetching schools:', error);
    
    // Provide different error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          { error: 'Database connection failed. Please try again later.' },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch schools' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    const school = new School(body);
    const savedSchool = await school.save();
    
    return NextResponse.json(transformSchool(savedSchool), { status: 201 });
  } catch (error) {
    console.error('Error creating school:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create school' },
      { status: 500 }
    );
  }
}