import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import School from '@/models/School';
import connectDB from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const csvText = await file.text();
    
    // Parse CSV
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const results = {
      total: records.length,
      success: 0,
      failed: 0,
      errors: [] as any[],
      createdSchools: [] as any[]
    };

    // Process each record
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      
      try {
        // Convert array strings to arrays
        const processArrayField = (field: string) => {
          if (!field) return [];
          return field.split(',').map(item => item.trim()).filter(item => item);
        };

        const schoolData = {
          name: record.name,
          country: record.country,
          city: record.city,
          types: processArrayField(record.types),
          globalRanking: record.globalRanking ? parseInt(record.globalRanking) : undefined,
          yearFounded: record.yearFounded ? parseInt(record.yearFounded) : undefined,
          accreditationBodies: processArrayField(record.accreditationBodies),
          websiteUrl: record.websiteUrl,
          contactEmails: processArrayField(record.contactEmails),
          contactPhones: processArrayField(record.contactPhones),
          logoUrl: record.logoUrl,
          socialLinks: {
            facebook: record.socialLinks_facebook,
            twitter: record.socialLinks_twitter,
            linkedin: record.socialLinks_linkedin,
            youtube: record.socialLinks_youtube,
          },
          campusType: record.campusType,
          languagesOfInstruction: processArrayField(record.languagesOfInstruction),
          internationalStudentCount: record.internationalStudentCount ? parseInt(record.internationalStudentCount) : undefined,
          studentFacultyRatio: record.studentFacultyRatio,
          housingOptions: processArrayField(record.housingOptions),
          supportServices: processArrayField(record.supportServices),
          avgLivingCost: record.avgLivingCost ? parseFloat(record.avgLivingCost) : undefined,
          visaSupportServices: record.visaSupportServices === 'true',
          virtualTourLink: record.virtualTourLink,
          acceptanceRate: record.acceptanceRate ? parseFloat(record.acceptanceRate) : undefined,
          campusFacilities: processArrayField(record.campusFacilities),
          climate: record.climate,
          safetyRating: record.safetyRating,
          safetyDescription: record.safetyDescription,
          internshipsAvailable: record.internshipsAvailable === 'true',
          internshipsDescription: record.internshipsDescription,
          careerServicesAvailable: record.careerServicesAvailable === 'true',
          careerServicesDescription: record.careerServicesDescription,
          languageSupportAvailable: record.languageSupportAvailable === 'true',
          languageSupportDescription: record.languageSupportDescription,
          studentDiversity: record.studentDiversity,
          accessibility: record.accessibility,
          accessibilityDescription: record.accessibilityDescription,
          transportLocation: record.transportLocation,
        };

        // Create school
        const school = new School(schoolData);
        await school.save();
        
        results.success++;
        results.createdSchools.push({
          id: school._id,
          name: school.name,
          country: school.country,
          city: school.city
        });
        
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          record: record,
          error: error.message
        });
      }
    }

    return NextResponse.json(results);
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}