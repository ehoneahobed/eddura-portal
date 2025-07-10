import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Program from '@/models/Program';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    await connectDB();

    const program = await Program.findById(resolvedParams.id).lean();

    if (!program) {
      return NextResponse.json(
        { message: "Program not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ program });
  } catch (error) {
    console.error('Error fetching program:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    await connectDB();

    const body = await request.json();
    const updatedProgram = await Program.findByIdAndUpdate(
      resolvedParams.id,
      body,
      { new: true, runValidators: true }
    );

    if (!updatedProgram) {
      return NextResponse.json(
        { message: "Program not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Program updated successfully",
      program: updatedProgram
    });
  } catch (error) {
    console.error('Error updating program:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    await connectDB();

    const deletedProgram = await Program.findByIdAndDelete(resolvedParams.id);

    if (!deletedProgram) {
      return NextResponse.json(
        { message: "Program not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Program deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting program:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}