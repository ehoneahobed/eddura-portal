# Database Seeding Scripts

This directory contains scripts for seeding the database with initial data.

## Requirements Templates Seeder

### Overview
The `seed-requirements-templates.ts` script creates comprehensive requirements templates for different application types. These templates provide students with pre-configured requirements for various application scenarios.

### Templates Created

1. **Graduate School Application** (12 requirements)
   - Academic documents (transcripts, certificates, CV)
   - Personal statements and research statements
   - Letters of recommendation and writing samples
   - GRE scores (general and subject tests)
   - TOEFL/IELTS for international students
   - Application fees and interviews

2. **Undergraduate Application** (12 requirements)
   - High school transcripts and diploma
   - Personal essays and supplemental essays
   - Letters of recommendation and activities resume
   - SAT/ACT scores and subject tests
   - TOEFL/IELTS for international students
   - Application fees and interviews

3. **Scholarship Application** (10 requirements)
   - Academic documents and personal statements
   - Leadership essays and letters of recommendation
   - Financial aid forms and income verification
   - Standardized test scores
   - Application fees and scholarship interviews

4. **International Student Application** (11 requirements)
   - Academic documents with translations
   - Credential evaluations
   - TOEFL/IELTS scores
   - Financial support documents
   - Passport and visa documents
   - SEVIS and visa application fees

### Usage

```bash
# Run the seeder
pnpm seed:templates

# Or run directly with ts-node
npx ts-node --compiler-options '{"module":"commonjs"}' scripts/seed-requirements-templates.ts
```

### Features

- **Smart Creation**: Only creates templates if none exist
- **Comprehensive Coverage**: Covers all major application types
- **Detailed Requirements**: Each requirement includes file types, size limits, and descriptions
- **Categorized**: Requirements are organized by category (academic, personal, professional, financial, administrative)
- **Realistic**: Based on actual application requirements from universities and scholarship programs

### Requirements Categories

- **Academic**: Transcripts, test scores, academic documents
- **Personal**: Essays, personal statements, motivation letters
- **Professional**: CVs, recommendation letters, interviews
- **Financial**: Financial aid forms, income verification, fees
- **Administrative**: Passports, visas, application forms

### Requirement Types

- **Document**: File uploads (PDF, DOC, DOCX)
- **Test Score**: Standardized test results
- **Fee**: Application and processing fees
- **Interview**: Scheduled interviews or meetings
- **Other**: Miscellaneous requirements

### Benefits for Students

1. **No Manual Setup**: Students don't need to create requirements from scratch
2. **Comprehensive Coverage**: All standard requirements are included
3. **Realistic Expectations**: Requirements match actual application processes
4. **Time Saving**: Reduces time spent on requirement setup
5. **Consistency**: Ensures all applications have proper requirements

### Customization

The script can be easily modified to:
- Add new templates for specific programs
- Modify existing requirements
- Add new requirement types
- Change file size limits or allowed formats

### Database Impact

- Creates 4 system templates
- Adds 45 total requirements across all templates
- Uses minimal database space
- Templates are marked as system templates (cannot be deleted by users) 