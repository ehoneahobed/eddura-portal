import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Document from '@/models/Document';
import puppeteer from 'puppeteer';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { DocumentType, DOCUMENT_TYPE_CONFIG } from '@/types/documents';

// GET /api/documents/[id]/download?format=pdf|docx
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'pdf';

    // Validate format
    if (!['pdf', 'docx'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Supported formats: pdf, docx' },
        { status: 400 }
      );
    }

    // Find document and verify ownership
    const document = await Document.findOne({
      _id: id,
      userId: session.user.id
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const typeConfig = DOCUMENT_TYPE_CONFIG[document.type as DocumentType];
    const fileName = `${document.title.replace(/[^a-zA-Z0-9]/g, '_')}_${document.type}`;

    if (format === 'pdf') {
      return await generatePDF(document, typeConfig, fileName);
    } else if (format === 'docx') {
      return await generateDOCX(document, typeConfig, fileName);
    }

  } catch (error) {
    console.error('Error downloading document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generatePDF(document: any, typeConfig: any, fileName: string) {
  try {
    // Launch browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Create HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${document.title}</title>
          <style>
            body {
              font-family: 'Times New Roman', serif;
              line-height: 1.6;
              margin: 2cm;
              font-size: 12pt;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 2em;
              border-bottom: 2px solid #333;
              padding-bottom: 1em;
            }
            .title {
              font-size: 18pt;
              font-weight: bold;
              margin-bottom: 0.5em;
            }
            .subtitle {
              font-size: 14pt;
              color: #666;
              margin-bottom: 0.5em;
            }
            .metadata {
              font-size: 10pt;
              color: #888;
              margin-bottom: 2em;
            }
            .content {
              text-align: justify;
              white-space: pre-wrap;
            }
            .footer {
              margin-top: 2em;
              padding-top: 1em;
              border-top: 1px solid #ccc;
              font-size: 10pt;
              color: #666;
              text-align: center;
            }
            .tags {
              margin: 1em 0;
              font-size: 10pt;
            }
            .tag {
              display: inline-block;
              background: #f0f0f0;
              padding: 2px 8px;
              margin: 2px;
              border-radius: 3px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${document.title}</div>
            <div class="subtitle">${typeConfig?.label || document.type}</div>
            <div class="metadata">
              ${document.description ? `<div>${document.description}</div>` : ''}
              <div>Word Count: ${document.wordCount || 0} | Character Count: ${document.characterCount || 0}</div>
              <div>Version: ${document.version} | Last Edited: ${new Date(document.lastEditedAt).toLocaleDateString()}</div>
              ${document.targetProgram ? `<div>Target Program: ${document.targetProgram}</div>` : ''}
              ${document.targetScholarship ? `<div>Target Scholarship: ${document.targetScholarship}</div>` : ''}
              ${document.targetInstitution ? `<div>Target Institution: ${document.targetInstitution}</div>` : ''}
            </div>
            ${document.tags && document.tags.length > 0 ? `
              <div class="tags">
                ${document.tags.map((tag: string) => `<span class="tag">${tag}</span>`).join('')}
              </div>
            ` : ''}
          </div>
          <div class="content">${document.content}</div>
          <div class="footer">
            Generated by Eddura Platform on ${new Date().toLocaleDateString()}
          </div>
        </body>
      </html>
    `;

    await page.setContent(htmlContent);
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '2cm',
        right: '2cm',
        bottom: '2cm',
        left: '2cm'
      },
      printBackground: true
    });

    await browser.close();

    // Return PDF response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}.pdf"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

async function generateDOCX(document: any, typeConfig: any, fileName: string) {
  try {
    // Create a proper DOCX template with better structure
    const docxTemplate = `
      <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <!-- Title -->
          <w:p>
            <w:pPr>
              <w:pStyle w:val="Title"/>
              <w:jc w:val="center"/>
              <w:spacing w:after="240"/>
            </w:pPr>
            <w:r>
              <w:t>${document.title}</w:t>
            </w:r>
          </w:p>
          
          <!-- Subtitle -->
          <w:p>
            <w:pPr>
              <w:pStyle w:val="Subtitle"/>
              <w:jc w:val="center"/>
              <w:spacing w:after="240"/>
            </w:pPr>
            <w:r>
              <w:t>${typeConfig?.label || document.type}</w:t>
            </w:r>
          </w:p>
          
          <!-- Metadata -->
          <w:p>
            <w:pPr>
              <w:pStyle w:val="Normal"/>
              <w:spacing w:after="120"/>
            </w:pPr>
            <w:r>
              <w:t>Word Count: ${document.wordCount || 0} | Character Count: ${document.characterCount || 0}</w:t>
            </w:r>
          </w:p>
          
          <w:p>
            <w:pPr>
              <w:pStyle w:val="Normal"/>
              <w:spacing w:after="120"/>
            </w:pPr>
            <w:r>
              <w:t>Version: ${document.version} | Last Edited: ${new Date(document.lastEditedAt).toLocaleDateString()}</w:t>
            </w:r>
          </w:p>
          
          ${document.targetProgram ? `
            <w:p>
              <w:pPr>
                <w:pStyle w:val="Normal"/>
                <w:spacing w:after="120"/>
              </w:pPr>
              <w:r>
                <w:t>Target Program: ${document.targetProgram}</w:t>
              </w:r>
            </w:p>
          ` : ''}
          
          ${document.targetScholarship ? `
            <w:p>
              <w:pPr>
                <w:pStyle w:val="Normal"/>
                <w:spacing w:after="120"/>
              </w:pPr>
              <w:r>
                <w:t>Target Scholarship: ${document.targetScholarship}</w:t>
              </w:r>
            </w:p>
          ` : ''}
          
          ${document.targetInstitution ? `
            <w:p>
              <w:pPr>
                <w:pStyle w:val="Normal"/>
                <w:spacing w:after="120"/>
              </w:pPr>
              <w:r>
                <w:t>Target Institution: ${document.targetInstitution}</w:t>
              </w:r>
            </w:p>
          ` : ''}
          
          ${document.description ? `
            <w:p>
              <w:pPr>
                <w:pStyle w:val="Normal"/>
                <w:spacing w:after="240"/>
              </w:pPr>
              <w:r>
                <w:t>${document.description}</w:t>
              </w:r>
            </w:p>
          ` : ''}
          
          <!-- Content -->
          <w:p>
            <w:pPr>
              <w:pStyle w:val="Normal"/>
              <w:spacing w:after="240"/>
            </w:pPr>
            <w:r>
              <w:t>${document.content.replace(/\n/g, '</w:t></w:r></w:p><w:p><w:pPr><w:pStyle w:val="Normal"/></w:pPr><w:r><w:t>')}</w:t>
            </w:r>
          </w:p>
          
          <!-- Footer -->
          <w:p>
            <w:pPr>
              <w:pStyle w:val="Normal"/>
              <w:jc w:val="center"/>
              <w:spacing w:before="480"/>
            </w:pPr>
            <w:r>
              <w:t>Generated by Eddura Platform on ${new Date().toLocaleDateString()}</w:t>
            </w:r>
          </w:p>
        </w:body>
      </w:document>
    `;

    const zip = new PizZip();
    
    // Create DOCX structure
    zip.file('word/document.xml', docxTemplate);
    
    // Content Types
    zip.file('[Content_Types].xml', `
      <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
        <Default Extension="xml" ContentType="application/xml"/>
        <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
        <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
      </Types>
    `);
    
    // Relationships
    zip.file('_rels/.rels', `
      <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
      </Relationships>
    `);
    
    zip.file('word/_rels/document.xml.rels', `
      <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      </Relationships>
    `);

    const docxBuffer = zip.generate({ type: 'nodebuffer' });

    return new NextResponse(docxBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileName}.docx"`,
        'Content-Length': docxBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error('Error generating DOCX:', error);
    throw error;
  }
}