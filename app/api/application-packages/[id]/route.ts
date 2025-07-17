import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import '@/models/index';
import ApplicationPackage from '@/models/ApplicationPackage';

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

    const applicationPackage = await ApplicationPackage.findOne({
      _id: id,
      userId: session.user.id
    })
    .populate('interestId')
    .populate({
      path: 'interestId',
      populate: [
        {
          path: 'programId',
          select: 'name degreeType fieldOfStudy schoolId applicationRequirements'
        },
        {
          path: 'schoolId',
          select: 'name country city'
        }
      ]
    })
    .populate({
      path: 'interestId',
      populate: {
        path: 'programId',
        populate: {
          path: 'schoolId',
          select: 'name country city'
        }
      }
    });

    if (!applicationPackage) {
      return NextResponse.json({ error: 'Application package not found' }, { status: 404 });
    }

    return NextResponse.json({ package: applicationPackage });
  } catch (error) {
    console.error('Error fetching application package:', error);
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
      name, 
      documents, 
      applicationStatus, 
      appliedAt, 
      decision, 
      decisionDate, 
      notes,
      linkedScholarships 
    } = body;

    await connectDB();

    const applicationPackage = await ApplicationPackage.findOne({
      _id: id,
      userId: session.user.id
    });

    if (!applicationPackage) {
      return NextResponse.json({ error: 'Application package not found' }, { status: 404 });
    }

    // Update fields
    if (name !== undefined) applicationPackage.name = name;
    if (documents !== undefined) applicationPackage.documents = documents;
    if (applicationStatus !== undefined) applicationPackage.applicationStatus = applicationStatus;
    if (appliedAt !== undefined) applicationPackage.appliedAt = appliedAt;
    if (decision !== undefined) applicationPackage.decision = decision;
    if (decisionDate !== undefined) applicationPackage.decisionDate = decisionDate;
    if (notes !== undefined) applicationPackage.notes = notes;
    if (linkedScholarships !== undefined) applicationPackage.linkedScholarships = linkedScholarships;

    await applicationPackage.save();

    // Populate the updated package
    await applicationPackage.populate('interestId');
    await applicationPackage.populate({
      path: 'interestId',
      populate: [
        {
          path: 'programId',
          select: 'name degreeType fieldOfStudy schoolId applicationRequirements'
        },
        {
          path: 'schoolId',
          select: 'name country city'
        }
      ]
    });
    await applicationPackage.populate({
      path: 'interestId',
      populate: {
        path: 'programId',
        populate: {
          path: 'schoolId',
          select: 'name country city'
        }
      }
    });

    return NextResponse.json({ 
      message: 'Application package updated successfully',
      package: applicationPackage 
    });
  } catch (error) {
    console.error('Error updating application package:', error);
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

    const applicationPackage = await ApplicationPackage.findOneAndDelete({
      _id: id,
      userId: session.user.id
    });

    if (!applicationPackage) {
      return NextResponse.json({ error: 'Application package not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Application package deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting application package:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}