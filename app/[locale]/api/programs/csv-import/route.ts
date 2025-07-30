import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import Program from '@/models/Program';
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
      createdPrograms: [] as any[]
    };

    // Process each record
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      
      try {
        // Find school by name or ID
        let school;
        if (record.schoolId) {
          school = await School.findById(record.schoolId);
        } else if (record.schoolName) {
          school = await School.findOne({ name: record.schoolName });
        }
        
        if (!school) {
          throw new Error(`School not found: ${record.schoolName || record.schoolId}`);
        }

        // Convert array strings to arrays
        const processArrayField = (field: string) => {
          if (!field) return [];
          return field.split(',').map(item => item.trim()).filter(item => item);
        };

        // Process admission requirements
        const admissionRequirements: any = {};
        if (record.admissionRequirements_minGPA) {
          admissionRequirements.minGPA = parseFloat(record.admissionRequirements_minGPA);
        }
        if (record.admissionRequirements_requiredDegrees) {
          admissionRequirements.requiredDegrees = processArrayField(record.admissionRequirements_requiredDegrees);
        }
        if (record.admissionRequirements_lettersOfRecommendation) {
          admissionRequirements.lettersOfRecommendation = parseInt(record.admissionRequirements_lettersOfRecommendation);
        }
        if (record.admissionRequirements_requiresPersonalStatement) {
          admissionRequirements.requiresPersonalStatement = record.admissionRequirements_requiresPersonalStatement === 'true';
        }
        if (record.admissionRequirements_requiresCV) {
          admissionRequirements.requiresCV = record.admissionRequirements_requiresCV === 'true';
        }
        if (record.admissionRequirements_detailedRequirementNote) {
          admissionRequirements.detailedRequirementNote = record.admissionRequirements_detailedRequirementNote;
        }

        // Process required tests
        const requiredTests = [];
        if (record.requiredTests) {
          const testsData = record.requiredTests.split(';');
          for (const testData of testsData) {
            const [name, minScore] = testData.split(':');
            if (name && minScore) {
              requiredTests.push({
                name: name.trim(),
                minScore: parseInt(minScore.trim())
              });
            }
          }
        }
        if (requiredTests.length > 0) {
          admissionRequirements.requiredTests = requiredTests;
        }

        const programData = {
          schoolId: school._id,
          name: record.name,
          degreeType: record.degreeType,
          fieldOfStudy: record.fieldOfStudy,
          subfield: record.subfield,
          mode: record.mode,
          duration: record.duration,
          languages: processArrayField(record.languages),
          applicationDeadlines: processArrayField(record.applicationDeadlines),
          intakeSessions: processArrayField(record.intakeSessions),
          admissionRequirements,
          tuitionFees: {
            local: parseFloat(record.tuitionFees_local),
            international: parseFloat(record.tuitionFees_international),
            currency: record.tuitionFees_currency || 'USD'
          },
          availableScholarships: processArrayField(record.availableScholarships),
          applicationFee: record.applicationFee ? parseFloat(record.applicationFee) : undefined,
          teachingMethodology: processArrayField(record.teachingMethodology),
          careerOutcomes: processArrayField(record.careerOutcomes),
          employabilityRank: record.employabilityRank ? parseInt(record.employabilityRank) : undefined,
          alumniDetails: record.alumniDetails,
          programSummary: record.programSummary,
          vectorId: record.vectorId,
          brochureLink: record.brochureLink,
          programOverview: record.programOverview,
          learningOutcomes: record.learningOutcomes,
          programLevel: record.programLevel,
        };

        // Create program
        const program = new Program(programData);
        await program.save();
        
        results.success++;
        results.createdPrograms.push({
          id: program._id,
          name: program.name,
          school: school.name,
          degreeType: program.degreeType
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