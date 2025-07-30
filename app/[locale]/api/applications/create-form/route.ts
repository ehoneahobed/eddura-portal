import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import '@/models/index';
import Application from '@/models/Application';
import Scholarship from '@/models/Scholarship';
import ApplicationTemplate from '@/models/ApplicationTemplate';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { packageId, scholarshipId } = body;

    if (!packageId || !scholarshipId) {
      return NextResponse.json({ error: 'Package ID and scholarship ID are required' }, { status: 400 });
    }

    await connectDB();

    // Get the application package
    const applicationPackage = await Application.findOne({
      _id: packageId,
      userId: session.user.id,
      isActive: true
    });

    if (!applicationPackage) {
      return NextResponse.json({ error: 'Application package not found' }, { status: 404 });
    }

    // Check if this is an external scholarship (we can't create forms for external scholarships)
    if (applicationPackage.isExternal) {
      return NextResponse.json({ 
        error: 'Cannot create application forms for external scholarships. Please use the external application link.' 
      }, { status: 400 });
    }

    // Check if application form already exists for this scholarship
    const existingForm = await Application.findOne({
      userId: session.user.id,
      scholarshipId: scholarshipId,
      applicationType: 'scholarship',
      isActive: true,
      _id: { $ne: packageId } // Exclude the package itself
    });

    if (existingForm) {
      return NextResponse.json({ 
        error: 'Application form already exists for this scholarship',
        applicationId: existingForm._id 
      }, { status: 409 });
    }

    // Get the scholarship details
    const scholarship = await Scholarship.findById(scholarshipId);
    if (!scholarship) {
      return NextResponse.json({ error: 'Scholarship not found' }, { status: 404 });
    }

    // Get or create application template using findOneAndUpdate to prevent race conditions
    const templateData = {
      title: `${scholarship.title} Application`,
      description: `Application form for ${scholarship.title}`,
      version: '1.0.0',
      isActive: true,
      applicationType: 'scholarship',
      scholarshipId: scholarshipId,
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
          description: 'Tell us about yourself and why you deserve this opportunity',
          order: 3,
          questions: [
            {
              id: 'personal-statement',
              type: 'textarea',
              title: 'Personal Statement',
              description: 'Please write a personal statement explaining your academic goals, achievements, and why you deserve this opportunity.',
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
    };

    // Use findOneAndUpdate with upsert to prevent race conditions
    const applicationTemplate = await ApplicationTemplate.findOneAndUpdate(
      {
        applicationType: 'scholarship',
        scholarshipId: scholarshipId,
        isActive: true
      },
      templateData,
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    // Create the application form
    const applicationFormData = {
      userId: session.user.id,
      name: `${scholarship.title} Application Form`,
      description: `Application form for ${scholarship.title}`,
      applicationType: 'scholarship',
      scholarshipId: scholarshipId,
      status: 'draft',
      priority: applicationPackage.priority || 'medium',
      applicationDeadline: applicationPackage.applicationDeadline,
      applicationTemplateId: applicationTemplate._id,
      sections: applicationTemplate.sections.map((section: any) => ({
        sectionId: section.id,
        responses: [],
        isComplete: false,
        startedAt: new Date()
      })),
      currentSectionId: applicationTemplate.sections[0]?.id,
      progress: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const applicationForm = new Application(applicationFormData);
    await applicationForm.save();

    return NextResponse.json({ 
      message: 'Application form created successfully',
      applicationId: applicationForm._id,
      application: applicationForm
    });
  } catch (error) {
    console.error('Error creating application form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 