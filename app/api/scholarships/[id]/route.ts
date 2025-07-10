import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Scholarship from '@/models/Scholarship';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    await connectDB();

    const scholarship = await Scholarship.findById(resolvedParams.id).lean();

    if (!scholarship) {
      return NextResponse.json(
        { message: "Scholarship not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ scholarship });
  } catch (error) {
    console.error('Error fetching scholarship:', error);
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
    const updatedScholarship = await Scholarship.findByIdAndUpdate(
      resolvedParams.id,
      body,
      { new: true, runValidators: true }
    );

    if (!updatedScholarship) {
      return NextResponse.json(
        { message: "Scholarship not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Scholarship updated successfully",
      scholarship: updatedScholarship
    });
  } catch (error) {
    console.error('Error updating scholarship:', error);
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

    const deletedScholarship = await Scholarship.findByIdAndDelete(resolvedParams.id);

    if (!deletedScholarship) {
      return NextResponse.json(
        { message: "Scholarship not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Scholarship deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting scholarship:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}