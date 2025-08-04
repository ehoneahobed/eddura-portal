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
  console.log('🔍 [SCHOOLS API] GET request received');
  
  try {
    console.log('🔍 [SCHOOLS API] Connecting to database...');
    await connectDB();
    console.log('✅ [SCHOOLS API] Database connected successfully');
    
    // Get query parameters with validation
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12')));
    const search = searchParams.get('search') || '';
    
    console.log('🔍 [SCHOOLS API] Query parameters:', { page, limit, search });
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter: any = {};
    
    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
      console.log('🔍 [SCHOOLS API] Search filter applied:', filter);
    }
    
    console.log('🔍 [SCHOOLS API] Counting documents with filter:', filter);
    // Get total count for pagination
    const totalCount = await School.countDocuments(filter);
    console.log('✅ [SCHOOLS API] Total count:', totalCount);
    
    console.log('🔍 [SCHOOLS API] Fetching schools with skip:', skip, 'limit:', limit);
    // Get paginated schools
    const schools = await School.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    console.log('✅ [SCHOOLS API] Schools fetched:', schools.length);
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit) || 1;
    
    const response = {
      schools: transformSchools(schools),
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit
      }
    };
    
    console.log('✅ [SCHOOLS API] Response prepared:', {
      schoolsCount: response.schools.length,
      pagination: response.pagination
    });
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ [SCHOOLS API] Error fetching schools:', error);
    
    // Provide different error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        console.error('❌ [SCHOOLS API] Database connection error');
        return NextResponse.json(
          { error: 'Database connection failed. Please try again later.' },
          { status: 503 }
        );
      }
    }
    
    console.error('❌ [SCHOOLS API] Generic error, returning 500');
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