import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Program from '@/models/Program';

export async function GET() {
  try {
    await connectDB();
    const programs = await Program.find({})
      .populate('schoolId', 'name country city')
      .sort({ createdAt: -1 });
    return NextResponse.json(programs);
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
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