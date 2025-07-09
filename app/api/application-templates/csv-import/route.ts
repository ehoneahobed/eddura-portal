import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import ApplicationTemplate from '@/models/ApplicationTemplate';
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
      createdTemplates: [] as any[]
    };

    // Group records by template (assuming multiple rows per template for sections/questions)
    const templateGroups = new Map<string, any[]>();
    
    records.forEach((record: any, index: number) => {
      const templateKey = record.templateTitle || `template_${index}`;
      if (!templateGroups.has(templateKey)) {
        templateGroups.set(templateKey, []);
      }
      templateGroups.get(templateKey)!.push(record);
    });

    // Process each template group
    for (const [templateKey, templateRecords] of Array.from(templateGroups.entries())) {
      try {
        const firstRecord = templateRecords[0];
        
        // Find scholarship by ID or title
        let scholarship;
        if (firstRecord.scholarshipId) {
          scholarship = await Scholarship.findById(firstRecord.scholarshipId);
        } else if (firstRecord.scholarshipTitle) {
          scholarship = await Scholarship.findOne({ title: firstRecord.scholarshipTitle });
        }
        
        if (!scholarship) {
          throw new Error(`Scholarship not found: ${firstRecord.scholarshipTitle || firstRecord.scholarshipId}`);
        }

        // Convert array strings to arrays
        const processArrayField = (field: string) => {
          if (!field) return [];
          return field.split(',').map(item => item.trim()).filter(item => item);
        };

        // Process sections and questions
        const sectionsMap = new Map<string, any>();
        
        templateRecords.forEach((record: any) => {
          const sectionId = record.sectionId || 'default';
          const sectionTitle = record.sectionTitle || 'Default Section';
          
          if (!sectionsMap.has(sectionId)) {
            sectionsMap.set(sectionId, {
              id: sectionId,
              title: sectionTitle,
              description: record.sectionDescription || '',
              order: parseInt(record.sectionOrder || '1'),
              questions: [],
              isRepeatable: record.sectionIsRepeatable === 'true',
              maxRepeats: record.sectionMaxRepeats ? parseInt(record.sectionMaxRepeats) : undefined
            });
          }
          
          // Add question if provided
          if (record.questionId) {
            const question: any = {
              id: record.questionId,
              type: record.questionType || 'text',
              title: record.questionTitle || '',
              description: record.questionDescription || '',
              placeholder: record.questionPlaceholder || '',
              required: record.questionRequired === 'true',
              order: parseInt(record.questionOrder || '1'),
              helpText: record.questionHelpText || '',
              maxLength: record.questionMaxLength ? parseInt(record.questionMaxLength) : undefined,
              minLength: record.questionMinLength ? parseInt(record.questionMinLength) : undefined,
              defaultValue: record.questionDefaultValue || undefined,
              group: record.questionGroup || undefined
            };

            // Process options for select/radio/checkbox questions
            if (record.questionOptions && ['select', 'multiselect', 'radio', 'checkbox'].includes(question.type)) {
              question.options = record.questionOptions.split(';').map((opt: any) => {
                const [value, label] = opt.split(':');
                return {
                  value: value.trim(),
                  label: label ? label.trim() : value.trim()
                };
              });
            }

            // Process file config for file upload questions
            if (record.questionFileTypes && question.type === 'file') {
              question.fileConfig = {
                allowedTypes: processArrayField(record.questionFileTypes),
                maxSize: record.questionFileMaxSize ? parseInt(record.questionFileMaxSize) : 10,
                maxFiles: record.questionFileMaxFiles ? parseInt(record.questionFileMaxFiles) : 1,
                description: record.questionFileDescription || ''
              };
            }

            // Process validation rules
            if (record.questionValidation) {
              question.validation = record.questionValidation.split(';').map((rule: any) => {
                const [type, value, message] = rule.split(':');
                return {
                  type: type.trim(),
                  value: value ? value.trim() : undefined,
                  message: message ? message.trim() : `${type} validation failed`
                };
              });
            }

            // Process conditional logic
            if (record.questionConditionalDependsOn) {
              question.conditional = {
                dependsOn: record.questionConditionalDependsOn,
                condition: record.questionConditionalCondition || 'equals',
                value: record.questionConditionalValue || ''
              };
            }

            sectionsMap.get(sectionId)!.questions.push(question);
          }
        });

        // Sort questions within each section by order
        sectionsMap.forEach((section: any) => {
          section.questions.sort((a: any, b: any) => a.order - b.order);
        });

        // Convert sections map to array and sort by order
        const sections = Array.from(sectionsMap.values()).sort((a: any, b: any) => a.order - b.order);

        const templateData = {
          scholarshipId: scholarship._id,
          title: firstRecord.templateTitle || 'Imported Template',
          description: firstRecord.templateDescription || '',
          version: firstRecord.templateVersion || '1.0.0',
          isActive: firstRecord.templateIsActive !== 'false',
          sections,
          estimatedTime: firstRecord.templateEstimatedTime ? parseInt(firstRecord.templateEstimatedTime) : 30,
          instructions: firstRecord.templateInstructions || '',
          submissionDeadline: firstRecord.templateSubmissionDeadline ? new Date(firstRecord.templateSubmissionDeadline) : undefined,
          allowDraftSaving: firstRecord.templateAllowDraftSaving !== 'false',
          requireEmailVerification: firstRecord.templateRequireEmailVerification === 'true',
          requirePhoneVerification: firstRecord.templateRequirePhoneVerification === 'true',
          maxFileSize: firstRecord.templateMaxFileSize ? parseInt(firstRecord.templateMaxFileSize) : 10,
          allowedFileTypes: processArrayField(firstRecord.templateAllowedFileTypes)
        };

        // Create application template
        const template = new ApplicationTemplate(templateData);
        await template.save();
        
        results.success++;
        results.createdTemplates.push({
          id: template._id,
          title: template.title,
          scholarship: scholarship.title,
          sections: template.sections.length
        });
        
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          template: templateKey,
          error: error.message
        });
      }
    }

    return NextResponse.json(results);
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}