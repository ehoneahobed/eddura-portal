# Eddura Portal

A comprehensive scholarship and educational program management system built with Next.js, TypeScript, and MongoDB.

## Features

### Scholarship Management
- **Flexible Value Input**: Scholarship values can now be either:
  - **Number**: Specific monetary amounts (e.g., $10,000)
  - **Text**: Descriptive values (e.g., "Full coverage", "Variable", "Up to $15,000")
- **Bulk Country Selection**: 
  - Copy and paste multiple countries from external sources
  - Supports comma, semicolon, or newline separators
  - Automatic deduplication and validation
  - Available for both eligible nationalities and country residency
- **Comprehensive Form**: Complete scholarship information including eligibility, requirements, and application details

### Program Management
- Full CRUD operations for educational programs
- School linking and program details
- Admission requirements and tuition information

### School Management
- Complete school information management
- Contact details, rankings, and facilities
- International student support information

## Recent Updates

### Scholarship Form Enhancements (Latest)
1. **Flexible Value Field**: 
   - Toggle between number and text input types
   - Currency field automatically disabled for text values
   - Supports scholarships without specific monetary amounts
   
2. **Bulk Country Input**:
   - Textarea for pasting multiple countries at once
   - Automatic parsing of common delimiters (commas, semicolons, newlines)
   - Individual country selection still available
   - Real-time validation and duplicate prevention

3. **Improved User Experience**:
   - Clear visual indicators for input types
   - Helpful placeholder text and descriptions
   - Better form organization and layout

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: MongoDB with Mongoose ODM
- **Form Handling**: React Hook Form
- **Icons**: Lucide React

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run the development server: `npm run dev`

## Database Schema

The scholarship schema has been updated to support flexible value types:
- `value`: Can be either a number or string
- `currency`: Optional field (disabled when value is text)
- Enhanced validation for mixed data types

## Contributing

Please follow the established coding standards and ensure all new features include proper TypeScript types and validation.
