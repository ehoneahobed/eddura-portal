import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Define the CSV headers based on the ApplicationTemplate model
    const headers = [
      'scholarshipId',
      'scholarshipTitle',
      'templateTitle',
      'templateDescription',
      'templateVersion',
      'templateIsActive',
      'templateEstimatedTime',
      'templateInstructions',
      'templateSubmissionDeadline',
      'templateAllowDraftSaving',
      'templateRequireEmailVerification',
      'templateRequirePhoneVerification',
      'templateMaxFileSize',
      'templateAllowedFileTypes',
      'sectionId',
      'sectionTitle',
      'sectionDescription',
      'sectionOrder',
      'sectionIsRepeatable',
      'sectionMaxRepeats',
      'questionId',
      'questionType',
      'questionTitle',
      'questionDescription',
      'questionPlaceholder',
      'questionRequired',
      'questionOrder',
      'questionHelpText',
      'questionMaxLength',
      'questionMinLength',
      'questionDefaultValue',
      'questionGroup',
      'questionOptions',
      'questionFileTypes',
      'questionFileMaxSize',
      'questionFileMaxFiles',
      'questionFileDescription',
      'questionValidation',
      'questionConditionalDependsOn',
      'questionConditionalCondition',
      'questionConditionalValue'
    ];

    // Create sample data showing multiple rows for the same template
    const sampleData = [
      // First row - template with first section and question
      [
        '', // scholarshipId - leave empty if using scholarshipTitle
        'Excellence Scholarship',
        'Excellence Scholarship Application',
        'Application form for the Excellence Scholarship program',
        '1.0.0',
        'true',
        '45',
        'Please complete all sections carefully',
        '2024-03-15',
        'true',
        'true',
        'false',
        '10',
        'pdf,doc,docx',
        'personal_info',
        'Personal Information',
        'Basic personal details',
        '1',
        'false',
        '',
        'first_name',
        'text',
        'First Name',
        'Enter your first name',
        'John',
        'true',
        '1',
        'Use your legal first name',
        '50',
        '2',
        '',
        'personal',
        '',
        '',
        '',
        '',
        '',
        'required:true:First name is required',
        '',
        '',
        ''
      ],
      // Second row - same template, same section, different question
      [
        '',
        'Excellence Scholarship',
        'Excellence Scholarship Application',
        'Application form for the Excellence Scholarship program',
        '1.0.0',
        'true',
        '45',
        'Please complete all sections carefully',
        '2024-03-15',
        'true',
        'true',
        'false',
        '10',
        'pdf,doc,docx',
        'personal_info',
        'Personal Information',
        'Basic personal details',
        '1',
        'false',
        '',
        'last_name',
        'text',
        'Last Name',
        'Enter your last name',
        'Doe',
        'true',
        '2',
        'Use your legal last name',
        '50',
        '2',
        '',
        'personal',
        '',
        '',
        '',
        '',
        '',
        'required:true:Last name is required',
        '',
        '',
        ''
      ],
      // Third row - same template, different section
      [
        '',
        'Excellence Scholarship',
        'Excellence Scholarship Application',
        'Application form for the Excellence Scholarship program',
        '1.0.0',
        'true',
        '45',
        'Please complete all sections carefully',
        '2024-03-15',
        'true',
        'true',
        'false',
        '10',
        'pdf,doc,docx',
        'academic_info',
        'Academic Information',
        'Your academic background',
        '2',
        'false',
        '',
        'gpa',
        'gpa',
        'Current GPA',
        'Enter your current GPA',
        '',
        'true',
        '1',
        'Use 4.0 scale',
        '',
        '',
        '',
        'academic',
        '',
        '',
        '',
        '',
        '',
        'required:true:GPA is required;min:0:GPA must be at least 0;max:4:GPA cannot exceed 4.0',
        '',
        '',
        ''
      ]
    ];

    // Helper function to escape CSV values
    const escapeCSVValue = (value: string) => {
      // If value contains comma, newline, or quotes, wrap in quotes and escape internal quotes
      if (value.includes(',') || value.includes('\n') || value.includes('"')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    // Create CSV content with properly escaped values
    const csvContent = headers.join(',') + '\n' + 
      sampleData.map(row => row.map(escapeCSVValue).join(',')).join('\n');

    // Create response with CSV content
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=application_templates_import_template.csv',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}