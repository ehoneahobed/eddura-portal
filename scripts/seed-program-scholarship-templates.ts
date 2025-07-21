import mongoose from 'mongoose';
import RequirementsTemplate from '../models/RequirementsTemplate';
import Program from '../models/Program';
import Scholarship from '../models/Scholarship';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

/**
 * Generate specific templates for programs and scholarships
 * This creates tailored templates based on the type of program/scholarship
 */
async function seedProgramScholarshipTemplates() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is required');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    console.log('🌱 Starting to generate program and scholarship specific templates...');

    // Get all programs and scholarships
    const programs = await Program.find({});
    const scholarships = await Scholarship.find({});
    
    console.log(`📊 Found ${programs.length} programs and ${scholarships.length} scholarships`);

    let templatesCreated = 0;
    let programsUpdated = 0;
    let scholarshipsUpdated = 0;

    // Generate templates for programs
    for (const program of programs) {
      // Skip if already has a template
      if (program.requirementsTemplateId) {
        continue;
      }

      const templateName = `${program.name} Requirements`;
      const templateDescription = `Specific requirements for ${program.name} program`;
      
      // Create template based on degree type
      const requirements = generateProgramRequirements(program);
      
      const template = new RequirementsTemplate({
        name: templateName,
        description: templateDescription,
        category: getProgramCategory(program.degreeType),
        isSystemTemplate: false,
        isActive: true,
        tags: [
          'program_specific',
          program.degreeType?.toLowerCase(),
          program.fieldOfStudy?.toLowerCase(),
          'custom'
        ],
        requirements
      });

      await template.save();
      
      // Update program with template reference
      await Program.findByIdAndUpdate(program._id, {
        requirementsTemplateId: template._id
      });

      templatesCreated++;
      programsUpdated++;
      console.log(`✅ Created template for program: ${program.name}`);
    }

    // Generate templates for scholarships
    for (const scholarship of scholarships) {
      // Skip if already has a template
      if (scholarship.requirementsTemplateId) {
        continue;
      }

      const templateName = `${scholarship.title} Requirements`;
      const templateDescription = `Specific requirements for ${scholarship.title} scholarship`;
      
      // Create template based on scholarship type
      const requirements = generateScholarshipRequirements(scholarship);
      
      const template = new RequirementsTemplate({
        name: templateName,
        description: templateDescription,
        category: 'scholarship',
        isSystemTemplate: false,
        isActive: true,
        tags: [
          'scholarship_specific',
          'custom'
        ],
        requirements
      });

      await template.save();
      
      // Update scholarship with template reference
      await Scholarship.findByIdAndUpdate(scholarship._id, {
        requirementsTemplateId: template._id
      });

      templatesCreated++;
      scholarshipsUpdated++;
      console.log(`✅ Created template for scholarship: ${scholarship.title}`);
    }

    console.log('\n🎉 Successfully generated program and scholarship specific templates!');
    console.log(`📊 Summary:`);
    console.log(`  • Templates created: ${templatesCreated}`);
    console.log(`  • Programs updated: ${programsUpdated}`);
    console.log(`  • Scholarships updated: ${scholarshipsUpdated}`);

  } catch (error) {
    console.error('❌ Error generating templates:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

/**
 * Generate requirements based on program type
 */
function generateProgramRequirements(program: any): any[] {
  const baseRequirements: any[] = [
    {
      requirementType: 'document',
      category: 'academic',
      name: 'Academic Transcripts',
      description: 'Official transcripts from all previous institutions',
      isRequired: true,
      isOptional: false,
      documentType: 'transcript',
      maxFileSize: 10,
      allowedFileTypes: ['pdf'],
      order: 1
    },
    {
      requirementType: 'document',
      category: 'personal',
      name: 'Personal Statement',
      description: 'Statement of purpose explaining your academic and career goals',
      isRequired: true,
      isOptional: false,
      documentType: 'personal_statement',
      maxFileSize: 5,
      allowedFileTypes: ['pdf', 'doc', 'docx'],
      wordLimit: 1000,
      order: 2
    },
    {
      requirementType: 'document',
      category: 'professional',
      name: 'Letters of Recommendation',
      description: 'Academic or professional letters of recommendation',
      isRequired: true,
      isOptional: false,
      documentType: 'recommendation_letter',
      maxFileSize: 5,
      allowedFileTypes: ['pdf', 'doc', 'docx'],
      order: 3
    }
  ];

  // Add degree-specific requirements
  if (program.degreeType?.toLowerCase().includes('graduate') || 
      program.degreeType?.toLowerCase().includes('master') ||
      program.degreeType?.toLowerCase().includes('phd')) {
    baseRequirements.push(
      {
        requirementType: 'document',
        category: 'academic',
        name: 'Academic CV/Resume',
        description: 'Detailed academic CV highlighting research experience and publications',
        isRequired: true,
        isOptional: false,
        documentType: 'cv',
        maxFileSize: 5,
        allowedFileTypes: ['pdf', 'doc', 'docx'],
        order: 4
      },
      {
        requirementType: 'test_score',
        category: 'academic',
        name: 'GRE Scores',
        description: 'Graduate Record Examination scores',
        isRequired: true,
        isOptional: false,
        testType: 'gre',
        minScore: 260,
        maxScore: 340,
        scoreFormat: '260-340 total score',
        order: 5
      },
      {
        requirementType: 'fee',
        category: 'administrative',
        name: 'Application Fee',
        description: 'Non-refundable application processing fee',
        isRequired: true,
        isOptional: false,
        applicationFeeAmount: 75,
        applicationFeeCurrency: 'USD',
        applicationFeeDescription: 'Graduate application fee',
        order: 6
      }
    );
  } else {
    // Undergraduate requirements
    baseRequirements.push(
      {
        requirementType: 'document',
        category: 'academic',
        name: 'High School Transcripts',
        description: 'Official high school transcripts',
        isRequired: true,
        isOptional: false,
        documentType: 'transcript',
        maxFileSize: 10,
        allowedFileTypes: ['pdf'],
        order: 4
      },
      {
        requirementType: 'test_score',
        category: 'academic',
        name: 'SAT/ACT Scores',
        description: 'Standardized test scores',
        isRequired: true,
        isOptional: false,
        testType: 'sat',
        minScore: 1000,
        maxScore: 1600,
        scoreFormat: '1000+ total score',
        order: 5
      },
      {
        requirementType: 'fee',
        category: 'administrative',
        name: 'Application Fee',
        description: 'Non-refundable application processing fee',
        isRequired: true,
        isOptional: false,
        applicationFeeAmount: 50,
        applicationFeeCurrency: 'USD',
        applicationFeeDescription: 'Undergraduate application fee',
        order: 6
      }
    );
  }

  // Add field-specific requirements
  if (program.fieldOfStudy) {
    const field = program.fieldOfStudy.toLowerCase();
    
    if (field.includes('computer') || field.includes('engineering') || field.includes('technology')) {
      baseRequirements.push({
        requirementType: 'document',
        category: 'professional',
        name: 'Portfolio/Projects',
        description: 'Portfolio of relevant projects or coding samples',
        isRequired: false,
        isOptional: true,
        documentType: 'portfolio',
        maxFileSize: 20,
        allowedFileTypes: ['pdf', 'zip'],
        order: baseRequirements.length + 1
      });
    }
    
    if (field.includes('business') || field.includes('management')) {
      baseRequirements.push({
        requirementType: 'document',
        category: 'professional',
        name: 'Work Experience Summary',
        description: 'Summary of relevant work experience',
        isRequired: false,
        isOptional: true,
        documentType: 'work_experience',
        maxFileSize: 5,
        allowedFileTypes: ['pdf', 'doc', 'docx'],
        order: baseRequirements.length + 1
      });
    }
    
    if (field.includes('art') || field.includes('design') || field.includes('creative')) {
      baseRequirements.push({
        requirementType: 'document',
        category: 'professional',
        name: 'Creative Portfolio',
        description: 'Portfolio of creative work and projects',
        isRequired: true,
        isOptional: false,
        documentType: 'portfolio',
        maxFileSize: 50,
        allowedFileTypes: ['pdf', 'zip', 'jpg', 'png'],
        order: baseRequirements.length + 1
      });
    }
  }

  return baseRequirements;
}

/**
 * Generate requirements based on scholarship type
 */
function generateScholarshipRequirements(scholarship: any): any[] {
  const baseRequirements: any[] = [
    {
      requirementType: 'document',
      category: 'academic',
      name: 'Academic Transcripts',
      description: 'Official transcripts showing current academic performance',
      isRequired: true,
      isOptional: false,
      documentType: 'transcript',
      maxFileSize: 10,
      allowedFileTypes: ['pdf'],
      order: 1
    },
    {
      requirementType: 'document',
      category: 'personal',
      name: 'Personal Statement',
      description: 'Essay explaining why you deserve this scholarship',
      isRequired: true,
      isOptional: false,
      documentType: 'personal_statement',
      maxFileSize: 5,
      allowedFileTypes: ['pdf', 'doc', 'docx'],
      wordLimit: 1000,
      order: 2
    },
    {
      requirementType: 'document',
      category: 'professional',
      name: 'Letters of Recommendation',
      description: 'Academic or professional recommendations',
      isRequired: true,
      isOptional: false,
      documentType: 'recommendation_letter',
      maxFileSize: 5,
      allowedFileTypes: ['pdf', 'doc', 'docx'],
      order: 3
    }
  ];

  // Add scholarship-specific requirements
  if (scholarship.tags?.some((tag: string) => tag.toLowerCase().includes('merit'))) {
    baseRequirements.push({
      requirementType: 'test_score',
      category: 'academic',
      name: 'Standardized Test Scores',
      description: 'SAT, ACT, GRE, or other relevant test scores',
      isRequired: true,
      isOptional: false,
      testType: 'standardized',
      minScore: 0,
      maxScore: 1600,
      scoreFormat: 'Varies by test type',
      order: 4
    });
  }

  if (scholarship.tags?.some((tag: string) => tag.toLowerCase().includes('need'))) {
    baseRequirements.push(
      {
        requirementType: 'document',
        category: 'financial',
        name: 'Financial Aid Forms',
        description: 'FAFSA, CSS Profile, or other financial aid forms',
        isRequired: true,
        isOptional: false,
        documentType: 'financial_form',
        maxFileSize: 5,
        allowedFileTypes: ['pdf'],
        order: 4
      },
      {
        requirementType: 'document',
        category: 'financial',
        name: 'Income Verification',
        description: 'Tax returns, W-2 forms, or other income documents',
        isRequired: true,
        isOptional: false,
        documentType: 'financial_document',
        maxFileSize: 10,
        allowedFileTypes: ['pdf'],
        order: 5
      }
    );
  }

  // Add application fee if specified
  if (scholarship.applicationFee) {
    baseRequirements.push({
      requirementType: 'fee',
      category: 'administrative',
      name: 'Application Fee',
      description: 'Scholarship application processing fee',
      isRequired: true,
      isOptional: false,
      applicationFeeAmount: scholarship.applicationFee,
      applicationFeeCurrency: scholarship.currency || 'USD',
      applicationFeeDescription: 'Scholarship application fee',
      order: baseRequirements.length + 1
    });
  }

  return baseRequirements;
}

/**
 * Get template category based on degree type
 */
function getProgramCategory(degreeType: string): 'graduate' | 'undergraduate' | 'scholarship' | 'custom' {
  if (!degreeType) return 'custom';
  
  const type = degreeType.toLowerCase();
  if (type.includes('graduate') || type.includes('master') || type.includes('phd')) {
    return 'graduate';
  } else if (type.includes('undergraduate') || type.includes('bachelor')) {
    return 'undergraduate';
  }
  
  return 'custom';
}

// Run the seeder
if (require.main === module) {
  seedProgramScholarshipTemplates()
    .then(() => {
      console.log('✅ Template generation completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Template generation failed:', error);
      process.exit(1);
    });
}

export default seedProgramScholarshipTemplates; 