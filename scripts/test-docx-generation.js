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
    ${testDocument.content.split('\n').map((paragraph) => `
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
    
    // Verify file structure
    console.log('\n🔍 Verifying DOCX structure...');
    const testZip = new PizZip(docxBuffer);
    const files = Object.keys(testZip.files);
    console.log('📁 Files in DOCX:', files);
    
    if (files.includes('word/document.xml') && 
        files.includes('[Content_Types].xml') && 
        files.includes('_rels/.rels')) {
      console.log('✅ DOCX structure is valid!');
    } else {
      console.log('❌ DOCX structure is missing required files!');
    }
    
  } catch (error) {
    console.error('❌ DOCX generation failed:', error);
  }
}

// Run test
console.log('🧪 Testing DOCX Generation\n');
testDOCXGeneration();
console.log('\n✅ Test completed!');
console.log('📁 Check the generated test file: test-document.docx');