const puppeteer = require('puppeteer');
const PizZip = require('pizzip');

// Test DOCX generation
function testDOCXGeneration() {
  console.log('Testing DOCX generation...');
  
  const testDocument = {
    title: 'Test Document',
    type: 'personal_statement',
    content: 'This is a test document content.\n\nIt has multiple paragraphs.\n\nThis should work properly.',
    wordCount: 15,
    characterCount: 89,
    version: 1,
    lastEditedAt: new Date(),
    description: 'A test document for download functionality',
    targetProgram: 'Computer Science',
    targetScholarship: 'Merit Scholarship',
    targetInstitution: 'Test University'
  };

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
        <w:t>${testDocument.title}</w:t>
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
        <w:t>${testDocument.type.replace('_', ' ')}</w:t>
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
        <w:t>Word Count: ${testDocument.wordCount} | Character Count: ${testDocument.characterCount}</w:t>
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
        <w:t>Version: ${testDocument.version} | Last Edited: ${new Date(testDocument.lastEditedAt).toLocaleDateString()}</w:t>
      </w:r>
    </w:p>
    
    ${testDocument.targetProgram ? `
    <w:p>
      <w:pPr>
        <w:spacing w:after="120"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
        <w:t>Target Program: ${testDocument.targetProgram}</w:t>
      </w:r>
    </w:p>
    ` : ''}
    
    ${testDocument.targetScholarship ? `
    <w:p>
      <w:pPr>
        <w:spacing w:after="120"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
        <w:t>Target Scholarship: ${testDocument.targetScholarship}</w:t>
      </w:r>
    </w:p>
    ` : ''}
    
    ${testDocument.targetInstitution ? `
    <w:p>
      <w:pPr>
        <w:spacing w:after="120"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
        <w:t>Target Institution: ${testDocument.targetInstitution}</w:t>
      </w:r>
    </w:p>
    ` : ''}
    
    ${testDocument.description ? `
    <w:p>
      <w:pPr>
        <w:spacing w:after="240"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
        <w:t>${testDocument.description}</w:t>
      </w:r>
    </w:p>
    ` : ''}
    
    <!-- Content -->
    ${testDocument.content.split('\n').map(paragraph => `
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
    
    console.log('✅ DOCX generation successful!');
    console.log(`📄 File size: ${docxBuffer.length} bytes`);
    console.log(`📝 Content length: ${testDocument.content.length} characters`);
    
    // Save test file
    const fs = require('fs');
    fs.writeFileSync('test-document.docx', docxBuffer);
    console.log('💾 Test file saved as test-document.docx');
    
  } catch (error) {
    console.error('❌ DOCX generation failed:', error);
  }
}

// Test PDF generation
async function testPDFGeneration() {
  console.log('\nTesting PDF generation...');
  
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();

    const testDocument = {
      title: 'Test Document',
      type: 'personal_statement',
      content: 'This is a test document content.\n\nIt has multiple paragraphs.\n\nThis should work properly.',
      wordCount: 15,
      characterCount: 89,
      version: 1,
      lastEditedAt: new Date(),
      description: 'A test document for download functionality',
      targetProgram: 'Computer Science',
      targetScholarship: 'Merit Scholarship',
      targetInstitution: 'Test University'
    };

    // Create HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${testDocument.title}</title>
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
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${testDocument.title}</div>
            <div class="subtitle">${testDocument.type.replace('_', ' ')}</div>
            <div class="metadata">
              ${testDocument.description ? `<div>${testDocument.description}</div>` : ''}
              <div>Word Count: ${testDocument.wordCount} | Character Count: ${testDocument.characterCount}</div>
              <div>Version: ${testDocument.version} | Last Edited: ${new Date(testDocument.lastEditedAt).toLocaleDateString()}</div>
              ${testDocument.targetProgram ? `<div>Target Program: ${testDocument.targetProgram}</div>` : ''}
              ${testDocument.targetScholarship ? `<div>Target Scholarship: ${testDocument.targetScholarship}</div>` : ''}
              ${testDocument.targetInstitution ? `<div>Target Institution: ${testDocument.targetInstitution}</div>` : ''}
            </div>
          </div>
          <div class="content">${testDocument.content}</div>
          <div class="footer">
            Powered by Eddura Platform on ${new Date().toLocaleDateString()}
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
    
    console.log('✅ PDF generation successful!');
    console.log(`📄 File size: ${pdfBuffer.length} bytes`);
    
    // Save test file
    const fs = require('fs');
    fs.writeFileSync('test-document.pdf', pdfBuffer);
    console.log('💾 Test file saved as test-document.pdf');
    
  } catch (error) {
    console.error('❌ PDF generation failed:', error);
  }
}

// Run tests
async function runTests() {
  console.log('🧪 Testing Document Download Functionality\n');
  
  testDOCXGeneration();
  await testPDFGeneration();
  
  console.log('\n✅ All tests completed!');
  console.log('📁 Check the generated test files:');
  console.log('   - test-document.docx');
  console.log('   - test-document.pdf');
}

runTests().catch(console.error);