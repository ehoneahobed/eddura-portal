# CSV Import Guide

This guide explains how to use the CSV import functionality for Schools, Programs, Scholarships, and Application Templates.

## Overview

The CSV import feature allows you to bulk import data for:
- **Schools** - Educational institutions
- **Programs** - Academic programs offered by schools
- **Scholarships** - Financial aid opportunities
- **Application Templates** - Form templates for scholarship applications

## Key Features

- ✅ **Bulk Import** - Import multiple records at once
- ✅ **Single Import** - Import individual records
- ✅ **Template Download** - Get properly formatted CSV templates
- ✅ **Validation** - Comprehensive error checking and reporting
- ✅ **Relationship Handling** - Automatic linking of related entities
- ✅ **Progress Tracking** - Real-time import progress
- ✅ **Error Reporting** - Detailed error messages for failed imports

## Getting Started

### 1. Access the Import Feature

Navigate to any admin page:
- `/admin/schools` - School management
- `/admin/programs` - Program management
- `/admin/scholarships` - Scholarship management
- `/admin/application-templates` - Template management

Look for the "Import CSV" button in the top-right corner.

### 2. Download Template

1. Click "Import CSV" to open the import modal
2. Click "Download CSV Template" to get the properly formatted template
3. Open the template in your preferred spreadsheet application

### 3. Prepare Your Data

Follow the template format exactly. Each entity has specific requirements:

## Entity-Specific Import Guides

### Schools Import

**Template Fields:**
- `name` (required) - School name
- `country` (required) - Country where school is located
- `city` (required) - City where school is located
- `types` - School types (comma-separated: "Public, Research")
- `globalRanking` - Global ranking (number)
- `yearFounded` - Year established
- `websiteUrl` - Official website
- `contactEmails` - Email addresses (comma-separated)
- `contactPhones` - Phone numbers (comma-separated)
- `logoUrl` - Logo image URL
- `socialLinks_*` - Social media links (facebook, twitter, linkedin, youtube)
- `campusType` - Urban/Suburban/Rural/Unknown
- `languagesOfInstruction` - Languages (comma-separated)
- `avgLivingCost` - Average living cost (number)
- `visaSupportServices` - true/false
- `acceptanceRate` - Acceptance rate percentage
- Plus many more fields...

**Example:**
```csv
name,country,city,types,globalRanking,yearFounded,websiteUrl
"Harvard University","United States","Cambridge","Private, Research",1,1636,"https://harvard.edu"
"MIT","United States","Cambridge","Private, Research",2,1861,"https://mit.edu"
```

### Programs Import

**Key Requirements:**
- Programs must be linked to existing schools
- Use either `schoolId` (MongoDB ObjectId) or `schoolName` (exact match)

**Template Fields:**
- `schoolId` - MongoDB ObjectId of the school (optional if schoolName provided)
- `schoolName` - Exact name of existing school (optional if schoolId provided)
- `name` (required) - Program name
- `degreeType` (required) - Diploma/Bachelor/Master/MBA/PhD/Certificate/Short Course
- `fieldOfStudy` (required) - Field of study
- `mode` (required) - Full-time/Part-time/Online/Hybrid
- `duration` (required) - Duration description
- `programLevel` (required) - Undergraduate/Postgraduate
- `tuitionFees_local` (required) - Local student tuition
- `tuitionFees_international` (required) - International student tuition
- `tuitionFees_currency` (required) - Currency code (USD, EUR, etc.)
- `languages` - Languages (comma-separated)
- `applicationDeadlines` - Deadlines (comma-separated)
- `requiredTests` - Format: "SAT:1200;GRE:320" (test:score pairs)
- Plus admission requirements and other fields...

**Example:**
```csv
schoolName,name,degreeType,fieldOfStudy,mode,duration,programLevel,tuitionFees_local,tuitionFees_international,tuitionFees_currency
"Harvard University","Computer Science","Bachelor","Engineering","Full-time","4 years","Undergraduate",50000,55000,"USD"
```

### Scholarships Import

**Template Fields:**
- `title` (required) - Scholarship title
- `scholarshipDetails` (required) - Description
- `provider` (required) - Provider organization
- `frequency` (required) - One-time/Annual/Full Duration
- `deadline` (required) - Application deadline
- `applicationLink` (required) - Application URL
- `coverage` (required) - What it covers (comma-separated)
- `value` - Scholarship amount or description
- `currency` - Currency code
- `eligibility_*` - Eligibility criteria fields
- `applicationRequirements_*` - Application requirement fields
- `contactInfo_*` - Contact information fields
- Plus many more fields...

**Example:**
```csv
title,scholarshipDetails,provider,frequency,deadline,applicationLink,coverage,value,currency
"Excellence Scholarship","Merit-based scholarship","University Foundation","Annual","2024-03-15","https://apply.edu","Tuition, Books",25000,"USD"
```

### Application Templates Import

**Special Requirements:**
- Templates must reference existing scholarships
- Can have multiple rows per template (for different sections/questions)
- Complex nested structure with sections and questions

