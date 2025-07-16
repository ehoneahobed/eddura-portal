import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Document from '@/models/Document';
import jsPDF from 'jspdf';
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
  try {
    console.log('[PDF] Creating PDF document...');
    
    // Create new PDF document
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Set font
    pdf.setFont('helvetica');
    
    // Page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);
    
    let yPosition = margin;
    
    // Add title
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    const titleLines = pdf.splitTextToSize(document.title, contentWidth);
    pdf.text(titleLines, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += (titleLines.length * 8) + 10;
    
    // Add subtitle (document type)
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    const subtitle = typeConfig?.label || document.type;
    const subtitleLines = pdf.splitTextToSize(subtitle, contentWidth);
    pdf.text(subtitleLines, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += (subtitleLines.length * 6) + 15;
    
    // Add separator line
    pdf.setDrawColor(100, 100, 100);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;
    
    // Add metadata
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const metadata = [];
    if (document.description) {
      metadata.push(document.description);
    }
    metadata.push(`Word Count: ${document.wordCount || 0} | Character Count: ${document.characterCount || 0}`);
    metadata.push(`Version: ${document.version} | Last Edited: ${new Date(document.lastEditedAt).toLocaleDateString()}`);
    
    if (document.targetProgram) {
      metadata.push(`Target Program: ${document.targetProgram}`);
    }
    if (document.targetScholarship) {
      metadata.push(`Target Scholarship: ${document.targetScholarship}`);
    }
    if (document.targetInstitution) {
      metadata.push(`Target Institution: ${document.targetInstitution}`);
    }
    
    // Add metadata lines
    for (const metaLine of metadata) {
      const metaLines = pdf.splitTextToSize(metaLine, contentWidth);
      for (const line of metaLines) {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += 5;
      }
      yPosition += 2;
    }
    
    // Add tags if they exist
    if (document.tags && document.tags.length > 0) {
      yPosition += 5;
      const tagsText = `Tags: ${document.tags.join(', ')}`;
      const tagLines = pdf.splitTextToSize(tagsText, contentWidth);
      for (const line of tagLines) {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += 5;
      }
    }
    
    yPosition += 15;
    
    // Add content
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    const contentLines = pdf.splitTextToSize(document.content, contentWidth);
    
    for (const line of contentLines) {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += 6;
    }
    
    // Add footer
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Powered by Eddura Platform on ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
    }
    
    console.log(`[PDF] PDF generated successfully`);
    
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
    console.error('[PDF] Error generating PDF:', error);
    throw error;
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
        <w:t>Powered by Eddura Platform on ${new Date().toLocaleDateString()}</w:t>
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