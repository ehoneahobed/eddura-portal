import mongoose from 'mongoose';
import ApplicationTemplate from '../models/ApplicationTemplate';
import Scholarship from '../models/Scholarship';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

/**
 * Create application templates for scholarships
 * This ensures that scholarships have application forms available
 */
async function createScholarshipApplicationTemplates() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is required');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    console.log('🌱 Starting to create application templates for scholarships...');

    // Get all scholarships
    const scholarships = await Scholarship.find({});
    console.log(`📊 Found ${scholarships.length} scholarships`);

    let templatesCreated = 0;

    // Create application templates for scholarships
    for (const scholarship of scholarships) {
      // Check if application template already exists for this scholarship
      const existingTemplate = await ApplicationTemplate.findOne({
        scholarshipId: scholarship._id
      });

      if (existingTemplate) {
        console.log(`⏭️  Application template already exists for scholarship: ${scholarship.title}`);
        continue;
      }

      // Create a basic application template for the scholarship
      const template = new ApplicationTemplate({
        title: `${scholarship.title} Application Form`,
        description: `Application form for ${scholarship.title} scholarship`,
        scholarshipId: scholarship._id,
        isActive: true,
        formFields: [
          {
            name: 'personalInfo',
            label: 'Personal Information',
            type: 'section',
            required: true,
            fields: [
              {
                name: 'firstName',
                label: 'First Name',
                type: 'text',
                required: true,
                placeholder: 'Enter your first name'
              },
              {
                name: 'lastName',
                label: 'Last Name',
                type: 'text',
                required: true,
                placeholder: 'Enter your last name'
              },
              {
                name: 'email',
                label: 'Email Address',
                type: 'email',
                required: true,
                placeholder: 'Enter your email address'
              },
              {
                name: 'phone',
                label: 'Phone Number',
                type: 'tel',
                required: false,
                placeholder: 'Enter your phone number'
              },
              {
                name: 'dateOfBirth',
                label: 'Date of Birth',
                type: 'date',
                required: true
              }
            ]
          },
          {
            name: 'academicInfo',
            label: 'Academic Information',
            type: 'section',
            required: true,
            fields: [
              {
                name: 'currentSchool',
                label: 'Current School/Institution',
                type: 'text',
                required: true,
                placeholder: 'Enter your current school or institution'
              },
              {
                name: 'gpa',
                label: 'GPA',
                type: 'number',
                required: true,
                placeholder: 'Enter your GPA (e.g., 3.5)',
                min: 0,
                max: 4
              },
              {
                name: 'fieldOfStudy',
                label: 'Field of Study',
                type: 'text',
                required: true,
                placeholder: 'Enter your field of study'
              },
              {
                name: 'expectedGraduation',
                label: 'Expected Graduation Date',
                type: 'date',
                required: true
              }
            ]
          },
          {
            name: 'financialInfo',
            label: 'Financial Information',
            type: 'section',
            required: true,
            fields: [
              {
                name: 'annualIncome',
                label: 'Annual Family Income',
                type: 'number',
                required: true,
                placeholder: 'Enter annual family income'
              },
              {
                name: 'financialNeed',
                label: 'Financial Need Statement',
                type: 'textarea',
                required: true,
                placeholder: 'Please describe your financial need and how this scholarship would help you'
              }
            ]
          },
          {
            name: 'essay',
            label: 'Personal Essay',
            type: 'textarea',
            required: true,
            placeholder: 'Please write a personal essay explaining why you deserve this scholarship, your goals, and how this scholarship will help you achieve them.',
            rows: 8
          },
          {
            name: 'documents',
            label: 'Required Documents',
            type: 'section',
            required: true,
            fields: [
              {
                name: 'transcript',
                label: 'Academic Transcript',
                type: 'file',
                required: true,
                accept: '.pdf,.doc,.docx'
              },
              {
                name: 'resume',
                label: 'Resume/CV',
                type: 'file',
                required: true,
                accept: '.pdf,.doc,.docx'
              },
              {
                name: 'recommendationLetters',
                label: 'Recommendation Letters',
                type: 'file',
                required: true,
                accept: '.pdf,.doc,.docx',
                multiple: true
              }
            ]
          }
        ]
      });

      await template.save();
      templatesCreated++;
      console.log(`✅ Created application template for scholarship: ${scholarship.title}`);
    }

    console.log(`🎉 Successfully created ${templatesCreated} application templates`);
    console.log('✅ Application templates creation completed');

  } catch (error) {
    console.error('❌ Error creating application templates:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
createScholarshipApplicationTemplates()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });