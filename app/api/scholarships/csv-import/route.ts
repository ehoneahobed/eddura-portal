import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import Scholarship from '@/models/Scholarship';
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
      createdScholarships: [] as any[]
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

        // Process eligibility criteria
        const eligibility: any = {};
        if (record.eligibility_nationalities) {
          eligibility.nationalities = processArrayField(record.eligibility_nationalities);
        }
        if (record.eligibility_genders) {
          eligibility.genders = processArrayField(record.eligibility_genders);
        }
        if (record.eligibility_disabilityStatus) {
          eligibility.disabilityStatus = record.eligibility_disabilityStatus === 'true';
        }
        if (record.eligibility_degreeLevels) {
          eligibility.degreeLevels = processArrayField(record.eligibility_degreeLevels);
        }
        if (record.eligibility_fieldsOfStudy) {
          eligibility.fieldsOfStudy = processArrayField(record.eligibility_fieldsOfStudy);
        }
        if (record.eligibility_minGPA) {
          eligibility.minGPA = parseFloat(record.eligibility_minGPA);
        }
        if (record.eligibility_ageLimit) {
          eligibility.ageLimit = record.eligibility_ageLimit;
        }
        if (record.eligibility_countryResidency) {
          eligibility.countryResidency = processArrayField(record.eligibility_countryResidency);
        }
        if (record.eligibility_incomeStatus) {
          eligibility.incomeStatus = record.eligibility_incomeStatus;
        }
        if (record.eligibility_additionalCriteria) {
          eligibility.additionalCriteria = record.eligibility_additionalCriteria;
        }

        // Process application requirements
        const applicationRequirements: any = {};
        if (record.applicationRequirements_essay) {
          applicationRequirements.essay = record.applicationRequirements_essay === 'true';
        }
        if (record.applicationRequirements_cv) {
          applicationRequirements.cv = record.applicationRequirements_cv === 'true';
        }
        if (record.applicationRequirements_testScores) {
          applicationRequirements.testScores = record.applicationRequirements_testScores === 'true';
        }
        if (record.applicationRequirements_recommendationLetters) {
          applicationRequirements.recommendationLetters = parseInt(record.applicationRequirements_recommendationLetters);
        }
        if (record.applicationRequirements_requirementsDescription) {
          applicationRequirements.requirementsDescription = record.applicationRequirements_requirementsDescription;
        }
        if (record.applicationRequirements_documentsToSubmit) {
          applicationRequirements.documentsToSubmit = processArrayField(record.applicationRequirements_documentsToSubmit);
        }

        // Process contact info
        const contactInfo: any = {};
        if (record.contactInfo_email) {
          contactInfo.email = record.contactInfo_email;
        }
        if (record.contactInfo_phone) {
          contactInfo.phone = record.contactInfo_phone;
        }

        const scholarshipData = {
          title: record.title,
          scholarshipDetails: record.scholarshipDetails,
          provider: record.provider,
          linkedSchool: record.linkedSchool,
          linkedProgram: record.linkedProgram,
          coverage: processArrayField(record.coverage),
          value: record.value ? (isNaN(parseFloat(record.value)) ? record.value : parseFloat(record.value)) : undefined,
          currency: record.currency,
          frequency: record.frequency,
          numberOfAwardsPerYear: record.numberOfAwardsPerYear ? parseInt(record.numberOfAwardsPerYear) : undefined,
          eligibility,
          applicationRequirements,
          deadline: record.deadline,
          startDate: record.startDate,
          applicationLink: record.applicationLink,
          selectionCriteria: processArrayField(record.selectionCriteria),
          renewalConditions: record.renewalConditions,
          decisionTimeline: record.decisionTimeline,
          tags: processArrayField(record.tags),
          vectorId: record.vectorId,
          notes: record.notes,
          awardUsage: processArrayField(record.awardUsage),
          contactInfo,
          applicationMethod: record.applicationMethod,
          selectionProcess: record.selectionProcess,
          notificationMethod: record.notificationMethod,
          eligibleRegions: processArrayField(record.eligibleRegions),
          deferralPolicy: record.deferralPolicy,
          infoPage: record.infoPage,
          faqLink: record.faqLink,
          disbursementDetails: record.disbursementDetails,
          pastRecipients: record.pastRecipients,
        };

        // Create scholarship
        const scholarship = new Scholarship(scholarshipData);
        await scholarship.save();
        
        results.success++;
        results.createdScholarships.push({
          id: scholarship._id,
          title: scholarship.title,
          provider: scholarship.provider,
          value: scholarship.value
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