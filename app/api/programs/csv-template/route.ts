import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Define the CSV headers based on the Program model
    const headers = [
      'schoolId',
      'schoolName',
      'name',
      'degreeType',
      'fieldOfStudy',
      'subfield',
      'mode',
      'duration',
      'languages',
      'applicationDeadlines',
      'intakeSessions',
      'admissionRequirements_minGPA',
      'admissionRequirements_requiredDegrees',
      'admissionRequirements_lettersOfRecommendation',
      'admissionRequirements_requiresPersonalStatement',
      'admissionRequirements_requiresCV',
      'admissionRequirements_detailedRequirementNote',
      'requiredTests',
      'tuitionFees_local',
      'tuitionFees_international',
      'tuitionFees_currency',
      'availableScholarships',
      'applicationFee',
      'teachingMethodology',
      'careerOutcomes',
      'employabilityRank',
      'alumniDetails',
      'programSummary',
      'vectorId',
      'brochureLink',
      'programOverview',
      'learningOutcomes',
      'programLevel'
    ];

    // Create sample data with descriptions
    const sampleData = [
      '', // schoolId - leave empty if using schoolName
      'Sample University',
      'Computer Science',
      'Bachelor',
      'Engineering',
      'Software Engineering',
      'Full-time',
      '4 years',
      'English, Spanish',
      '2024-01-15, 2024-05-15',
      'Fall, Spring',
      '3.0',
      'High School Diploma',
      '2',
      'true',
      'true',
      'Strong background in mathematics required',
      'SAT:1200; ACT:26',
      '25000',
      '35000',
      'USD',
      'Merit Scholarship, Need-based Aid',
      '100',
      'Lectures, Labs, Projects',
      'Software Developer, Data Scientist',
      '85',
      'Many graduates work at top tech companies',
      'Comprehensive computer science program',
      '',
      'https://example.edu/cs-brochure.pdf',
      'Modern curriculum covering all aspects of computer science',
      'Problem-solving, Programming, System design',
      'Undergraduate'
    ];

    // Create CSV content
    const csvContent = headers.join(',') + '\n' + sampleData.join(',');

    // Create response with CSV content
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=programs_import_template.csv',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}