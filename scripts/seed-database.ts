import connectDB from '../lib/mongodb';
import School from '../models/School';
import Program from '../models/Program';
import Scholarship from '../models/Scholarship';

// Add Node.js types for process
declare const process: {
  exit: (code: number) => never;
};

const seedSchools = [
  {
    name: 'Stanford University',
    country: 'United States',
    city: 'Stanford',
    types: ['Private', 'Research University'],
    globalRanking: 3,
    yearFounded: 1885,
    accreditationBodies: ['WASC', 'ABET', 'LCME'],
    websiteUrl: 'https://stanford.edu',
    contactEmail: 'admissions@stanford.edu',
    contactPhone: '+1-650-723-2300',
    logoUrl: 'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=200',
    socialLinks: {
      facebook: 'https://facebook.com/stanford',
      twitter: 'https://twitter.com/stanford',
      linkedin: 'https://linkedin.com/school/stanford-university',
      youtube: 'https://youtube.com/stanford'
    },
    campusType: 'Suburban',
    languagesOfInstruction: ['English'],
    internationalStudentCount: 3500,
    studentFacultyRatio: '7:1',
    housingOptions: ['On-campus dormitories', 'Graduate housing', 'Family housing', 'Off-campus apartments'],
    supportServices: ['Career counseling', 'Academic support', 'Mental health services', 'Disability services', 'International student services'],
    avgLivingCost: 25000,
    visaSupportServices: true,
    virtualTourLink: 'https://stanford.edu/tour'
  },
  {
    name: 'University of Oxford',
    country: 'United Kingdom',
    city: 'Oxford',
    types: ['Public', 'Collegiate University', 'Research University'],
    globalRanking: 1,
    yearFounded: 1096,
    accreditationBodies: ['QAA', 'Office for Students'],
    websiteUrl: 'https://ox.ac.uk',
    contactEmail: 'admissions@ox.ac.uk',
    contactPhone: '+44-1865-270000',
    logoUrl: 'https://images.pexels.com/photos/1462630/pexels-photo-1462630.jpeg?auto=compress&cs=tinysrgb&w=200',
    socialLinks: {
      facebook: 'https://facebook.com/oxforduniversity',
      twitter: 'https://twitter.com/uniofoxford',
      linkedin: 'https://linkedin.com/school/university-of-oxford',
      youtube: 'https://youtube.com/oxforduniversity'
    },
    campusType: 'Urban',
    languagesOfInstruction: ['English'],
    internationalStudentCount: 12000,
    studentFacultyRatio: '11:1',
    housingOptions: ['College accommodation', 'Graduate accommodation', 'Private housing', 'Shared flats'],
    supportServices: ['Tutorial system', 'Counseling services', 'Disability support', 'Career services', 'Academic writing support'],
    avgLivingCost: 18000,
    visaSupportServices: true,
    virtualTourLink: 'https://ox.ac.uk/tour'
  },
  {
    name: 'University of Toronto',
    country: 'Canada',
    city: 'Toronto',
    types: ['Public', 'Research University'],
    globalRanking: 18,
    yearFounded: 1827,
    accreditationBodies: ['Universities Canada', 'OCAV'],
    websiteUrl: 'https://utoronto.ca',
    contactEmail: 'admissions@utoronto.ca',
    contactPhone: '+1-416-978-2011',
    logoUrl: 'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?auto=compress&cs=tinysrgb&w=200',
    socialLinks: {
      facebook: 'https://facebook.com/universityoftoronto',
      twitter: 'https://twitter.com/uoft',
      linkedin: 'https://linkedin.com/school/university-of-toronto',
      youtube: 'https://youtube.com/universitytoronto'
    },
    campusType: 'Urban',
    languagesOfInstruction: ['English', 'French'],
    internationalStudentCount: 25000,
    studentFacultyRatio: '18:1',
    housingOptions: ['Residence halls', 'Graduate housing', 'Family housing', 'Off-campus rentals'],
    supportServices: ['Academic advising', 'Mental health services', 'International student services', 'Career centre', 'Accessibility services'],
    avgLivingCost: 15000,
    visaSupportServices: true,
    virtualTourLink: 'https://utoronto.ca/tour'
  }
];

