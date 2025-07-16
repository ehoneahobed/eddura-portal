import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Document from '@/models/Document';
import PizZip from 'pizzip';
import { DocumentType, DOCUMENT_TYPE_CONFIG } from '@/types/documents';
import jsPDF from 'jspdf';

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
  try {
    console.log('[PDF] Generating PDF with jsPDF...');
    
    // Create a new PDF document
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Set margins
    const margin = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - (margin * 2);
    
    let yPosition = margin;
    
    // Helper function to add text with word wrapping
    const addWrappedText = (text: string, fontSize: number, y: number, maxWidth: number = contentWidth) => {
      pdf.setFontSize(fontSize);
      const lines = pdf.splitTextToSize(text, maxWidth);
      pdf.text(lines, margin, y);
      return y + (lines.length * fontSize * 0.4); // Approximate line height
    };
    
    // Helper function to add a line
    const addLine = (y: number) => {
      pdf.line(margin, y, pageWidth - margin, y);
      return y + 5;
    };
    
    // Title
    pdf.setFont('helvetica', 'bold');
    yPosition = addWrappedText(document.title, 18, yPosition);
    yPosition += 10;
    
    // Subtitle
    pdf.setFont('helvetica', 'normal');
    yPosition = addWrappedText(typeConfig?.label || document.type, 14, yPosition);
    yPosition += 15;
    
    // Separator line
    yPosition = addLine(yPosition);
    yPosition += 10;
    
    // Metadata
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    
    if (document.description) {
      yPosition = addWrappedText(`Description: ${document.description}`, 10, yPosition);
      yPosition += 5;
    }
    
    yPosition = addWrappedText(`Word Count: ${document.wordCount || 0} | Character Count: ${document.characterCount || 0}`, 10, yPosition);
    yPosition += 5;
    
    yPosition = addWrappedText(`Version: ${document.version} | Last Edited: ${new Date(document.lastEditedAt).toLocaleDateString()}`, 10, yPosition);
    yPosition += 5;
    
    if (document.targetProgram) {
      yPosition = addWrappedText(`Target Program: ${document.targetProgram}`, 10, yPosition);
      yPosition += 5;
    }
    
    if (document.targetScholarship) {
      yPosition = addWrappedText(`Target Scholarship: ${document.targetScholarship}`, 10, yPosition);
      yPosition += 5;
    }
    
    if (document.targetInstitution) {
      yPosition = addWrappedText(`Target Institution: ${document.targetInstitution}`, 10, yPosition);
      yPosition += 5;
    }
    
    // Tags
    if (document.tags && document.tags.length > 0) {
      yPosition += 5;
      const tagsText = `Tags: ${document.tags.join(', ')}`;
      yPosition = addWrappedText(tagsText, 10, yPosition);
      yPosition += 10;
    }
    
    // Reset text color
    pdf.setTextColor(0, 0, 0);
    
    // Separator line
    yPosition = addLine(yPosition);
    yPosition += 10;
    
    // Content
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    
    // Split content into paragraphs and add them
    const paragraphs = document.content.split('\n\n').filter((p: string) => p.trim());
    
    for (const paragraph of paragraphs) {
      // Check if we need a new page
      if (yPosition > pageHeight - margin - 30) {
        pdf.addPage();
        yPosition = margin;
      }
      
      yPosition = addWrappedText(paragraph.trim(), 12, yPosition);
      yPosition += 8; // Space between paragraphs
    }
    
    // Footer
    const totalPages = (pdf as any).getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated by Eddura Platform on ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }
    
    console.log('[PDF] PDF generated successfully with jsPDF');
    
    // Get PDF as buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
    
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
    console.error('[PDF] Error generating PDF with jsPDF:', error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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