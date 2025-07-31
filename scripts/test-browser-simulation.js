#!/usr/bin/env node

/**
 * Test Browser Simulation
 * This script simulates the exact browser behavior for the upload flow.
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');

async function testBrowserSimulation() {
  try {
    console.log('🧪 Testing browser simulation for upload flow...\n');
    
    // Create a test file (simulating file selection in browser)
    const testFilePath = path.join(__dirname, 'test-browser-file.pdf');
    const testContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Test File) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n297\n%%EOF';
    fs.writeFileSync(testFilePath, testContent);
    
    console.log('📄 Created test file:', testFilePath);
    console.log('📊 File size:', fs.statSync(testFilePath).size, 'bytes');
    
    // Simulate the S3 upload step directly (bypassing the API)
    console.log('\n📤 Step 1: Simulating S3 upload directly...');
    
    // Generate a presigned URL directly
    const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
    const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
    
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    
    const testKey = `test-browser-simulation/${Date.now()}-test-file.pdf`;
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: testKey,
      ContentType: 'application/pdf',
      ACL: 'private',
    });
    
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    console.log('✅ Presigned URL generated:', presignedUrl.substring(0, 100) + '...');
    
    // Test the upload with different approaches (simulating browser behavior)
    const fileBuffer = fs.readFileSync(testFilePath);
    
    console.log('\n📤 Step 2: Testing different upload approaches...');
    
    // Approach 1: Direct buffer upload
    try {
      console.log('Trying Approach 1: Direct buffer upload');
      const response1 = await fetch(presignedUrl, {
        method: 'PUT',
        body: fileBuffer,
        headers: {
          'Content-Type': 'application/pdf',
        },
      });
      
      console.log('📊 Approach 1 - Status:', response1.status);
      console.log('📊 Approach 1 - Status Text:', response1.statusText);
      
      if (response1.ok) {
        console.log('✅ Approach 1 successful!');
      } else {
        const errorText = await response1.text();
        console.log('❌ Approach 1 failed:', errorText);
      }
    } catch (error1) {
      console.log('❌ Approach 1 error:', error1.message);
    }
    
    // Approach 2: Blob-like upload
    try {
      console.log('Trying Approach 2: Blob-like upload');
      const response2 = await fetch(presignedUrl, {
        method: 'PUT',
        body: fileBuffer,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Length': fileBuffer.length.toString(),
        },
      });
      
      console.log('📊 Approach 2 - Status:', response2.status);
      console.log('📊 Approach 2 - Status Text:', response2.statusText);
      
      if (response2.ok) {
        console.log('✅ Approach 2 successful!');
      } else {
        const errorText = await response2.text();
        console.log('❌ Approach 2 failed:', errorText);
      }
    } catch (error2) {
      console.log('❌ Approach 2 error:', error2.message);
    }
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
    console.log('🧹 Cleaned up test file');
    
    console.log('\n🎉 Browser simulation test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error details:', error);
  }
}

testBrowserSimulation(); 