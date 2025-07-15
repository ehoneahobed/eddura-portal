import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import Scholarship from '@/models/Scholarship';
import School from '@/models/School';
import Program from '@/models/Program';
import ApplicationTemplate from '@/models/ApplicationTemplate';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const applications = await Application.find({ 
      userId: session.user.id,
      isActive: true 
    })
    .populate('scholarshipId', 'title value currency deadline')
    .populate('schoolId', 'name country city')
    .populate('programId', 'title school degree')
    .populate('applicationTemplateId', 'title estimatedTime')
    .sort({ lastActivityAt: -1 });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      applicationType, 
      scholarshipId, 
      schoolId, 
      programId, 
      title, 
      description, 
      applicationDeadline, 
      priority = 'medium',
      tags = [],
      notes 
    } = await request.json();

    if (!applicationType) {
      return NextResponse.json({ error: 'Application type is required' }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: 'Application title is required' }, { status: 400 });
    }

    if (!applicationDeadline) {
      return NextResponse.json({ error: 'Application deadline is required' }, { status: 400 });
    }

    await connectDB();

    // Check if application already exists based on type and related entity
    let existingApplication;
    let relatedEntity;
    
    switch (applicationType) {
      case 'scholarship':
        if (!scholarshipId) {
          return NextResponse.json({ error: 'Scholarship ID is required for scholarship applications' }, { status: 400 });
        }
        existingApplication = await Application.findOne({
          userId: session.user.id,
          scholarshipId: scholarshipId,
          isActive: true
        });
        relatedEntity = await Scholarship.findById(scholarshipId);
        if (!relatedEntity) {
          return NextResponse.json({ error: 'Scholarship not found' }, { status: 404 });
        }
        break;
      case 'school':
        if (!schoolId) {
          return NextResponse.json({ error: 'School ID is required for school applications' }, { status: 400 });
        }
        existingApplication = await Application.findOne({
          userId: session.user.id,
          schoolId: schoolId,
          isActive: true
        });
        relatedEntity = await School.findById(schoolId);
        if (!relatedEntity) {
          return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }
        break;
      case 'program':
        if (!programId) {
          return NextResponse.json({ error: 'Program ID is required for program applications' }, { status: 400 });
        }
        existingApplication = await Application.findOne({
          userId: session.user.id,
          programId: programId,
          isActive: true
        });
        relatedEntity = await Program.findById(programId);
        if (!relatedEntity) {
          return NextResponse.json({ error: 'Program not found' }, { status: 404 });
        }
        break;
      default:
        return NextResponse.json({ error: 'Invalid application type' }, { status: 400 });
    }

    if (existingApplication) {
      return NextResponse.json({ 
        error: 'Application already exists',
        applicationId: existingApplication._id 
      }, { status: 409 });
    }

    // For now, we'll create applications without application templates for schools and programs
    // In the future, we can extend this to support application templates for different types
    let applicationTemplate = null;
    
    if (applicationType === 'scholarship') {
      applicationTemplate = await ApplicationTemplate.findOne({
        scholarshipId: scholarshipId,
        isActive: true
      });
    }

    // Create new application
    const applicationData: any = {
      userId: session.user.id,
      applicationType: applicationType,
      title: title,
      description: description,
      applicationDeadline: new Date(applicationDeadline),
      priority: priority,
      tags: tags,
      notes: notes,
      status: 'not_started',
      progress: 0,
      startedAt: new Date(),
      lastActivityAt: new Date(),
      isActive: true,
      tasks: [],
      communications: []
    };

    // Add the appropriate reference based on application type
    if (applicationType === 'scholarship') {
      applicationData.scholarshipId = scholarshipId;
      if (applicationTemplate) {
        applicationData.applicationTemplateId = applicationTemplate._id;
        applicationData.sections = applicationTemplate.sections.map((section: any) => ({
          sectionId: section.id,
          responses: [],
          isComplete: false,
          startedAt: new Date()
        }));
        applicationData.currentSectionId = applicationTemplate.sections[0]?.id;
      }
    } else if (applicationType === 'school') {
      applicationData.schoolId = schoolId;
    } else if (applicationType === 'program') {
      applicationData.programId = programId;
    }

    const application = new Application(applicationData);

    await application.save();

    return NextResponse.json({ 
      message: 'Application created successfully',
      applicationId: application._id 
    });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}