import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Application, { IApplication } from '@/models/Application';
import { IScholarship } from '@/models/Scholarship';
import { IApplicationTemplate } from '@/models/ApplicationTemplate';
import jsPDF from 'jspdf';

// Type for populated application
interface PopulatedApplication extends Omit<IApplication, 'scholarshipId' | 'applicationTemplateId'> {
  scholarshipId: IScholarship;
  applicationTemplateId: IApplicationTemplate;
  sections: Array<{
    sectionId: string;
    responses: Array<{
      questionId: string;
      value: any;
      files?: string[];
    }>;
  }>;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const resolvedParams = await params;

    const application = await Application.findOne({
      _id: resolvedParams.id,
      userId: session.user.id,
      isActive: true
    })
    .populate('scholarshipId', 'title value currency deadline')
    .populate('applicationTemplateId', 'title sections estimatedTime instructions') as PopulatedApplication | null;

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }



    // Generate PDF using jsPDF
    const pdfBuffer = await generatePDF(application);

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="application-${application.scholarshipId.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf"`
      }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function generatePDF(application: PopulatedApplication): Promise<Buffer> {
  try {
    console.log('[PDF] Creating application PDF document...');
    
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
    const title = `Application: ${application.scholarshipId.title}`;
    const titleLines = pdf.splitTextToSize(title, contentWidth);
    pdf.text(titleLines, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += (titleLines.length * 8) + 10;
    
    // Add subtitle
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    const subtitle = application.applicationTemplateId.title;
    const subtitleLines = pdf.splitTextToSize(subtitle, contentWidth);
    pdf.text(subtitleLines, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += (subtitleLines.length * 6) + 15;
    
    // Add separator line
    pdf.setDrawColor(100, 100, 100);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;
    
    // Add scholarship information
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Scholarship Information:', margin, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const scholarshipInfo = [
      `Title: ${application.scholarshipId.title}`,
      `Value: ${application.scholarshipId.value} ${application.scholarshipId.currency}`,
      `Deadline: ${application.scholarshipId.deadline ? new Date(application.scholarshipId.deadline).toLocaleDateString() : 'N/A'}`,
      `Status: ${application.status}`,
      `Submitted: ${application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : 'N/A'}`
    ];
    
    for (const info of scholarshipInfo) {
      const infoLines = pdf.splitTextToSize(info, contentWidth);
      for (const line of infoLines) {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += 5;
      }
      yPosition += 2;
    }
    
    yPosition += 10;
    
    // Add application responses
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Application Responses:', margin, yPosition);
    yPosition += 8;
    
    // Process each section
    for (const section of application.applicationTemplateId.sections) {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }
      
      // Section title
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      const sectionTitle = section.title;
      const sectionTitleLines = pdf.splitTextToSize(sectionTitle, contentWidth);
      for (const line of sectionTitleLines) {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += 6;
      }
      
      // Section description
      if (section.description) {
        yPosition += 2;
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'italic');
        const descLines = pdf.splitTextToSize(section.description, contentWidth);
        for (const line of descLines) {
          if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin + 5, yPosition);
          yPosition += 4;
        }
      }
      
      yPosition += 5;
      
      // Process questions in this section
      for (const question of section.questions) {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = margin;
        }
        
        // Question title
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        const questionTitle = `${question.title}${question.required ? ' *' : ''}`;
        const questionTitleLines = pdf.splitTextToSize(questionTitle, contentWidth);
        for (const line of questionTitleLines) {
          if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin + 5, yPosition);
          yPosition += 5;
        }
        
        // Question description
        if (question.description) {
          yPosition += 2;
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'italic');
          const questionDescLines = pdf.splitTextToSize(question.description, contentWidth - 10);
          for (const line of questionDescLines) {
            if (yPosition > pageHeight - 40) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(line, margin + 10, yPosition);
            yPosition += 4;
          }
        }
        
        // Answer
        yPosition += 3;
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        
        // Find the section response
        const sectionResponse = application.sections.find(s => s.sectionId === section.id);
        const response = sectionResponse?.responses.find(r => r.questionId === question.id);
        const answerText = response ? formatResponseValue(response.value, question.type) : 'Not answered';
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('Answer:', margin + 5, yPosition);
        yPosition += 4;
        
        pdf.setFont('helvetica', 'normal');
        const answerLines = pdf.splitTextToSize(answerText, contentWidth - 10);
        for (const line of answerLines) {
          if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin + 10, yPosition);
          yPosition += 4;
        }
        
        // Files if any
        if (response?.files && response.files.length > 0) {
          yPosition += 3;
          pdf.setFont('helvetica', 'bold');
          pdf.text('Attached Files:', margin + 5, yPosition);
          yPosition += 4;
          
          pdf.setFont('helvetica', 'normal');
          for (const file of response.files) {
            const fileName = file.split('/').pop() || file;
            const fileLines = pdf.splitTextToSize(`- ${fileName}`, contentWidth - 10);
            for (const line of fileLines) {
              if (yPosition > pageHeight - 40) {
                pdf.addPage();
                yPosition = margin;
              }
              pdf.text(line, margin + 10, yPosition);
              yPosition += 4;
            }
          }
        }
        
        yPosition += 8;
      }
      
      yPosition += 5;
    }
    
    // Add footer
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Powered by Eddura on ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
    }
    
    console.log(`[PDF] Application PDF generated successfully`);
    
    // Get PDF as buffer
    return Buffer.from(pdf.output('arraybuffer'));
    
  } catch (error) {
    console.error('Error generating application PDF:', error);
    throw error;
  }
}

function formatResponseValue(value: any, type: string): string {
  if (!value) return 'Not answered';
  
  switch (type) {
    case 'text':
    case 'textarea':
    case 'email':
    case 'url':
      return String(value);
    case 'number':
      return String(value);
    case 'date':
      return new Date(value).toLocaleDateString();
    case 'select':
    case 'radio':
      return Array.isArray(value) ? value.join(', ') : String(value);
    case 'checkbox':
      return Array.isArray(value) ? value.join(', ') : String(value);
    case 'file':
      return Array.isArray(value) ? value.join(', ') : String(value);
    default:
      return String(value);
  }
}