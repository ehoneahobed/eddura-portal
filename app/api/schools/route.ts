import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import School from '@/models/School';

export async function GET() {
  try {
    await connectDB();
    const schools = await School.find({}).sort({ createdAt: -1 });
    return NextResponse.json(schools);
  } catch (error) {
    console.error('Error fetching schools:', error);
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
    
    return NextResponse.json(savedSchool, { status: 201 });
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