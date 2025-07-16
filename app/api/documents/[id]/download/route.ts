import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Document from '@/models/Document';
import puppeteer from 'puppeteer';
import PizZip from 'pizzip';
import { DocumentType, DOCUMENT_TYPE_CONFIG } from '@/types/documents';

// GET /api/documents/[id]/download?format=pdf|docx
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log(`[DOWNLOAD] Starting download for document ${id}`);
  
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      console.log('[DOWNLOAD] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    console.log('[DOWNLOAD] Database connected');

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'pdf';
    console.log(`[DOWNLOAD] Requested format: ${format}`);

    // Validate format
    if (!['pdf', 'docx'].includes(format)) {
      console.log(`[DOWNLOAD] Invalid format requested: ${format}`);
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
      console.log(`[DOWNLOAD] Document not found: ${id}`);
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    console.log(`[DOWNLOAD] Document found: ${document.title}`);

    const typeConfig = DOCUMENT_TYPE_CONFIG[document.type as DocumentType];
    const fileName = `${document.title.replace(/[^a-zA-Z0-9]/g, '_')}_${document.type}`;

    if (format === 'pdf') {
      console.log('[DOWNLOAD] Generating PDF...');
      return await generatePDF(document, typeConfig, fileName);
    } else if (format === 'docx') {
      console.log('[DOWNLOAD] Generating DOCX...');
      return await generateDOCX(document, typeConfig, fileName);
    }

  } catch (error) {
    console.error('[DOWNLOAD] Error downloading document:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function generatePDF(document: any, typeConfig: any, fileName: string) {
  let browser;
  try {
    console.log('[PDF] Launching browser...');
    
    // Launch browser with better configuration for server environments
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ],
      timeout: 30000,
      // Ensure we use the installed Chrome browser
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
    });

    console.log('[PDF] Browser launched successfully');

    const page = await browser.newPage();
    console.log('[PDF] New page created');

    // Set viewport
    await page.setViewport({ width: 1200, height: 800 });

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

    console.log('[PDF] Setting HTML content...');
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    console.log('[PDF] HTML content set successfully');
    
    // Wait a bit for content to render
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate PDF
    console.log('[PDF] Generating PDF buffer...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '2cm',
        right: '2cm',
        bottom: '2cm',
        left: '2cm'
      },
      printBackground: true,
      preferCSSPageSize: true
    });

    console.log(`[PDF] PDF generated successfully, size: ${pdfBuffer.length} bytes`);

    // Return PDF response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('[PDF] Error generating PDF:', error);
    
    // Check if it's a Chrome installation error
    if (error instanceof Error && error.message.includes('Could not find Chrome')) {
      console.error('[PDF] Chrome installation error detected. Please run: npx puppeteer browsers install chrome');
      throw new Error('Chrome browser not found. Please ensure Chrome is installed for Puppeteer. Run: npx puppeteer browsers install chrome');
    }
    
    throw error;
  } finally {
    if (browser) {
      console.log('[PDF] Closing browser...');
      await browser.close();
      console.log('[PDF] Browser closed');
    }
  }
}

async function generateDOCX(document: any, typeConfig: any, fileName: string) {
  try {
    // Create a proper DOCX template with complete structure
    const docxTemplate = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
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
        <w:rPr>
          <w:b/>
          <w:sz w:val="36"/>
          <w:szCs w:val="36"/>
        </w:rPr>
        <w:t>${document.title}</w:t>
      </w:r>
    </w:p>
    
    <!-- Subtitle -->
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:spacing w:after="240"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:i/>
          <w:sz w:val="28"/>
          <w:szCs w:val="28"/>
        </w:rPr>
        <w:t>${typeConfig?.label || document.type}</w:t>
      </w:r>
    </w:p>
    
    <!-- Metadata -->
    <w:p>
      <w:pPr>
        <w:spacing w:after="120"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
        <w:t>Word Count: ${document.wordCount || 0} | Character Count: ${document.characterCount || 0}</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:pPr>
        <w:spacing w:after="120"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
        <w:t>Version: ${document.version} | Last Edited: ${new Date(document.lastEditedAt).toLocaleDateString()}</w:t>
      </w:r>
    </w:p>
    
    ${document.targetProgram ? `
    <w:p>
      <w:pPr>
        <w:spacing w:after="120"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
        <w:t>Target Program: ${document.targetProgram}</w:t>
      </w:r>
    </w:p>
    ` : ''}
    
    ${document.targetScholarship ? `
    <w:p>
      <w:pPr>
        <w:spacing w:after="120"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
        <w:t>Target Scholarship: ${document.targetScholarship}</w:t>
      </w:r>
    </w:p>
    ` : ''}
    
    ${document.targetInstitution ? `
    <w:p>
      <w:pPr>
        <w:spacing w:after="120"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
        <w:t>Target Institution: ${document.targetInstitution}</w:t>
      </w:r>
    </w:p>
    ` : ''}
    
    ${document.description ? `
    <w:p>
      <w:pPr>
        <w:spacing w:after="240"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
        <w:t>${document.description}</w:t>
      </w:r>
    </w:p>
    ` : ''}
    
    <!-- Content -->
    ${document.content.split('\n').map((paragraph: string) => `
    <w:p>
      <w:pPr>
        <w:spacing w:after="120"/>
        <w:spacing w:line="276" w:lineRule="auto"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:sz w:val="24"/>
          <w:szCs w:val="24"/>
        </w:rPr>
        <w:t>${paragraph || ' '}</w:t>
      </w:r>
    </w:p>
    `).join('')}
    
    <!-- Footer -->
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:spacing w:before="480"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
          <w:i/>
        </w:rPr>
        <w:t>Generated by Eddura Platform on ${new Date().toLocaleDateString()}</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;

    const zip = new PizZip();
    
    // Create DOCX structure with all required files
    zip.file('word/document.xml', docxTemplate);
    
    // Content Types
    zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);
    
    // Relationships
    zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);
    
    zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`);

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