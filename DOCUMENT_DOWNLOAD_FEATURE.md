# Document Download Feature

## Overview

The document download feature allows users to download their documents and library documents in two formats:
- **PDF**: High-quality, print-ready PDF documents
- **Word (DOCX)**: Microsoft Word compatible documents

## Features

### For User Documents
- Download personal documents created by the user
- Available formats: PDF and DOCX
- Includes document metadata (title, type, word count, version, etc.)
- Professional formatting with proper styling

### For Library Documents
- Download documents from the shared library
- Available formats: PDF and DOCX
- Includes additional metadata (author, source, ratings, view count)
- Same professional formatting as user documents

## How to Use

### Downloading User Documents

1. **From Documents Page** (`/documents`):
   - Navigate to your documents page
   - Each document card has two download buttons at the bottom:
     - **PDF**: Downloads the document as a PDF file
     - **Word**: Downloads the document as a DOCX file
   - Click either button to start the download

2. **From Document Dropdown Menu**:
   - Click the three-dot menu (⋮) on any document card
   - Select "Download as PDF" or "Download as Word"
   - The file will be downloaded automatically

### Downloading Library Documents

1. **From Library Page** (`/library`):
   - Browse the document library
   - Click "Preview" on any document
   - In the preview dialog, use the download buttons:
     - **Download PDF**: Downloads as PDF
     - **Download Word**: Downloads as DOCX

## Technical Implementation

### API Endpoints

#### User Documents
```
GET /api/documents/[id]/download?format=pdf|docx
```

#### Library Documents
```
GET /api/library/documents/[id]/download?format=pdf|docx
```

### PDF Generation
- Uses Puppeteer for high-quality PDF generation
- Professional styling with Times New Roman font
- Includes document header with metadata
- Proper page margins and formatting
- Footer with generation timestamp

### DOCX Generation
- Uses PizZip and custom XML templates
- Proper Word document structure
- Includes document metadata
- Maintains formatting and structure
- Compatible with Microsoft Word and other word processors

### File Naming
Documents are automatically named using the pattern:
```
[Document_Title]_[Document_Type].[format]
```

Example: `Personal_Statement_personal_statement.pdf`

## Security Features

- **Authentication Required**: All download endpoints require user authentication
- **Ownership Verification**: Users can only download their own documents
- **Library Access**: Library documents are publicly accessible to authenticated users
- **Input Validation**: Format parameters are validated to prevent injection attacks

## Error Handling

- **Unauthorized Access**: Returns 401 for unauthenticated requests
- **Document Not Found**: Returns 404 for non-existent documents
- **Invalid Format**: Returns 400 for unsupported formats
- **Server Errors**: Returns 500 for internal server errors
- **User Feedback**: Toast notifications for success/error states

## Performance Considerations

- **PDF Generation**: Uses headless Chrome for optimal performance
- **DOCX Generation**: Lightweight XML-based generation
- **File Size**: Optimized for reasonable file sizes
- **Caching**: No caching implemented (documents are generated on-demand)

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Download API**: Uses standard browser download APIs
- **Blob Handling**: Automatic blob creation and cleanup
- **File Naming**: Automatic filename sanitization

## Future Enhancements

Potential improvements for future versions:
- **Template Selection**: Allow users to choose different document templates
- **Custom Styling**: User-configurable document styling
- **Batch Download**: Download multiple documents at once
- **Cloud Storage**: Direct upload to Google Drive, Dropbox, etc.
- **Email Integration**: Send documents directly via email
- **Watermarking**: Add user watermarks to downloaded documents
- **Compression**: Optimize file sizes for large documents

## Troubleshooting

### Common Issues

1. **Download Not Starting**:
   - Check browser popup blockers
   - Ensure JavaScript is enabled
   - Verify network connectivity

2. **File Corrupted**:
   - Try downloading again
   - Check if the document content is valid
   - Verify browser compatibility

3. **Large File Sizes**:
   - PDF files may be large for documents with many pages
   - Consider using DOCX format for editing purposes

4. **Formatting Issues**:
   - DOCX files may have slight formatting differences in different word processors
   - PDF files maintain consistent formatting across all viewers

### Support

For technical issues or feature requests, please contact the development team or create an issue in the project repository.