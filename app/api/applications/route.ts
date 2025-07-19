import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
// Import models index to ensure proper registration order
import '@/models/index';
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

    console.log('Raw applications from DB:', applications);
    console.log('Raw application details:', applications.map(app => ({
      id: app._id,
      type: app.applicationType,
      hasScholarshipId: !!app.scholarshipId,
      hasSchoolId: !!app.schoolId,
      hasProgramId: !!app.programId,
      scholarshipIdType: typeof app.scholarshipId,
      schoolIdType: typeof app.schoolId,
      programIdType: typeof app.programId
    })));
    
    // Transform applications to include proper data
    const transformedApplications = applications.map(app => {
      let applicationData: any = {
        _id: app._id,
        name: app.name,
        description: app.description,
        status: app.status,
        priority: app.priority,
        progress: app.progress,
        currentSectionId: app.currentSectionId,
        startedAt: app.startedAt,
        lastActivityAt: app.lastActivityAt,
        submittedAt: app.submittedAt,
        estimatedTimeRemaining: app.estimatedTimeRemaining,
        notes: app.notes,
        applicationType: app.applicationType,
        applicationDeadline: app.applicationDeadline,
        targetId: app.targetId,
        targetName: app.targetName,
        isExternal: app.isExternal,
        externalSchoolName: app.externalSchoolName,
        externalProgramName: app.externalProgramName,
        externalApplicationUrl: app.externalApplicationUrl,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        requirementsProgress: app.requirementsProgress || {
          total: 0,
          completed: 0,
          required: 0,
          requiredCompleted: 0
        }
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
      } else {
        // Fallback for applications that don't have proper data
        console.log('Application without proper data:', {
          id: app._id,
          type: app.applicationType,
          hasScholarshipId: !!app.scholarshipId,
          hasSchoolId: !!app.schoolId,
          hasProgramId: !!app.programId
        });
        
        // Create a default scholarshipId structure
        const appId = String(app._id);
        applicationData.scholarshipId = {
          _id: appId,
          title: `Application ${appId.slice(-6)}`,
          value: null,
          currency: null,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          type: app.applicationType || 'unknown'
        };
      }

      return applicationData;
    });

    console.log('Transformed applications:', transformedApplications);
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

    const body = await request.json();
    const { 
      name,
      description,
      applicationType,
      targetId,
      targetName,
      externalSchoolName,
      externalProgramName,
      externalScholarshipName,
      externalApplicationUrl,
      externalType,
      applicationDeadline,
      priority,
      notes,
      isExternal
    } = body;

    if (!name || !applicationType) {
      return NextResponse.json({ error: 'Name and application type are required' }, { status: 400 });
    }

    // Validate that the name is not undefined, null, empty, or "undefined"
    if (!name || !name.trim() || name.trim() === 'undefined') {
      return NextResponse.json({ error: 'Please provide a valid application package name' }, { status: 400 });
    }

    await connectDB();

    // Check if application package already exists with the same name
    // Skip the check if the name is "undefined" or empty, as these are invalid names
    if (name.trim() && name.trim() !== 'undefined') {
      const existingApplication = await Application.findOne({
        userId: session.user.id,
        name: name.trim(),
        isActive: true
      });

      if (existingApplication) {
        return NextResponse.json({ 
          error: 'Application package with this name already exists',
          applicationId: existingApplication._id 
        }, { status: 409 });
      }
    }

    // Validate target entity if provided
    let targetEntity = null;
    let applicationTemplate = null;

    if (targetId && !isExternal) {
      if (applicationType === 'scholarship') {
        targetEntity = await Scholarship.findById(targetId);
        if (!targetEntity) {
          return NextResponse.json({ error: 'Scholarship not found' }, { status: 404 });
        }
        applicationTemplate = await ApplicationTemplate.findOne({
          applicationType: 'scholarship',
          scholarshipId: targetId,
          isActive: true
        });
      } else if (applicationType === 'school') {
        targetEntity = await School.findById(targetId);
        if (!targetEntity) {
          return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }
        applicationTemplate = await ApplicationTemplate.findOne({
          applicationType: 'school',
          schoolId: targetId,
          isActive: true
        });
      } else if (applicationType === 'program') {
        targetEntity = await Program.findById(targetId);
        if (!targetEntity) {
          return NextResponse.json({ error: 'Program not found' }, { status: 404 });
        }
        applicationTemplate = await ApplicationTemplate.findOne({
          applicationType: 'program',
          programId: targetId,
          isActive: true
        });
      }
    }

    // Create default application template if none exists
    if (!applicationTemplate && targetEntity) {
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
        templateData.scholarshipId = targetId;
      } else if (applicationType === 'school') {
        templateData.schoolId = targetId;
      } else if (applicationType === 'program') {
        templateData.programId = targetId;
      }

      applicationTemplate = new ApplicationTemplate(templateData);
      await applicationTemplate.save();
    }

    // Create new application package
    const applicationData: any = {
      userId: session.user.id,
      name: name.trim(),
      description: description?.trim() || '',
      applicationType,
      status: 'draft',
      priority: priority || 'medium',
      notes: notes?.trim() || '',
      applicationDeadline: applicationDeadline || null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add target information
    if (targetId && !isExternal) {
      applicationData.targetId = targetId;
      applicationData.targetName = targetName;
      
      // Add the appropriate reference based on application type
      if (applicationType === 'scholarship') {
        applicationData.scholarshipId = targetId;
      } else if (applicationType === 'school') {
        applicationData.schoolId = targetId;
      } else if (applicationType === 'program') {
        applicationData.programId = targetId;
      }
    }

    // Add external information
    if (isExternal || applicationType === 'external') {
      applicationData.isExternal = true;
      applicationData.externalSchoolName = externalSchoolName?.trim() || '';
      applicationData.externalProgramName = externalProgramName?.trim() || '';
      applicationData.externalScholarshipName = externalScholarshipName?.trim() || '';
      applicationData.externalApplicationUrl = externalApplicationUrl?.trim() || '';
      applicationData.externalType = externalType || 'unknown';
    }

    // Add application template if available
    if (applicationTemplate) {
      applicationData.applicationTemplateId = applicationTemplate._id;
      applicationData.sections = applicationTemplate.sections.map((section: any) => ({
        sectionId: section.id,
        responses: [],
        isComplete: false,
        startedAt: new Date()
      }));
      applicationData.currentSectionId = applicationTemplate.sections[0]?.id;
      applicationData.progress = 0;
    }

    const application = new Application(applicationData);
    await application.save();

    return NextResponse.json({ 
      message: 'Application package created successfully',
      applicationId: application._id,
      application: application
    });
  } catch (error) {
    console.error('Error creating application package:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}