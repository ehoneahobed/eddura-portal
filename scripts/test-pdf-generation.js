const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testPDFGeneration() {
  console.log('🧪 Testing PDF Generation...');
  
  let browser;
  try {
    // Test HTML content
    const testHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Test Document</title>
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
            .content {
              text-align: justify;
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Test Document</div>
            <div class="subtitle">PDF Generation Test</div>
          </div>
          <div class="content">
            This is a test document to verify PDF generation is working correctly.
            
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </div>
        </body>
      </html>
    `;

    console.log('🚀 Launching browser...');
    
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
      timeout: 30000
    });

    console.log('✅ Browser launched successfully');

    const page = await browser.newPage();
    console.log('📄 New page created');

    // Set viewport
    await page.setViewport({ width: 1200, height: 800 });

    console.log('📝 Setting HTML content...');
    await page.setContent(testHTML, { waitUntil: 'networkidle0' });
    console.log('✅ HTML content set successfully');
    
    // Wait a bit for content to render
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('🔄 Generating PDF...');
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

    console.log(`✅ PDF generated successfully!`);
    console.log(`📊 File size: ${pdfBuffer.length} bytes`);
    
    // Save test file
    const testFilePath = path.join(__dirname, 'test-document.pdf');
    fs.writeFileSync(testFilePath, pdfBuffer);
    console.log(`💾 Test file saved as: ${testFilePath}`);
    
    // Verify file exists and has content
    if (fs.existsSync(testFilePath)) {
      const stats = fs.statSync(testFilePath);
      console.log(`📁 File exists: ${stats.size} bytes`);
      
      if (stats.size > 0) {
        console.log('🎉 PDF generation test PASSED!');
        return true;
      } else {
        console.log('❌ PDF file is empty');
        return false;
      }
    } else {
      console.log('❌ PDF file was not created');
      return false;
    }

  } catch (error) {
    console.error('❌ PDF generation test FAILED:', error);
    return false;
  } finally {
    if (browser) {
      console.log('🔒 Closing browser...');
      await browser.close();
      console.log('✅ Browser closed');
    }
  }
}

// Run the test
testPDFGeneration()
  .then(success => {
    if (success) {
      console.log('\n🎉 All tests passed! PDF generation is working correctly.');
      process.exit(0);
    } else {
      console.log('\n❌ Tests failed! PDF generation needs to be fixed.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Test execution failed:', error);
    process.exit(1);
  });