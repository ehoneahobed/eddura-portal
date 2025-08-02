import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Application, { IApplication } from '@/models/Application';
import { IScholarship } from '@/models/Scholarship';
import { IApplicationTemplate } from '@/models/ApplicationTemplate';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

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
      timestamp: Date;
      isComplete: boolean;
    }>;
    isComplete: boolean;
    startedAt: Date;
    completedAt?: Date;
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

    // Generate Word document content
    const docxContent = generateWordDocument(application);

    // Return Word document as response
    return new NextResponse(docxContent, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="application-${application.scholarshipId.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.docx"`
      }
    });

  } catch (error) {
    console.error('Error generating Word document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateWordDocument(application: PopulatedApplication): Buffer {
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
    const section = application.sections.find(s => s.sectionId === sectionId);
    if (!section) return null;
    
    const response = section.responses.find(r => r.questionId === questionId);
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

  // Create a simple Word document template
  const template = `
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:body>
        <w:p>
          <w:pPr>
            <w:pStyle w:val="Heading1"/>
            <w:jc w:val="center"/>
          </w:pPr>
          <w:r>
            <w:t>EDDURA</w:t>
          </w:r>
        </w:p>
        
        <w:p>
          <w:pPr>
            <w:pStyle w:val="Heading2"/>
            <w:jc w:val="center"/>
          </w:pPr>
          <w:r>
            <w:t>Scholarship Application</w:t>
          </w:r>
        </w:p>
        
        <w:p>
          <w:pPr>
            <w:pStyle w:val="Heading3"/>
            <w:jc w:val="center"/>
          </w:pPr>
          <w:r>
            <w:t>${application.scholarshipId.title}</w:t>
          </w:r>
        </w:p>
        
        <w:p>
          <w:r>
            <w:t>Application Overview</w:t>
          </w:r>
        </w:p>
        
        <w:tbl>
          <w:tblPr>
            <w:tblStyle w:val="TableGrid"/>
          </w:tblPr>
          <w:tblGrid>
            <w:gridCol w:w="2000"/>
            <w:gridCol w:w="4000"/>
          </w:tblGrid>
          <w:tr>
            <w:tc>
              <w:p>
                <w:r>
                  <w:t>Scholarship:</w:t>
                </w:r>
              </w:p>
            </w:tc>
            <w:tc>
              <w:p>
                <w:r>
                  <w:t>${application.scholarshipId.title}</w:t>
                </w:r>
              </w:p>
            </w:tc>
          </w:tr>
          <w:tr>
            <w:tc>
              <w:p>
                <w:r>
                  <w:t>Amount:</w:t>
                </w:r>
              </w:p>
            </w:tc>
            <w:tc>
              <w:p>
                <w:r>
                  <w:t>${application.scholarshipId.value ? formatCurrency(application.scholarshipId.value, application.scholarshipId.currency) : 'Not specified'}</w:t>
                </w:r>
              </w:p>
            </w:tc>
          </w:tr>
          <w:tr>
            <w:tc>
              <w:p>
                <w:r>
                  <w:t>Deadline:</w:t>
                </w:r>
              </w:p>
            </w:tc>
            <w:tc>
              <w:p>
                <w:r>
                  <w:t>${formatDate(application.scholarshipId.deadline)}</w:t>
                </w:r>
              </w:p>
            </w:tc>
          </w:tr>
          <w:tr>
            <w:tc>
              <w:p>
                <w:r>
                  <w:t>Status:</w:t>
                </w:r>
              </w:p>
            </w:tc>
            <w:tc>
              <w:p>
                <w:r>
                  <w:t>${application.status.charAt(0).toUpperCase() + application.status.slice(1).replace('_', ' ')}</w:t>
                </w:r>
              </w:p>
            </w:tc>
          </w:tr>
          <w:tr>
            <w:tc>
              <w:p>
                <w:r>
                  <w:t>Started:</w:t>
                </w:r>
              </w:p>
            </w:tc>
            <w:tc>
              <w:p>
                <w:r>
                  <w:t>${formatDate(application.startedAt.toISOString())}</w:t>
                </w:r>
              </w:p>
            </w:tc>
          </w:tr>
          <w:tr>
            <w:tc>
              <w:p>
                <w:r>
                  <w:t>Submitted:</w:t>
                </w:r>
              </w:p>
            </w:tc>
            <w:tc>
              <w:p>
                <w:r>
                  <w:t>${application.submittedAt ? formatDateTime(application.submittedAt.toISOString()) : 'Not submitted'}</w:t>
                </w:r>
              </w:p>
            </w:tc>
          </w:tr>
        </w:tbl>
        
        ${application.applicationTemplateId.sections.map((section: any) => `
          <w:p>
            <w:pPr>
              <w:pStyle w:val="Heading2"/>
            </w:pPr>
            <w:r>
              <w:t>${section.title}</w:t>
            </w:r>
          </w:p>
          
          ${section.description ? `
            <w:p>
              <w:r>
                <w:t>${section.description}</w:t>
              </w:r>
            </w:p>
          ` : ''}
          
          ${section.questions.map((question: any) => {
            const response = getQuestionResponse(section.id, question.id);
            const responseValue = response ? formatResponseValue(response.value, question.type) : 'Not answered';
            
            return `
              <w:p>
                <w:pPr>
                  <w:pStyle w:val="Heading3"/>
                </w:pPr>
                <w:r>
                  <w:t>${question.title}${question.required ? ' *' : ''}</w:t>
                </w:r>
              </w:p>
              
              ${question.description ? `
                <w:p>
                  <w:r>
                    <w:t>${question.description}</w:t>
                  </w:r>
                </w:p>
              ` : ''}
              
              <w:p>
                <w:r>
                  <w:t><strong>Your Answer:</strong></w:t>
                </w:r>
              </w:p>
              
              <w:p>
                <w:r>
                  <w:t>${responseValue}</w:t>
                </w:r>
              </w:p>
              
              ${response?.files && response.files.length > 0 ? `
                <w:p>
                  <w:r>
                    <w:t><strong>Attached Files:</strong></w:t>
                  </w:r>
                </w:p>
                ${response.files.map((file: string) => `
                  <w:p>
                    <w:r>
                      <w:t>${file.split('/').pop()}</w:t>
                    </w:r>
                  </w:p>
                `).join('')}
              ` : ''}
            `;
          }).join('')}
        `).join('')}
        
        <w:p>
          <w:r>
            <w:t>Powered by Eddura on ${new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</w:t>
          </w:r>
        </w:p>
      </w:body>
    </w:document>
  `;

  // Create a proper Word document using docxtemplater
  const zip = new PizZip();
  
  // Create a basic Word document structure with proper XML
  const wordDocumentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading1"/>
        <w:jc w:val="center"/>
      </w:pPr>
      <w:r>
        <w:t>EDDURA</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading2"/>
        <w:jc w:val="center"/>
      </w:pPr>
      <w:r>
        <w:t>Scholarship Application</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading3"/>
        <w:jc w:val="center"/>
      </w:pPr>
      <w:r>
        <w:t>${application.scholarshipId?.title || 'Unknown Scholarship'}</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:r>
        <w:t>Application Overview</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:r>
        <w:t>Scholarship: ${application.scholarshipId?.title || 'N/A'}</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:r>
        <w:t>Amount: ${application.scholarshipId?.value ? formatCurrency(application.scholarshipId.value, application.scholarshipId.currency) : 'Not specified'}</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:r>
        <w:t>Deadline: ${application.scholarshipId?.deadline ? formatDate(application.scholarshipId.deadline) : 'N/A'}</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:r>
        <w:t>Status: ${application.status ? application.status.charAt(0).toUpperCase() + application.status.slice(1).replace('_', ' ') : 'N/A'}</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:r>
        <w:t>Started: ${application.startedAt ? formatDate(application.startedAt.toISOString()) : 'N/A'}</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:r>
        <w:t>Submitted: ${application.submittedAt ? formatDateTime(application.submittedAt.toISOString()) : 'Not submitted'}</w:t>
      </w:r>
    </w:p>
    
    ${application.applicationTemplateId?.sections?.map((section: any) => `
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading3"/>
      </w:pPr>
      <w:r>
        <w:t>${section.title || 'Untitled Section'}</w:t>
      </w:r>
    </w:p>
    
    ${section.description ? `
    <w:p>
      <w:r>
        <w:t>${section.description}</w:t>
      </w:r>
    </w:p>
    ` : ''}
    
    ${section.questions?.map((question: any) => {
      const response = getQuestionResponse(section.id, question.id);
      const responseValue = response ? formatResponseValue(response.value, question.type) : 'Not answered';
      
      return `
      <w:p>
        <w:r>
          <w:t><strong>${question.title}${question.required ? ' *' : ''}</strong></w:t>
        </w:r>
      </w:p>
      
      ${question.description ? `
      <w:p>
        <w:r>
          <w:t>${question.description}</w:t>
        </w:r>
      </w:p>
      ` : ''}
      
      <w:p>
        <w:r>
          <w:t><strong>Your Answer:</strong></w:t>
        </w:r>
      </w:p>
      
      <w:p>
        <w:r>
          <w:t>${responseValue}</w:t>
        </w:r>
      </w:p>
      
      ${response?.files && response.files.length > 0 ? `
      <w:p>
        <w:r>
          <w:t><strong>Attached Files:</strong></w:t>
        </w:r>
      </w:p>
      ${response.files.map((file: string) => `
      <w:p>
        <w:r>
          <w:t>- ${file.split('/').pop() || file}</w:t>
        </w:r>
      </w:p>
      `).join('')}
      ` : ''}
      `;
    }).join('') || ''}
    `).join('') || ''}
    
    <w:p>
      <w:r>
        <w:t>Powered by Eddura on ${new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;

  // Create a minimal Word document structure
  const docxBuffer = createMinimalDocx(wordDocumentXml);
  
  return docxBuffer;
}

function createMinimalDocx(documentXml: string): Buffer {
  const zip = new PizZip();
  
  // Add the main document XML
  zip.file('word/document.xml', documentXml);
  
  // Add required Office Open XML files
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

  zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`);

  // Generate the DOCX file
  return zip.generate({ type: 'nodebuffer' });
}