const seedPrograms = [
  {
    name: 'Master of Science in Computer Science',
    degreeType: 'Master',
    fieldOfStudy: 'Computer Science',
    subfield: 'Artificial Intelligence',
    mode: 'Full-time',
    duration: '2 years',
    languages: ['English'],
    applicationDeadlines: ['2024-12-15', '2024-01-15'],
    intakeSessions: ['Fall', 'Spring'],
    admissionRequirements: {
      minGPA: 3.5,
      requiredDegrees: ['Bachelor in Computer Science', 'Bachelor in Engineering'],
      requiredTests: [
        { name: 'GRE', minScore: 320 },
        { name: 'TOEFL', minScore: 100 }
      ],
      lettersOfRecommendation: 3,
      requiresPersonalStatement: true,
      requiresCV: true,
      detailedRequirementNote: 'Applicants must demonstrate strong programming skills and mathematical background. Research experience preferred but not required.'
    },
    tuitionFees: {
      local: 58000,
      international: 58000,
      currency: 'USD'
    },
    availableScholarships: [],
    applicationFee: 125,
    teachingMethodology: ['Lectures', 'Research projects', 'Seminars', 'Lab work'],
    careerOutcomes: ['Software Engineer', 'Research Scientist', 'Data Scientist', 'AI Engineer', 'Product Manager'],
    employabilityRank: 95,
    alumniDetails: 'Our graduates work at leading tech companies including Google, Apple, Microsoft, and Meta. Many have founded successful startups or pursued academic careers at top universities.',
    programSummary: 'Advanced computer science program focusing on AI and machine learning with cutting-edge research opportunities.',
    vectorId: 'stanford_cs_ms_001',
    brochureLink: 'https://stanford.edu/cs-ms-brochure',
    programOverview: 'The Master of Science in Computer Science at Stanford provides students with advanced knowledge in computer science fundamentals while allowing specialization in areas such as artificial intelligence, human-computer interaction, systems, and theory.',
    learningOutcomes: 'Graduates will be able to design and implement complex software systems, conduct independent research, apply machine learning techniques to real-world problems, and communicate technical concepts effectively.'
  }
];

const seedScholarships = [
  {
    title: 'Knight-Hennessy Scholars Program',
    scholarshipDetails: 'The Knight-Hennessy Scholars program develops a community of future global leaders to address complex challenges through collaboration and innovation. This fully-funded scholarship supports graduate study at Stanford University across all seven schools.',
    provider: 'Stanford University',
    linkedSchool: 'Stanford University',
    coverage: ['Full tuition', 'Living stipend', 'Academic expenses', 'Leadership development'],
    value: 90000,
    currency: 'USD',
    frequency: 'Annual',
    numberOfAwardsPerYear: 100,
    eligibility: {
      nationalities: ['All'],
      genders: ['All'],
      degreeLevels: ['Master', 'PhD'],
      fieldsOfStudy: ['All'],
      minGPA: 3.6,
      ageLimit: 'No specific age limit',
      countryResidency: ['All countries'],
      incomeStatus: 'Need-blind',
      additionalCriteria: 'Demonstrated leadership potential and commitment to making a positive impact'
    },
    applicationRequirements: {
      essay: true,
      cv: true,
      testScores: false,
      recommendationLetters: 2,
      requirementsDescription: 'Personal essays, CV, recommendation letters, and Stanford graduate program application',
      documentsToSubmit: ['Personal essays', 'CV/Resume', 'Recommendation letters', 'Academic transcripts', 'Stanford application']
    },
    deadline: '2024-10-10',
    applicationLink: 'https://knight-hennessy.stanford.edu/apply',
    selectionCriteria: ['Leadership', 'Independence', 'Purpose'],
    renewalConditions: 'Maintain good academic standing and participate in leadership development activities',
    decisionTimeline: '4-6 months',
    tags: ['Full funding', 'Leadership', 'International', 'Graduate'],
    vectorId: 'kh_001',
    notes: 'Highly competitive program with holistic selection process'
  }
];

async function seedDatabase() {
  try {
    await connectDB();
    console.log('Connected to MongoDB Atlas');

    // Clear existing data
    await School.deleteMany({});
    await Program.deleteMany({});
    await Scholarship.deleteMany({});
    console.log('Cleared existing data');

    // Seed schools
    const schools = await School.insertMany(seedSchools);
    console.log(`Seeded ${schools.length} schools`);

    // Update programs with actual school IDs
    const updatedPrograms = seedPrograms.map(program => ({
      ...program,
      schoolId: schools[0]._id // Stanford University
    }));

    // Seed programs
    const programs = await Program.insertMany(updatedPrograms);
    console.log(`Seeded ${programs.length} programs`);

    // Seed scholarships
    const scholarships = await Scholarship.insertMany(seedScholarships);
    console.log(`Seeded ${scholarships.length} scholarships`);

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();