**Template Fields:**
- `scholarshipId` - MongoDB ObjectId (optional if scholarshipTitle provided)
- `scholarshipTitle` - Exact scholarship title (optional if scholarshipId provided)
- `templateTitle` - Template name
- `templateDescription` - Template description
- `templateEstimatedTime` - Estimated completion time in minutes
- `sectionId` - Section identifier
- `sectionTitle` - Section title
- `sectionOrder` - Section order number
- `questionId` - Question identifier
- `questionType` - Question type (text, email, select, etc.)
- `questionTitle` - Question title
- `questionRequired` - true/false
- `questionOrder` - Question order within section
- `questionOptions` - For select questions (format: "value1:label1;value2:label2")
- `questionValidation` - Validation rules (format: "required:true:message;min:5:message")
- Plus many more fields...

**Example:**
```csv
scholarshipTitle,templateTitle,sectionId,sectionTitle,sectionOrder,questionId,questionType,questionTitle,questionRequired,questionOrder
"Excellence Scholarship","Application Form","personal","Personal Info",1,"first_name","text","First Name","true",1
"Excellence Scholarship","Application Form","personal","Personal Info",1,"last_name","text","Last Name","true",2
```

## Import Process

### 1. Prepare Your CSV File

- Use UTF-8 encoding
- Ensure proper comma separation
- Quote fields containing commas or special characters
- Follow the exact column names from the template

### 2. Upload and Import

1. Click "Import CSV" button
2. Click "Choose File" and select your CSV
3. Review file information
4. Click "Import CSV" to start the process
5. Monitor the progress bar
6. Review import results

### 3. Review Results

After import completion, you'll see:
- **Total Records** - Number of rows processed
- **Successful** - Successfully imported records
- **Failed** - Records that failed validation
- **Errors** - Detailed error messages for failures

## Best Practices

### Data Preparation

1. **Clean Your Data**
   - Remove empty rows
   - Ensure consistent formatting
   - Validate email addresses and URLs

2. **Test Small Batches**
   - Start with 5-10 records
   - Verify import success before bulk import
   - Check relationships are properly linked

3. **Handle Dependencies**
   - Import schools before programs
   - Import scholarships before application templates
   - Ensure referenced entities exist

### Error Handling

1. **Common Errors**
   - Missing required fields
   - Invalid data formats
   - Broken relationships (referenced entity not found)
   - Duplicate entries

2. **Troubleshooting**
   - Check error messages for specific issues
   - Verify related entities exist
   - Ensure proper data types (numbers, dates, booleans)
   - Validate array fields use comma separation

### Performance Tips

1. **File Size**
   - Keep files under 10MB
   - Split large imports into smaller batches
   - Consider server timeout limits

2. **Data Validation**
   - Validate data before upload
   - Use consistent naming conventions
   - Ensure referential integrity

## Advanced Features

### Relationship Handling

**Programs → Schools:**
- Use `schoolName` for human-readable references
- Use `schoolId` for direct database references
- System automatically finds and links existing schools

**Templates → Scholarships:**
- Use `scholarshipTitle` for human-readable references
- Use `scholarshipId` for direct database references
- System automatically finds and links existing scholarships

### Data Validation

**Field Validation:**
- Required fields are enforced
- Data types are validated (numbers, dates, emails)
- Enum values are checked (degree types, modes, etc.)
- Array fields are properly parsed

**Business Logic:**
- Duplicate prevention
- Referential integrity
- Field constraints (min/max values, string lengths)

### Complex Structures

**Application Templates:**
- Support multi-row templates (one row per question)
- Automatic section grouping
- Question ordering and validation
- Conditional logic support

## API Endpoints

### Import Endpoints
- `POST /api/schools/csv-import`
- `POST /api/programs/csv-import`
- `POST /api/scholarships/csv-import`
- `POST /api/application-templates/csv-import`

### Template Endpoints
- `GET /api/schools/csv-template`
- `GET /api/programs/csv-template`
- `GET /api/scholarships/csv-template`
- `GET /api/application-templates/csv-template`

## Troubleshooting

### Common Issues

1. **"School not found" Error**
   - Ensure school exists in database
   - Check exact spelling of school name
   - Verify school was previously imported

2. **"Scholarship not found" Error**
   - Ensure scholarship exists in database
   - Check exact spelling of scholarship title
   - Verify scholarship was previously imported

3. **"Invalid date format" Error**
   - Use ISO format: YYYY-MM-DD
   - Ensure dates are properly formatted
   - Check timezone considerations

4. **"File too large" Error**
   - Split file into smaller batches
   - Remove unnecessary data
   - Compress or optimize file size

### Getting Help

1. **Check Error Messages**
   - Review detailed error descriptions
   - Note specific row numbers with issues
   - Address validation errors systematically

2. **Validate Templates**
   - Download fresh templates
   - Compare your data format
   - Ensure all required fields are present

3. **Test Incrementally**
   - Start with minimal data
   - Add complexity gradually
   - Verify each step works correctly

## Security Considerations

- File uploads are validated for type and size
- CSV parsing includes security checks
- Data validation prevents malicious input
- User authentication required for import access
- All imports are logged for audit purposes

## Performance Monitoring

- Import progress is tracked and displayed
- Large imports may take several minutes
- Server resources are managed automatically
- Failed imports can be retried safely

This comprehensive CSV import system provides a powerful way to efficiently manage large amounts of data while maintaining data integrity and providing excellent user experience.