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
    console.log('[API] Applications GET request started');
    
    const session = await auth();
    console.log('[API] Session check:', !!session?.user?.id);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[API] Connecting to database...');
    await connectDB();
    console.log('[API] Database connected');

    console.log('[API] Fetching applications for user:', session.user.id);
    const applications = await Application.find({ 
      userId: session.user.id,
      isActive: true 
    })
    .populate('scholarshipId', 'title value currency deadline')
    .populate('schoolId', 'name country city')
    .populate('programId', 'name degreeType fieldOfStudy tuitionFees')
    .populate('applicationTemplateId', 'title estimatedTime')
    .sort({ lastActivityAt: -1 });

    console.log('[API] Found applications:', applications.length);

    console.log('[API] Processing applications with form status...');
    // For scholarship applications, check if there's a corresponding application form
    const applicationsWithFormStatus = await Promise.all(
      applications.map(async (app) => {
        try {
          let applicationFormStatus = 'not_started';
          let applicationFormProgress = 0;
          let applicationFormId = null;

          // Only check for application forms for scholarship packages that are not external
          if (app.applicationType === 'scholarship' && app.scholarshipId && !app.isExternal) {
            // Check if there's an application form for this scholarship
            const applicationForm = await Application.findOne({
              userId: session.user.id,
              scholarshipId: app.scholarshipId,
              applicationType: 'scholarship',
              isActive: true,
              // Exclude the current application package itself
              _id: { $ne: app._id }
            });

            if (applicationForm) {
              applicationFormId = applicationForm._id;
              applicationFormStatus = applicationForm.status;
              applicationFormProgress = applicationForm.progress || 0;
            }
          }

          return {
            ...app.toObject(),
            applicationFormStatus,
            applicationFormProgress,
            applicationFormId
          };
        } catch (error) {
          console.error('[API] Error processing application:', app._id, error);
          return {
            ...app.toObject(),
            applicationFormStatus: 'not_started',
            applicationFormProgress: 0,
            applicationFormId: null
          };
        }
      })
    );

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
    
    console.log('[API] Transforming applications...');
    // Transform applications to include proper data
    const transformedApplications = applicationsWithFormStatus.map(app => {
      try {
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
          },
          // Application form tracking
          applicationFormStatus: app.applicationFormStatus,
          applicationFormProgress: app.applicationFormProgress,
          applicationFormId: app.applicationFormId
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
      } catch (error) {
        console.error('[API] Error transforming application:', app._id, error);
        // Return a minimal application object to prevent the entire request from failing
        return {
          _id: app._id,
          name: app.name || 'Unknown Application',
          description: app.description || '',
          status: app.status || 'draft',
          priority: app.priority || 'medium',
          progress: app.progress || 0,
          applicationType: app.applicationType || 'unknown',
          scholarshipId: {
            _id: String(app._id),
            title: app.name || 'Unknown Application',
            value: null,
            currency: null,
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            type: app.applicationType || 'unknown'
          },
          applicationFormStatus: 'not_started',
          applicationFormProgress: 0,
          applicationFormId: null
        };
      }
    });

    console.log('[API] Transformed applications:', transformedApplications.length);
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
    const { searchParams } = new URL(request.url);
    const bypassDuplicateCheck = searchParams.get('bypassDuplicateCheck') === 'true';
    
    console.log('=== API REQUEST DEBUG ===');
    console.log('Raw request body:', JSON.stringify(body, null, 2));
    console.log('Request URL:', request.url);
    console.log('Bypass duplicate check:', bypassDuplicateCheck);
    
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
    
    console.log('=== EXTRACTED FIELDS ===');
    console.log('name:', name);
    console.log('name type:', typeof name);
    console.log('name length:', name?.length);
    console.log('name trimmed:', name?.trim());
    console.log('name === "undefined":', name === 'undefined');
    console.log('name === undefined:', name === undefined);
    console.log('name === null:', name === null);
    console.log('name === "":', name === '');
    console.log('applicationType:', applicationType);
    console.log('targetId:', targetId);
    console.log('targetName:', targetName);

    console.log('=== VALIDATION CHECKS ===');
    console.log('!name:', !name);
    console.log('!applicationType:', !applicationType);
    console.log('name.trim():', name?.trim());
    console.log('name.trim() === "undefined":', name?.trim() === 'undefined');
    
    if (!name || !applicationType) {
      console.log('Validation failed: Missing name or applicationType');
      return NextResponse.json({ error: 'Name and application type are required' }, { status: 400 });
    }

    // Validate that the name is not undefined, null, empty, or "undefined"
    if (!name || !name.trim() || name.trim() === 'undefined') {
      console.log('Validation failed: Invalid name format');
      return NextResponse.json({ error: 'Please provide a valid application package name' }, { status: 400 });
    }

    await connectDB();

    // Check if application package already exists with the same name
    // Skip the check if the name is "undefined" or empty, as these are invalid names
    console.log('=== DUPLICATE CHECK ===');
    console.log('bypassDuplicateCheck:', bypassDuplicateCheck);
    console.log('name.trim():', name?.trim());
    console.log('name.trim() !== "undefined":', name?.trim() !== 'undefined');
    console.log('Should check for duplicates:', !bypassDuplicateCheck && name.trim() && name.trim() !== 'undefined');
    
    if (!bypassDuplicateCheck && name.trim() && name.trim() !== 'undefined') {
      const trimmedName = name.trim();
      console.log('Checking for duplicate name:', {
        userId: session.user.id,
        name: trimmedName,
        nameLength: trimmedName.length
      });

      // First, let's see all applications for this user to debug
      const allUserApplications = await Application.find({
        userId: session.user.id,
        isActive: true
      }).select('name');

      console.log('All user applications:', allUserApplications.map(app => ({
        name: app.name,
        nameLength: app.name.length
      })));

      // Check for exact match first
      const existingApplication = await Application.findOne({
        userId: session.user.id,
        name: trimmedName,
        isActive: true
      });

      console.log('Existing application found:', existingApplication ? {
        id: existingApplication._id,
        name: existingApplication.name,
        nameLength: existingApplication.name.length
      } : 'None');

      if (existingApplication) {
        console.log('DUPLICATE FOUND - returning 409 error');
        // Generate a suggested unique name
        let suggestedName = trimmedName;
        let counter = 1;
        
        // Keep checking until we find a unique name
        while (true) {
          const testName = counter === 1 ? suggestedName : `${suggestedName} (${counter})`;
          const testApplication = await Application.findOne({
            userId: session.user.id,
            name: testName,
            isActive: true
          });
          
          if (!testApplication) {
            suggestedName = testName;
            break;
          }
          counter++;
        }

        return NextResponse.json({ 
          error: 'Application package with this name already exists',
          applicationId: existingApplication._id,
          suggestedName: suggestedName
        }, { status: 409 });
      }

      // Also check for case-insensitive match as a fallback
      const caseInsensitiveMatch = await Application.findOne({
        userId: session.user.id,
        name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
        isActive: true
      });

      if (caseInsensitiveMatch && caseInsensitiveMatch.name !== trimmedName) {
        console.log('Case-insensitive match found:', {
          submitted: trimmedName,
          existing: caseInsensitiveMatch.name
        });
        
        return NextResponse.json({ 
          error: 'Application package with this name already exists (case-insensitive match)',
          applicationId: caseInsensitiveMatch._id,
          suggestedName: `${trimmedName} (1)`
        }, { status: 409 });
      }
    } else {
      console.log('Skipping duplicate check due to bypass or invalid name');
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
        applicationType: applicationType,
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
      if (applicationType === 'scholarship') {
        templateData.scholarshipId = targetId;
      } else if (applicationType === 'school') {
        templateData.schoolId = targetId;
      } else if (applicationType === 'program') {
        templateData.programId = targetId;
      }

      // Use findOneAndUpdate with upsert to prevent race conditions
      applicationTemplate = await ApplicationTemplate.findOneAndUpdate(
        {
          applicationType: applicationType,
          ...(applicationType === 'scholarship' ? { scholarshipId: targetId } : {}),
          ...(applicationType === 'school' ? { schoolId: targetId } : {}),
          ...(applicationType === 'program' ? { programId: targetId } : {})
        },
        templateData,
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );
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