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
    .populate('programId', 'name degreeType fieldOfStudy tuitionFees')
    .populate('applicationTemplateId', 'title estimatedTime')
    .sort({ lastActivityAt: -1 });

    // Transform applications to include proper data
    const transformedApplications = applications.map(app => {
      let applicationData: any = {
        _id: app._id,
        status: app.status,
        progress: app.progress,
        currentSectionId: app.currentSectionId,
        startedAt: app.startedAt,
        lastActivityAt: app.lastActivityAt,
        submittedAt: app.submittedAt,
        estimatedTimeRemaining: app.estimatedTimeRemaining,
        notes: app.notes,
        applicationType: app.applicationType
      };

      // Add the appropriate data based on application type
      if (app.applicationType === 'scholarship' && app.scholarshipId && typeof app.scholarshipId === 'object') {
        const scholarship = app.scholarshipId as any;
        applicationData.scholarshipId = {
          _id: scholarship._id,
          title: scholarship.title,
          value: scholarship.value,
          currency: scholarship.currency,
          deadline: scholarship.deadline,
          type: 'scholarship'
        };
      } else if (app.applicationType === 'school' && app.schoolId && typeof app.schoolId === 'object') {
        const school = app.schoolId as any;
        applicationData.scholarshipId = {
          _id: school._id,
          title: school.name,
          value: null,
          currency: null,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Default deadline
          type: 'school'
        };
      } else if (app.applicationType === 'program' && app.programId && typeof app.programId === 'object') {
        const program = app.programId as any;
        applicationData.scholarshipId = {
          _id: program._id,
          title: program.name,
          value: program.tuitionFees?.international || null,
          currency: program.tuitionFees?.currency || null,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Default deadline
          type: 'program'
        };
      }

      return applicationData;
    });

    return NextResponse.json({ applications: transformedApplications });
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

    const { scholarshipId, schoolId, programId, applicationType } = await request.json();

    if (!applicationType) {
      return NextResponse.json({ error: 'Application type is required' }, { status: 400 });
    }

    let targetId;
    if (applicationType === 'scholarship' && scholarshipId) {
      targetId = scholarshipId;
    } else if (applicationType === 'school' && schoolId) {
      targetId = schoolId;
    } else if (applicationType === 'program' && programId) {
      targetId = programId;
    } else {
      return NextResponse.json({ error: 'Valid ID is required for the application type' }, { status: 400 });
    }

    await connectDB();

    // Check if application already exists
    const existingApplication = await Application.findOne({
      userId: session.user.id,
      applicationType,
      ...(applicationType === 'scholarship' && { scholarshipId }),
      ...(applicationType === 'school' && { schoolId }),
      ...(applicationType === 'program' && { programId }),
      isActive: true
    });

    if (existingApplication) {
      return NextResponse.json({ 
        error: 'Application already exists',
        applicationId: existingApplication._id 
      }, { status: 409 });
    }

    // Get the target entity and application template
    let targetEntity;
    let applicationTemplate;

    if (applicationType === 'scholarship') {
      targetEntity = await Scholarship.findById(scholarshipId);
      if (!targetEntity) {
        return NextResponse.json({ error: 'Scholarship not found' }, { status: 404 });
      }
      applicationTemplate = await ApplicationTemplate.findOne({
        applicationType: 'scholarship',
        scholarshipId: scholarshipId,
        isActive: true
      });
    } else if (applicationType === 'school') {
      targetEntity = await School.findById(schoolId);
      if (!targetEntity) {
        return NextResponse.json({ error: 'School not found' }, { status: 404 });
      }
      applicationTemplate = await ApplicationTemplate.findOne({
        applicationType: 'school',
        schoolId: schoolId,
        isActive: true
      });
    } else if (applicationType === 'program') {
      targetEntity = await Program.findById(programId);
      if (!targetEntity) {
        return NextResponse.json({ error: 'Program not found' }, { status: 404 });
      }
      applicationTemplate = await ApplicationTemplate.findOne({
        applicationType: 'program',
        programId: programId,
        isActive: true
      });
    }

          if (!applicationTemplate) {
        // Create a default application template
        const entityName = (targetEntity as any).title || (targetEntity as any).name || 'Application';
        const templateData: any = {
          title: `${entityName} Application`,
          description: `Application form for ${entityName}`,
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

        // Add the appropriate reference based on application type
        templateData.applicationType = applicationType;
        if (applicationType === 'scholarship') {
          templateData.scholarshipId = scholarshipId;
        } else if (applicationType === 'school') {
          templateData.schoolId = schoolId;
        } else if (applicationType === 'program') {
          templateData.programId = programId;
        }

        applicationTemplate = new ApplicationTemplate(templateData);

      await applicationTemplate.save();
    }

    // Create new application
    const applicationData: any = {
      userId: session.user.id,
      applicationType,
      applicationTemplateId: applicationTemplate._id,
      status: 'draft',
      sections: applicationTemplate.sections.map((section: any) => ({
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
    };

    // Add the appropriate reference based on application type
    if (applicationType === 'scholarship') {
      applicationData.scholarshipId = scholarshipId;
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