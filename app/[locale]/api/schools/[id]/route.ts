import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import School from '@/models/School';
import mongoose from 'mongoose';

/**
 * Transform MongoDB document to include id field
 */
function transformSchool(school: any) {
  if (!school) return school;
  
  return {
    ...school,
    id: school._id?.toString()
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    await connectDB();

    const school = await School.findById(resolvedParams.id).lean();

    if (!school) {
      return NextResponse.json(
        { message: "School not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(transformSchool(school));
  } catch (error) {
    console.error('Error fetching school:', error);
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
    const updatedSchool = await School.findByIdAndUpdate(
      resolvedParams.id,
      body,
      { new: true, runValidators: true }
    );

    if (!updatedSchool) {
      return NextResponse.json(
        { message: "School not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "School updated successfully",
      school: updatedSchool
    });
  } catch (error) {
    console.error('Error updating school:', error);
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

    const deletedSchool = await School.findByIdAndDelete(resolvedParams.id);

    if (!deletedSchool) {
      return NextResponse.json(
        { message: "School not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "School deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting school:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}