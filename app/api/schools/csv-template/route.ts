import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Define the CSV headers based on the School model
    const headers = [
      'name',
      'country',
      'city',
      'types',
      'globalRanking',
      'yearFounded',
      'accreditationBodies',
      'websiteUrl',
      'contactEmails',
      'contactPhones',
      'logoUrl',
      'socialLinks_facebook',
      'socialLinks_twitter',
      'socialLinks_linkedin',
      'socialLinks_youtube',
      'campusType',
      'languagesOfInstruction',
      'internationalStudentCount',
      'studentFacultyRatio',
      'housingOptions',
      'supportServices',
      'avgLivingCost',
      'visaSupportServices',
      'virtualTourLink',
      'acceptanceRate',
      'campusFacilities',
      'climate',
      'safetyRating',
      'safetyDescription',
      'internshipsAvailable',
      'internshipsDescription',
      'careerServicesAvailable',
      'careerServicesDescription',
      'languageSupportAvailable',
      'languageSupportDescription',
      'studentDiversity',
      'accessibility',
      'accessibilityDescription',
      'transportLocation'
    ];

    // Create sample data with descriptions
    const sampleData = [
      'Sample University',
      'United States',
      'New York',
      'Public, Research',
      '50',
      '1853',
      'AACSB, ABET',
      'https://www.example.edu',
      'admissions@example.edu, info@example.edu',
      '+1-555-123-4567',
      'https://www.example.edu/logo.png',
      'https://facebook.com/example',
      'https://twitter.com/example',
      'https://linkedin.com/school/example',
      'https://youtube.com/example',
      'Urban',
      'English, Spanish',
      '5000',
      '15:1',
      'On-campus, Off-campus',
      'Career Services, Mental Health',
      '15000',
      'true',
      'https://www.example.edu/tour',
      '65.5',
      'Library, Gym, Labs',
      'Temperate',
      'Very Safe',
      'Low crime rate in campus area',
      'true',
      'Multiple internship programs available',
      'true',
      'Full career counseling services',
      'true',
      'ESL programs available',
      'Diverse student body with 40% international',
      'Full accessibility',
      'Wheelchair accessible facilities',
      'Near subway station, 30 min to downtown'
    ];

    // Create CSV content
    const csvContent = headers.join(',') + '\n' + sampleData.join(',');

    // Create response with CSV content
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=schools_import_template.csv',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}