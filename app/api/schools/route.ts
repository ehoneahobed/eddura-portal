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
    
    // Get query parameters with validation
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12')));
    const search = searchParams.get('search') || '';
    
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
    }
    
    // Get total count for pagination
    const totalCount = await School.countDocuments(filter);
    
    // Get paginated schools
    const schools = await School.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit) || 1;
    
    return NextResponse.json({
      schools: transformSchools(schools),
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