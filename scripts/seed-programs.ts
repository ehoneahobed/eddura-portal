import connectDB from '../lib/mongodb';
import School from '../models/School';
import Program from '../models/Program';

// Add Node.js types for process
declare const process: {
  exit: (code: number) => never;
};

// Generate 100+ diverse programs
const generatePrograms = () => {
  const universities = [
    { name: 'Stanford University', country: 'United States', city: 'Stanford' },
    { name: 'University of Oxford', country: 'United Kingdom', city: 'Oxford' },
    { name: 'University of Toronto', country: 'Canada', city: 'Toronto' },
    { name: 'MIT', country: 'United States', city: 'Cambridge' },
    { name: 'Harvard University', country: 'United States', city: 'Cambridge' },
    { name: 'University of Cambridge', country: 'United Kingdom', city: 'Cambridge' },
    { name: 'University of British Columbia', country: 'Canada', city: 'Vancouver' },
    { name: 'University of Melbourne', country: 'Australia', city: 'Melbourne' },
    { name: 'University of Sydney', country: 'Australia', city: 'Sydney' },
    { name: 'University of Amsterdam', country: 'Netherlands', city: 'Amsterdam' },
    { name: 'ETH Zurich', country: 'Switzerland', city: 'Zurich' },
    { name: 'University of Tokyo', country: 'Japan', city: 'Tokyo' },
    { name: 'National University of Singapore', country: 'Singapore', city: 'Singapore' },
    { name: 'University of Hong Kong', country: 'Hong Kong', city: 'Hong Kong' },
    { name: 'Seoul National University', country: 'South Korea', city: 'Seoul' }
  ];

  const degreeTypes = ['Bachelor', 'Master', 'PhD', 'MBA', 'Diploma', 'Certificate'];
  const fields = [
    'Computer Science', 'Engineering', 'Business', 'Medicine', 'Arts', 'Social Sciences',
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Psychology',
    'Law', 'Education', 'Architecture', 'Design', 'Music', 'Literature',
    'History', 'Philosophy', 'Political Science', 'Sociology', 'Anthropology',
    'Environmental Science', 'Data Science', 'Artificial Intelligence', 'Cybersecurity',
    'Biotechnology', 'Finance', 'Marketing', 'Human Resources', 'International Relations'
  ];
  const modes = ['Full-time', 'Part-time', 'Online', 'Hybrid'];
  const levels = ['Undergraduate', 'Postgraduate'];
  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'CHF', 'JPY', 'SGD', 'HKD', 'KRW'];

  const programs = [];

  for (let i = 0; i < 120; i++) {
    const university = universities[i % universities.length];
    const degreeType = degreeTypes[i % degreeTypes.length];
    const field = fields[i % fields.length];
    const mode = modes[i % modes.length];
    const level = degreeType === 'Bachelor' ? 'Undergraduate' : 'Postgraduate';
    const currency = currencies[i % currencies.length];
    
    const baseTuition = {
      'USD': 50000,
      'EUR': 45000,
      'GBP': 40000,
      'CAD': 35000,
      'AUD': 40000,
      'CHF': 50000,
      'JPY': 800000,
      'SGD': 45000,
      'HKD': 350000,
      'KRW': 50000000
    };

    const localTuition = baseTuition[currency as keyof typeof baseTuition] * 0.8;
    const internationalTuition = baseTuition[currency as keyof typeof baseTuition];

    programs.push({
      name: `${degreeType} in ${field}`,
      degreeType,
      fieldOfStudy: field,
      subfield: `${field} Specialization`,
      mode,
      duration: degreeType === 'Bachelor' ? '4 years' : degreeType === 'Master' ? '2 years' : '3-5 years',
      languages: ['English'],
      applicationDeadlines: ['2024-12-15', '2024-01-15'],
      intakeSessions: ['Fall', 'Spring'],
      admissionRequirements: {
        minGPA: 3.0 + (i % 10) * 0.1,
        requiredDegrees: degreeType === 'Bachelor' ? ['High School Diploma'] : ['Bachelor Degree'],
        requiredTests: degreeType === 'Bachelor' ? [{ name: 'SAT', minScore: 1200 + (i % 200) }] : [{ name: 'GRE', minScore: 300 + (i % 40) }],
        lettersOfRecommendation: degreeType === 'Bachelor' ? 0 : 2,
        requiresPersonalStatement: true,
        requiresCV: degreeType !== 'Bachelor',
        detailedRequirementNote: `Strong academic background in ${field} required.`
      },
      tuitionFees: {
        local: localTuition,
        international: internationalTuition,
        currency
      },
      availableScholarships: [],
      applicationFee: 50 + (i % 50),
      teachingMethodology: ['Lectures', 'Seminars', 'Research projects'],
      careerOutcomes: [`${field} Professional`, 'Researcher', 'Consultant'],
      employabilityRank: 70 + (i % 30),
      alumniDetails: `Graduates work in leading organizations worldwide.`,
      programSummary: `Comprehensive ${field} program at ${university.name}.`,
      vectorId: `${university.name.toLowerCase().replace(/\s+/g, '_')}_${field.toLowerCase().replace(/\s+/g, '_')}_${i}`,
      brochureLink: `https://${university.name.toLowerCase().replace(/\s+/g, '')}.edu/programs`,
      programOverview: `This ${degreeType} program in ${field} provides students with comprehensive knowledge and practical skills.`,
      learningOutcomes: `Students will develop expertise in ${field} and gain practical experience.`,
      programLevel: level
    });
  }

  return programs;
};

async function seedPrograms() {
  try {
    await connectDB();
    console.log('Connected to MongoDB Atlas');

    // Get existing schools
    const schools = await School.find({});
    console.log(`Found ${schools.length} existing schools`);

    if (schools.length === 0) {
      console.log('No schools found. Please run the main seed script first.');
      process.exit(1);
    }

    // Clear existing programs
    await Program.deleteMany({});
    console.log('Cleared existing programs');

    // Generate programs
    const programData = generatePrograms();
    console.log(`Generated ${programData.length} programs`);

    // Assign programs to schools
    const programsWithSchools = programData.map((program, index) => ({
      ...program,
      schoolId: schools[index % schools.length]._id
    }));

    // Insert programs
    const programs = await Program.insertMany(programsWithSchools);
    console.log(`Successfully seeded ${programs.length} programs`);

    console.log('Program seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding programs:', error);
    process.exit(1);
  }
}

// Run the seed function
seedPrograms();