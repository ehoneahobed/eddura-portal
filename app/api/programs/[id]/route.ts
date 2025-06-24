import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Program from '@/models/Program';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid program ID' }, { status: 400 });
    }
    
    const program = await Program.findById(params.id)
      .populate('schoolId', 'name country city');
    
    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }
    
    return NextResponse.json(program);
  } catch (error) {
    console.error('Error fetching program:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid program ID' }, { status: 400 });
    }
    
    const body = await request.json();
    
    const program = await Program.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    ).populate('schoolId', 'name country city');
    
    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }
    
    return NextResponse.json(program);
  } catch (error) {
    console.error('Error updating program:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update program' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid program ID' }, { status: 400 });
    }
    
    const program = await Program.findByIdAndDelete(params.id);
    
    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Program deleted successfully' });
  } catch (error) {
    console.error('Error deleting program:', error);
    return NextResponse.json(
      { error: 'Failed to delete program' },
      { status: 500 }
    );
  }
}