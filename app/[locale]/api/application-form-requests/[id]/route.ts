import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ApplicationFormRequest from '@/models/ApplicationFormRequest';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const request = await ApplicationFormRequest.findById(resolvedParams.id)
      .populate('user', 'firstName lastName email')
      .populate('scholarship', 'title provider')
      .populate('admin', 'firstName lastName email')
      .populate('applicationTemplate', 'title version');

    if (!request) {
      return NextResponse.json(
        { error: 'Application form request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(request);
  } catch (error) {
    console.error('Error fetching application form request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application form request' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const session = await auth();
    if (!session || !isAdmin(session.user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status, adminNotes, applicationTemplateId } = body;

    const resolvedParams = await params;
    const applicationFormRequest = await ApplicationFormRequest.findById(resolvedParams.id);
    
    if (!applicationFormRequest) {
      return NextResponse.json(
        { error: 'Application form request not found' },
        { status: 404 }
      );
    }

    // Update the request
    if (status) {
      applicationFormRequest.status = status;
    }
    
    if (adminNotes !== undefined) {
      applicationFormRequest.adminNotes = adminNotes;
    }
    
    if (applicationTemplateId) {
      applicationFormRequest.applicationTemplateId = applicationTemplateId;
    }

    // Set processed information
    applicationFormRequest.processedAt = new Date();
    applicationFormRequest.processedBy = new mongoose.Types.ObjectId(session.user.id);

    const updatedRequest = await applicationFormRequest.save();
    
    // Populate the updated request
    const populatedRequest = await ApplicationFormRequest.findById(updatedRequest._id)
      .populate('user', 'firstName lastName email')
      .populate('scholarship', 'title provider')
      .populate('admin', 'firstName lastName email')
      .populate('applicationTemplate', 'title version');

    return NextResponse.json(populatedRequest);
  } catch (error) {
    console.error('Error updating application form request:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update application form request' },
      { status: 500 }
    );
  }
}