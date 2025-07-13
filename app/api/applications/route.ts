import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Application from '@/models/Application';
import Scholarship from '@/models/Scholarship';
import ApplicationTemplate from '@/models/ApplicationTemplate';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const applications = await Application.find({ 
      userId: session.user.id,
      isActive: true 
    })
    .populate('scholarshipId', 'title value currency deadline')
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { scholarshipId } = await request.json();

    if (!scholarshipId) {
      return NextResponse.json({ error: 'Scholarship ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if application already exists
    const existingApplication = await Application.findOne({
      userId: session.user.id,
      scholarshipId: scholarshipId,
      isActive: true
    });

    if (existingApplication) {
      return NextResponse.json({ 
        error: 'Application already exists',
        applicationId: existingApplication._id 
      }, { status: 409 });
    }

    // Get scholarship and application template
    const scholarship = await Scholarship.findById(scholarshipId);
    if (!scholarship) {
      return NextResponse.json({ error: 'Scholarship not found' }, { status: 404 });
    }

    // Get or create application template
    let applicationTemplate = await ApplicationTemplate.findOne({
      scholarshipId: scholarshipId,
      isActive: true
    });

    if (!applicationTemplate) {
      // Create a default application template
      applicationTemplate = new ApplicationTemplate({
        scholarshipId: scholarshipId,
        title: `${scholarship.title} Application`,
        description: `Application form for ${scholarship.title}`,
        version: '1.0.0',
        isActive: true,
        sections: [
          {
            id: 'personal-info',
            title: 'Personal Information',
            description: 'Basic personal and contact information',
            order: 1,
            questions: [
              {
                id: 'first-name',
                type: 'text',
                title: 'First Name',
                required: true,
                order: 1,
                placeholder: 'Enter your first name'
              },
              {
                id: 'last-name',
                type: 'text',
                title: 'Last Name',
                required: true,
                order: 2,
                placeholder: 'Enter your last name'
              },
              {
                id: 'email',
                type: 'email',
                title: 'Email Address',
                required: true,
                order: 3,
                placeholder: 'Enter your email address'
              },
              {
                id: 'phone',
                type: 'phone',
                title: 'Phone Number',
                required: false,
                order: 4,
                placeholder: 'Enter your phone number'
              }
            ]
          },
          {
            id: 'academic-info',
            title: 'Academic Information',
            description: 'Your educational background and achievements',
            order: 2,
            questions: [
              {
                id: 'current-school',
                type: 'text',
                title: 'Current School/University',
                required: true,
                order: 1,
                placeholder: 'Enter your current school or university'
              },
              {
                id: 'gpa',
                type: 'gpa',
                title: 'Current GPA',
                required: true,
                order: 2,
                placeholder: 'Enter your current GPA (e.g., 3.8)'
              },
              {
                id: 'major',
                type: 'text',
                title: 'Major/Field of Study',
                required: true,
                order: 3,
                placeholder: 'Enter your major or field of study'
              }
            ]
          },
          {
            id: 'essay',
            title: 'Personal Statement',
            description: 'Tell us about yourself and why you deserve this scholarship',
            order: 3,
            questions: [
              {
                id: 'personal-statement',
                type: 'textarea',
                title: 'Personal Statement',
                description: 'Please write a personal statement explaining your academic goals, achievements, and why you deserve this scholarship.',
                required: true,
                order: 1,
                placeholder: 'Write your personal statement here...',
                maxLength: 1000,
                helpText: 'Maximum 1000 characters'
              }
            ]
          }
        ],
        estimatedTime: 30,
        allowDraftSaving: true
      });

      await applicationTemplate.save();
    }

    // Create new application
    const application = new Application({
      userId: session.user.id,
      scholarshipId: scholarshipId,
      applicationTemplateId: applicationTemplate._id,
      status: 'draft',
      sections: applicationTemplate.sections.map(section => ({
        sectionId: section.id,
        responses: [],
        isComplete: false,
        startedAt: new Date()
      })),
      currentSectionId: applicationTemplate.sections[0]?.id,
      progress: 0,
      startedAt: new Date(),
      lastActivityAt: new Date(),
      isActive: true
    });

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