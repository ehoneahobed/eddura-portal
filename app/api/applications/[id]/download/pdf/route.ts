import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Application, { IApplication } from '@/models/Application';
import { IScholarship } from '@/models/Scholarship';
import { IApplicationTemplate } from '@/models/ApplicationTemplate';
import puppeteer from 'puppeteer';

// Type for populated application
interface PopulatedApplication extends Omit<IApplication, 'scholarshipId' | 'applicationTemplateId'> {
  scholarshipId: IScholarship;
  applicationTemplateId: IApplicationTemplate;
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

    // Generate HTML content for the PDF
    const htmlContent = generatePDFHTML(application);

    // Launch puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '1in',
        right: '1in',
        bottom: '1in',
        left: '1in'
      },
      printBackground: true
    });

    await browser.close();

    // Return PDF as response
    return new NextResponse(pdf, {
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

function generatePDFHTML(application: PopulatedApplication): string {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number | string, currency: string = 'USD') => {
    if (typeof value === 'string') {
      return value; // Return as-is if it's already a string
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getQuestionResponse = (sectionId: string, questionId: string) => {
    const section = application.sections.find((s: any) => s.sectionId === sectionId);
    if (!section) return null;
    
    const response = section.responses.find((r: any) => r.questionId === questionId);
    return response;
  };

  const formatResponseValue = (value: any, questionType: string) => {
    if (value === null || value === undefined || value === '') {
      return 'Not provided';
    }

    switch (questionType) {
      case 'date':
        return formatDate(value);
      case 'checkbox':
      case 'multiselect':
        return Array.isArray(value) ? value.join(', ') : value;
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'number':
        return value.toString();
      case 'file':
        return Array.isArray(value) ? value.join(', ') : value;
      default:
        return value.toString();
    }
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Application - ${application.scholarshipId.title}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .title {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .subtitle {
          font-size: 16px;
          color: #666;
        }
        .overview {
          background-color: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .overview-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
        }
        .overview-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .overview-label {
          font-weight: bold;
          color: #666;
        }
        .section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        .section-title {
          font-size: 20px;
          font-weight: bold;
          color: #2563eb;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .question {
          margin-bottom: 20px;
          page-break-inside: avoid;
        }
        .question-title {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .question-description {
          font-size: 14px;
          color: #666;
          margin-bottom: 10px;
        }
        .answer {
          background-color: #f9fafb;
          padding: 15px;
          border-radius: 6px;
          border-left: 4px solid #2563eb;
        }
        .answer-label {
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
          text-transform: uppercase;
          font-weight: bold;
        }
        .files {
          margin-top: 10px;
          font-size: 14px;
        }
        .file-link {
          color: #2563eb;
          text-decoration: none;
        }
        .required {
          color: #dc2626;
        }
        @media print {
          body { margin: 0; }
          .section { page-break-inside: avoid; }
          .question { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">EDDURA</div>
        <div class="title">Scholarship Application</div>
        <div class="subtitle">${application.scholarshipId.title}</div>
      </div>

      <div class="overview">
        <h2 style="margin-top: 0; color: #2563eb;">Application Overview</h2>
        <div class="overview-grid">
          <div class="overview-item">
            <span class="overview-label">Scholarship:</span>
            <span>${application.scholarshipId.title}</span>
          </div>
          <div class="overview-item">
            <span class="overview-label">Amount:</span>
            <span>${application.scholarshipId.value ? formatCurrency(application.scholarshipId.value, application.scholarshipId.currency) : 'Not specified'}</span>
          </div>
          <div class="overview-item">
            <span class="overview-label">Deadline:</span>
            <span>${formatDate(application.scholarshipId.deadline)}</span>
          </div>
          <div class="overview-item">
            <span class="overview-label">Status:</span>
            <span>${application.status.charAt(0).toUpperCase() + application.status.slice(1).replace('_', ' ')}</span>
          </div>
          <div class="overview-item">
            <span class="overview-label">Started:</span>
            <span>${formatDate(application.startedAt.toISOString())}</span>
          </div>
          <div class="overview-item">
            <span class="overview-label">Submitted:</span>
            <span>${application.submittedAt ? formatDateTime(application.submittedAt.toISOString()) : 'Not submitted'}</span>
          </div>
        </div>
      </div>

      ${application.applicationTemplateId.sections.map((section: any) => `
        <div class="section">
          <div class="section-title">${section.title}</div>
          ${section.description ? `<p style="color: #666; margin-bottom: 20px;">${section.description}</p>` : ''}
          
          ${section.questions.map((question: any) => {
            const response = getQuestionResponse(section.id, question.id);
            const responseValue = response ? formatResponseValue(response.value, question.type) : 'Not answered';
            
            return `
              <div class="question">
                <div class="question-title">
                  ${question.title}
                  ${question.required ? '<span class="required">*</span>' : ''}
                </div>
                ${question.description ? `<div class="question-description">${question.description}</div>` : ''}
                <div class="answer">
                  <div class="answer-label">Your Answer:</div>
                  <div>${responseValue}</div>
                  ${response?.files && response.files.length > 0 ? `
                    <div class="files">
                      <div class="answer-label">Attached Files:</div>
                      ${response.files.map((file: string) => `
                        <div><a href="${file}" class="file-link">${file.split('/').pop()}</a></div>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `).join('')}

      <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
        <p>Generated by Eddura on ${new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
      </div>
    </body>
    </html>
  `;
}