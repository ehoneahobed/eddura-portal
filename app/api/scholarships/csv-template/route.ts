import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Define the CSV headers based on the Scholarship model
    const headers = [
      'title',
      'scholarshipDetails',
      'provider',
      'linkedSchool',
      'linkedProgram',
      'coverage',
      'value',
      'currency',
      'frequency',
      'numberOfAwardsPerYear',
      'eligibility_nationalities',
      'eligibility_genders',
      'eligibility_disabilityStatus',
      'eligibility_degreeLevels',
      'eligibility_fieldsOfStudy',
      'eligibility_minGPA',
      'eligibility_ageLimit',
      'eligibility_countryResidency',
      'eligibility_incomeStatus',
      'eligibility_additionalCriteria',
      'applicationRequirements_essay',
      'applicationRequirements_cv',
      'applicationRequirements_testScores',
      'applicationRequirements_recommendationLetters',
      'applicationRequirements_requirementsDescription',
      'applicationRequirements_documentsToSubmit',
      'deadline',
      'applicationLink',
      'selectionCriteria',
      'renewalConditions',
      'decisionTimeline',
      'tags',
      'vectorId',
      'notes',
      'awardUsage',
      'contactInfo_email',
      'contactInfo_phone',
      'applicationMethod',
      'selectionProcess',
      'notificationMethod',
      'eligibleRegions',
      'deferralPolicy',
      'infoPage',
      'faqLink',
      'disbursementDetails',
      'pastRecipients'
    ];

    // Create sample data with descriptions
    const sampleData = [
      'Excellence Scholarship',
      'Merit-based scholarship for outstanding students',
      'University Foundation',
      'Sample University',
      'Computer Science',
      'Tuition, Living expenses',
      '25000',
      'USD',
      'Annual',
      '10',
      'All nationalities',
      'All genders',
      'false',
      'Bachelor, Master',
      'Engineering, Computer Science',
      '3.5',
      'Under 25',
      'Any country',
      'Any income level',
      'Strong academic record required',
      'true',
      'true',
      'false',
      '2',
      'Academic transcripts and essays required',
      'Transcript, Essay, CV',
      '2024-03-15',
      'https://example.edu/scholarship-apply',
      'Academic merit, Leadership potential',
      'Maintain 3.0 GPA',
      'Results announced in May',
      'merit, academic, excellence',
      '',
      'Highly competitive program',
      'Tuition, Books, Research',
      'scholarships@example.edu',
      '+1-555-123-4567',
      'Online application',
      'Committee review and interviews',
      'Email and phone',
      'North America, Europe',
      'Deferral allowed with approval',
      'https://example.edu/scholarship-info',
      'https://example.edu/scholarship-faq',
      'Disbursed in two installments',
      'Many recipients now in leadership roles'
    ];

    // Create CSV content
    const csvContent = headers.join(',') + '\n' + sampleData.join(',');

    // Create response with CSV content
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="scholarships_import_template.csv"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}