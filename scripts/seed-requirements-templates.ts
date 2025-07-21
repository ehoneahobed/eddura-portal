import mongoose from 'mongoose';
import RequirementsTemplate from '../models/RequirementsTemplate';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

/**
 * Comprehensive Requirements Templates Seeder
 * Creates robust templates for different application types
 */
async function seedRequirementsTemplates() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is required');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing templates (optional - comment out if you want to keep existing ones)
    // await RequirementsTemplate.deleteMany({});
    // console.log('🗑️  Cleared existing templates');

    // Check if templates already exist
    const existingTemplates = await RequirementsTemplate.find({});
    if (existingTemplates.length > 0) {
      console.log(`📋 Found ${existingTemplates.length} existing templates`);
      console.log('Templates already exist. Skipping creation.');
      return;
    }

    console.log('🌱 Starting to seed requirements templates...');

    // 1. GRADUATE SCHOOL APPLICATION TEMPLATE
    const graduateTemplate = new RequirementsTemplate({
      name: 'Graduate School Application',
      description: 'Comprehensive template for graduate school applications including all standard requirements for master\'s and PhD programs.',
      category: 'graduate',
      isSystemTemplate: true,
      isActive: true,
      tags: ['graduate', 'masters', 'phd', 'university', 'academic'],
      requirements: [
        // Academic Documents
        {
          requirementType: 'document',
          category: 'academic',
          name: 'Academic Transcripts',
          description: 'Official transcripts from all undergraduate and graduate institutions attended',
          isRequired: true,
          isOptional: false,
          documentType: 'transcript',
          maxFileSize: 10,
          allowedFileTypes: ['pdf'],
          order: 1
        },
        {
          requirementType: 'document',
          category: 'academic',
          name: 'Degree Certificates',
          description: 'Official degree certificates or diplomas from previous institutions',
          isRequired: true,
          isOptional: false,
          documentType: 'certificate',
          maxFileSize: 5,
          allowedFileTypes: ['pdf'],
          order: 2
        },
        {
          requirementType: 'document',
          category: 'academic',
          name: 'Academic CV/Resume',
          description: 'Detailed academic CV highlighting research experience, publications, and academic achievements',
          isRequired: true,
          isOptional: false,
          documentType: 'cv',
          maxFileSize: 5,
          allowedFileTypes: ['pdf', 'doc', 'docx'],
          order: 3
        },
        {
          requirementType: 'document',
          category: 'personal',
          name: 'Statement of Purpose',
          description: 'Personal statement explaining academic interests, research goals, and reasons for pursuing graduate studies',
          isRequired: true,
          isOptional: false,
          documentType: 'personal_statement',
          maxFileSize: 5,
          allowedFileTypes: ['pdf', 'doc', 'docx'],
          wordLimit: 1000,
          order: 4
        },
        {
          requirementType: 'document',
          category: 'personal',
          name: 'Research Statement',
          description: 'Detailed research proposal or statement of research interests (for research-based programs)',
          isRequired: false,
          isOptional: true,
          documentType: 'research_statement',
          maxFileSize: 5,
          allowedFileTypes: ['pdf', 'doc', 'docx'],
          wordLimit: 2000,
          order: 5
        },
        {
          requirementType: 'document',
          category: 'professional',
          name: 'Letters of Recommendation',
          description: 'Academic letters of recommendation from professors or research supervisors',
          isRequired: true,
          isOptional: false,
          documentType: 'recommendation_letter',
          maxFileSize: 5,
          allowedFileTypes: ['pdf', 'doc', 'docx'],
          order: 6
        },
        {
          requirementType: 'document',
          category: 'professional',
          name: 'Writing Sample',
          description: 'Academic writing sample demonstrating research and analytical skills',
          isRequired: false,
          isOptional: true,
          documentType: 'writing_sample',
          maxFileSize: 10,
          allowedFileTypes: ['pdf', 'doc', 'docx'],
          wordLimit: 5000,
          order: 7
        },
        // Test Scores
        {
          requirementType: 'test_score',
          category: 'academic',
          name: 'GRE General Test',
          description: 'Graduate Record Examination general test scores',
          isRequired: true,
          isOptional: false,
          testType: 'gre',
          minScore: 260,
          maxScore: 340,
          scoreFormat: '260-340 total score (Verbal + Quantitative)',
          order: 8
        },
        {
          requirementType: 'test_score',
          category: 'academic',
          name: 'GRE Subject Test',
          description: 'GRE subject test scores (if required by program)',
          isRequired: false,
          isOptional: true,
          testType: 'gre_subject',
          minScore: 200,
          maxScore: 990,
          scoreFormat: '200-990 score',
          order: 9
        },
        {
          requirementType: 'test_score',
          category: 'academic',
          name: 'TOEFL/IELTS Scores',
          description: 'English proficiency test scores (for international students)',
          isRequired: false,
          isOptional: true,
          testType: 'toefl',
          minScore: 80,
          maxScore: 120,
          scoreFormat: '80+ total score (TOEFL) or 6.5+ (IELTS)',
          order: 10
        },
        // Application Fees
        {
          requirementType: 'fee',
          category: 'administrative',
          name: 'Application Fee',
          description: 'Non-refundable application processing fee',
          isRequired: true,
          isOptional: false,
          applicationFeeAmount: 75,
          applicationFeeCurrency: 'USD',
          applicationFeeDescription: 'Standard graduate application fee',
          order: 11
        },
        // Interviews
        {
          requirementType: 'interview',
          category: 'professional',
          name: 'Admissions Interview',
          description: 'Interview with admissions committee or faculty members',
          isRequired: false,
          isOptional: true,
          interviewType: 'virtual',
          interviewDuration: 30,
          interviewNotes: 'May be required for competitive programs or research-based degrees',
          order: 12
        }
      ]
    });

    // 2. UNDERGRADUATE APPLICATION TEMPLATE
    const undergraduateTemplate = new RequirementsTemplate({
      name: 'Undergraduate Application',
      description: 'Complete template for undergraduate college and university applications including all standard requirements.',
      category: 'undergraduate',
      isSystemTemplate: true,
      isActive: true,
      tags: ['undergraduate', 'college', 'university', 'bachelors', 'freshman'],
      requirements: [
        // Academic Documents
        {
          requirementType: 'document',
          category: 'academic',
          name: 'High School Transcripts',
          description: 'Official high school transcripts showing all completed coursework and grades',
          isRequired: true,
          isOptional: false,
          documentType: 'transcript',
          maxFileSize: 10,
          allowedFileTypes: ['pdf'],
          order: 1
        },
        {
          requirementType: 'document',
          category: 'academic',
          name: 'High School Diploma',
          description: 'High school diploma or equivalent certificate',
          isRequired: true,
          isOptional: false,
          documentType: 'certificate',
          maxFileSize: 5,
          allowedFileTypes: ['pdf'],
          order: 2
        },
        {
          requirementType: 'document',
          category: 'personal',
          name: 'Personal Essay',
          description: 'Personal statement or college essay demonstrating writing skills and personal qualities',
          isRequired: true,
          isOptional: false,
          documentType: 'personal_statement',
          maxFileSize: 5,
          allowedFileTypes: ['pdf', 'doc', 'docx'],
          wordLimit: 650,
          order: 3
        },
        {
          requirementType: 'document',
          category: 'personal',
          name: 'Supplemental Essays',
          description: 'Additional essays or short responses specific to the institution',
          isRequired: false,
          isOptional: true,
          documentType: 'supplemental_essay',
          maxFileSize: 5,
          allowedFileTypes: ['pdf', 'doc', 'docx'],
          wordLimit: 500,
          order: 4
        },
        {
          requirementType: 'document',
          category: 'professional',
          name: 'Letters of Recommendation',
          description: 'Teacher or counselor recommendations highlighting academic and personal qualities',
          isRequired: true,
          isOptional: false,
          documentType: 'recommendation_letter',
          maxFileSize: 5,
          allowedFileTypes: ['pdf', 'doc', 'docx'],
          order: 5
        },
        {
          requirementType: 'document',
          category: 'professional',
          name: 'Activities Resume',
          description: 'Resume highlighting extracurricular activities, leadership, and community service',
          isRequired: false,
          isOptional: true,
          documentType: 'resume',
          maxFileSize: 5,
          allowedFileTypes: ['pdf', 'doc', 'docx'],
          order: 6
        },
        // Test Scores
        {
          requirementType: 'test_score',
          category: 'academic',
          name: 'SAT Scores',
          description: 'SAT Reasoning Test scores',
          isRequired: true,
          isOptional: false,
          testType: 'sat',
          minScore: 1000,
          maxScore: 1600,
          scoreFormat: '1000+ total score (Evidence-Based Reading + Math)',
          order: 7
        },
        {
          requirementType: 'test_score',
          category: 'academic',
          name: 'ACT Scores',
          description: 'ACT test scores (alternative to SAT)',
          isRequired: false,
          isOptional: true,
          testType: 'act',
          minScore: 20,
          maxScore: 36,
          scoreFormat: '20+ composite score',
          order: 8
        },
        {
          requirementType: 'test_score',
          category: 'academic',
          name: 'SAT Subject Tests',
          description: 'SAT Subject Test scores (if required by specific programs)',
          isRequired: false,
          isOptional: true,
          testType: 'sat_subject',
          minScore: 400,
          maxScore: 800,
          scoreFormat: '400-800 score per subject',
          order: 9
        },
        {
          requirementType: 'test_score',
          category: 'academic',
          name: 'TOEFL/IELTS Scores',
          description: 'English proficiency test scores (for international students)',
          isRequired: false,
          isOptional: true,
          testType: 'toefl',
          minScore: 80,
          maxScore: 120,
          scoreFormat: '80+ total score (TOEFL) or 6.5+ (IELTS)',
          order: 10
        },
        // Application Fees
        {
          requirementType: 'fee',
          category: 'administrative',
          name: 'Application Fee',
          description: 'Non-refundable application processing fee',
          isRequired: true,
          isOptional: false,
          applicationFeeAmount: 50,
          applicationFeeCurrency: 'USD',
          applicationFeeDescription: 'Standard undergraduate application fee',
          order: 11
        },
        // Interviews
        {
          requirementType: 'interview',
          category: 'professional',
          name: 'Admissions Interview',
          description: 'Interview with admissions officer or alumni representative',
          isRequired: false,
          isOptional: true,
          interviewType: 'in_person',
          interviewDuration: 45,
          interviewNotes: 'May be required for competitive programs or scholarship consideration',
          order: 12
        }
      ]
    });

    // 3. SCHOLARSHIP APPLICATION TEMPLATE
    const scholarshipTemplate = new RequirementsTemplate({
      name: 'Scholarship Application',
      description: 'Comprehensive template for scholarship applications including academic, financial, and personal requirements.',
      category: 'scholarship',
      isSystemTemplate: true,
      isActive: true,
      tags: ['scholarship', 'financial_aid', 'merit', 'need_based', 'award'],
      requirements: [
        // Academic Documents
        {
          requirementType: 'document',
          category: 'academic',
          name: 'Academic Transcripts',
          description: 'Official transcripts showing current academic performance and GPA',
          isRequired: true,
          isOptional: false,
          documentType: 'transcript',
          maxFileSize: 10,
          allowedFileTypes: ['pdf'],
          order: 1
        },
        {
          requirementType: 'document',
          category: 'academic',
          name: 'Academic Resume/CV',
          description: 'Resume highlighting academic achievements, honors, and extracurricular activities',
          isRequired: true,
          isOptional: false,
          documentType: 'cv',
          maxFileSize: 5,
          allowedFileTypes: ['pdf', 'doc', 'docx'],
          order: 2
        },
        {
          requirementType: 'document',
          category: 'personal',
          name: 'Personal Statement',
          description: 'Essay explaining why you deserve the scholarship and how it will help achieve your goals',
          isRequired: true,
          isOptional: false,
          documentType: 'personal_statement',
          maxFileSize: 5,
          allowedFileTypes: ['pdf', 'doc', 'docx'],
          wordLimit: 1000,
          order: 3
        },
        {
          requirementType: 'document',
          category: 'personal',
          name: 'Leadership Essay',
          description: 'Essay demonstrating leadership experience and community involvement',
          isRequired: false,
          isOptional: true,
          documentType: 'leadership_essay',
          maxFileSize: 5,
          allowedFileTypes: ['pdf', 'doc', 'docx'],
          wordLimit: 500,
          order: 4
        },
        {
          requirementType: 'document',
          category: 'professional',
          name: 'Letters of Recommendation',
          description: 'Recommendations from teachers, mentors, or community leaders',
          isRequired: true,
          isOptional: false,
          documentType: 'recommendation_letter',
          maxFileSize: 5,
          allowedFileTypes: ['pdf', 'doc', 'docx'],
          order: 5
        },
        // Financial Documents
        {
          requirementType: 'document',
          category: 'financial',
          name: 'Financial Aid Forms',
          description: 'FAFSA, CSS Profile, or other financial aid application forms',
          isRequired: false,
          isOptional: true,
          documentType: 'financial_form',
          maxFileSize: 5,
          allowedFileTypes: ['pdf'],
          order: 6
        },
        {
          requirementType: 'document',
          category: 'financial',
          name: 'Income Verification',
          description: 'Tax returns, W-2 forms, or other income verification documents',
          isRequired: false,
          isOptional: true,
          documentType: 'financial_document',
          maxFileSize: 10,
          allowedFileTypes: ['pdf'],
          order: 7
        },
        // Test Scores
        {
          requirementType: 'test_score',
          category: 'academic',
          name: 'Standardized Test Scores',
          description: 'SAT, ACT, GRE, or other relevant standardized test scores',
          isRequired: false,
          isOptional: true,
          testType: 'standardized',
          minScore: 0,
          maxScore: 1600,
          scoreFormat: 'Varies by test type',
          order: 8
        },
        // Application Fees
        {
          requirementType: 'fee',
          category: 'administrative',
          name: 'Application Fee',
          description: 'Application processing fee (if applicable)',
          isRequired: false,
          isOptional: true,
          applicationFeeAmount: 25,
          applicationFeeCurrency: 'USD',
          applicationFeeDescription: 'Scholarship application processing fee',
          order: 9
        },
        // Interviews
        {
          requirementType: 'interview',
          category: 'professional',
          name: 'Scholarship Interview',
          description: 'Interview with scholarship committee or selection panel',
          isRequired: false,
          isOptional: true,
          interviewType: 'virtual',
          interviewDuration: 30,
          interviewNotes: 'May be required for competitive scholarships',
          order: 10
        }
      ]
    });

    // 4. INTERNATIONAL STUDENT APPLICATION TEMPLATE
    const internationalTemplate = new RequirementsTemplate({
      name: 'International Student Application',
      description: 'Specialized template for international students including visa requirements and additional documentation.',
      category: 'custom',
      isSystemTemplate: true,
      isActive: true,
      tags: ['international', 'visa', 'f1', 'student_visa', 'foreign'],
      requirements: [
        // Academic Documents
        {
          requirementType: 'document',
          category: 'academic',
          name: 'Academic Transcripts',
          description: 'Official transcripts with English translation if not in English',
          isRequired: true,
          isOptional: false,
          documentType: 'transcript',
          maxFileSize: 10,
          allowedFileTypes: ['pdf'],
          order: 1
        },
        {
          requirementType: 'document',
          category: 'academic',
          name: 'Degree Certificates',
          description: 'Official degree certificates with English translation and credential evaluation',
          isRequired: true,
          isOptional: false,
          documentType: 'certificate',
          maxFileSize: 5,
          allowedFileTypes: ['pdf'],
          order: 2
        },
        {
          requirementType: 'document',
          category: 'academic',
          name: 'Credential Evaluation',
          description: 'Official credential evaluation from recognized evaluation service',
          isRequired: true,
          isOptional: false,
          documentType: 'evaluation',
          maxFileSize: 5,
          allowedFileTypes: ['pdf'],
          order: 3
        },
        // Language Proficiency
        {
          requirementType: 'test_score',
          category: 'academic',
          name: 'TOEFL Scores',
          description: 'Test of English as a Foreign Language scores',
          isRequired: true,
          isOptional: false,
          testType: 'toefl',
          minScore: 80,
          maxScore: 120,
          scoreFormat: '80+ total score (iBT)',
          order: 4
        },
        {
          requirementType: 'test_score',
          category: 'academic',
          name: 'IELTS Scores',
          description: 'International English Language Testing System scores',
          isRequired: false,
          isOptional: true,
          testType: 'ielts',
          minScore: 6.5,
          maxScore: 9.0,
          scoreFormat: '6.5+ overall band score',
          order: 5
        },
        // Financial Documents
        {
          requirementType: 'document',
          category: 'financial',
          name: 'Financial Support Documents',
          description: 'Bank statements, sponsorship letters, or scholarship letters showing sufficient funds',
          isRequired: true,
          isOptional: false,
          documentType: 'financial_document',
          maxFileSize: 10,
          allowedFileTypes: ['pdf'],
          order: 6
        },
        {
          requirementType: 'document',
          category: 'financial',
          name: 'Affidavit of Support',
          description: 'Form I-134 or similar affidavit of financial support',
          isRequired: true,
          isOptional: false,
          documentType: 'affidavit',
          maxFileSize: 5,
          allowedFileTypes: ['pdf'],
          order: 7
        },
        // Visa Documents
        {
          requirementType: 'document',
          category: 'administrative',
          name: 'Passport Copy',
          description: 'Valid passport with at least 6 months validity beyond intended stay',
          isRequired: true,
          isOptional: false,
          documentType: 'passport',
          maxFileSize: 5,
          allowedFileTypes: ['pdf', 'jpg', 'png'],
          order: 8
        },
        {
          requirementType: 'document',
          category: 'administrative',
          name: 'I-20 Form',
          description: 'Certificate of Eligibility for Nonimmigrant Student Status',
          isRequired: true,
          isOptional: false,
          documentType: 'i20',
          maxFileSize: 5,
          allowedFileTypes: ['pdf'],
          order: 9
        },
        // Application Fees
        {
          requirementType: 'fee',
          category: 'administrative',
          name: 'SEVIS Fee',
          description: 'Student and Exchange Visitor Information System fee',
          isRequired: true,
          isOptional: false,
          applicationFeeAmount: 350,
          applicationFeeCurrency: 'USD',
          applicationFeeDescription: 'SEVIS I-901 fee for F-1 students',
          order: 10
        },
        {
          requirementType: 'fee',
          category: 'administrative',
          name: 'Visa Application Fee',
          description: 'Nonimmigrant visa application fee',
          isRequired: true,
          isOptional: false,
          applicationFeeAmount: 160,
          applicationFeeCurrency: 'USD',
          applicationFeeDescription: 'DS-160 visa application fee',
          order: 11
        }
      ]
    });

    // Save all templates
    const templates = [
      graduateTemplate,
      undergraduateTemplate,
      scholarshipTemplate,
      internationalTemplate
    ];

    for (const template of templates) {
      await template.save();
      console.log(`✅ Created template: ${template.name}`);
    }

    console.log('\n🎉 Successfully created all requirements templates!');
    console.log(`📊 Total templates created: ${templates.length}`);
    
    // Display summary
    console.log('\n📋 Template Summary:');
    templates.forEach(template => {
      console.log(`  • ${template.name} (${template.category}) - ${template.requirements.length} requirements`);
    });

  } catch (error) {
    console.error('❌ Error seeding requirements templates:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seeder
if (require.main === module) {
  seedRequirementsTemplates()
    .then(() => {
      console.log('✅ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export default seedRequirementsTemplates; 