import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import '@/models/index';
import UserInterest from '@/models/UserInterest';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const interest = await UserInterest.findOne({
      _id: id,
      userId: session.user.id
    })
    .populate('programId', 'name degreeType fieldOfStudy schoolId applicationRequirements')
    .populate('schoolId', 'name country city')
    .populate({
      path: 'programId',
      populate: {
        path: 'schoolId',
        select: 'name country city'
      }
    });

    if (!interest) {
      return NextResponse.json({ error: 'Interest not found' }, { status: 404 });
    }

    return NextResponse.json({ interest });
  } catch (error) {
    console.error('Error fetching user interest:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      status, 
      priority, 
      notes, 
      requiresInterview, 
      interviewScheduled,
      interviewDate,
      interviewType,
      interviewNotes,
      appliedAt,
      decisionDate 
    } = body;

    await connectDB();

    const interest = await UserInterest.findOne({
      _id: id,
      userId: session.user.id
    });

    if (!interest) {
      return NextResponse.json({ error: 'Interest not found' }, { status: 404 });
    }

    // Update fields
    if (status !== undefined) interest.status = status;
    if (priority !== undefined) interest.priority = priority;
    if (notes !== undefined) interest.notes = notes;
    if (requiresInterview !== undefined) interest.requiresInterview = requiresInterview;
    if (interviewScheduled !== undefined) interest.interviewScheduled = interviewScheduled;
    if (interviewDate !== undefined) interest.interviewDate = interviewDate;
    if (interviewType !== undefined) interest.interviewType = interviewType;
    if (interviewNotes !== undefined) interest.interviewNotes = interviewNotes;
    if (appliedAt !== undefined) interest.appliedAt = appliedAt;
    if (decisionDate !== undefined) interest.decisionDate = decisionDate;

    await interest.save();

    // Populate the updated interest
    await interest.populate('programId', 'name degreeType fieldOfStudy schoolId');
    await interest.populate('schoolId', 'name country city');
    await interest.populate({
      path: 'programId',
      populate: {
        path: 'schoolId',
        select: 'name country city'
      }
    });

    return NextResponse.json({ 
      message: 'Interest updated successfully',
      interest 
    });
  } catch (error) {
    console.error('Error updating user interest:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const interest = await UserInterest.findOneAndDelete({
      _id: id,
      userId: session.user.id
    });

    if (!interest) {
      return NextResponse.json({ error: 'Interest not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Interest deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting user interest:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}