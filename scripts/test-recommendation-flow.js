#!/usr/bin/env node

/**
 * Test Recommendation Upload Flow
 * This script tests the exact recommendation upload flow to identify issues.
 */

require('dotenv').config({ path: '.env.local' });

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const fs = require('fs');
const path = require('path');

async function testRecommendationFlow() {
  try {
    console.log('🧪 Testing recommendation upload flow...\n');
    
    // Create a test PDF file (simulating a recommendation letter)
    const testFilePath = path.join(__dirname, 'test-recommendation.pdf');
    const testContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Test Recommendation Letter) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n297\n%%EOF';
    fs.writeFileSync(testFilePath, testContent);
    
    console.log('📄 Created test PDF file:', testFilePath);
    console.log('📊 File size:', fs.statSync(testFilePath).size, 'bytes');
    
    // Initialize S3 client
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    // Simulate the recommendation upload flow
    console.log('🔗 Step 1: Generating presigned URL for recommendation...');
    
    // Use the same key pattern as the recommendation upload
    const testKey = `recommendations/test-request-id/${Date.now()}-test-recommendation.pdf`;
    
    // Generate presigned URL with the same parameters as the recommendation upload
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: testKey,
      ContentType: 'application/pdf',
      ACL: 'private',
    });
    
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    console.log('✅ Presigned URL generated:', presignedUrl.substring(0, 100) + '...');
    
    // Test the upload with the same parameters as the frontend
    console.log('📤 Step 2: Testing upload with presigned URL...');
    
    const fileBuffer = fs.readFileSync(testFilePath);
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: fileBuffer,
      headers: {
        'Content-Type': 'application/pdf',
      },
    });
    
    console.log('📊 Upload response status:', response.status);
    console.log('📊 Upload response status text:', response.statusText);
    console.log('📊 Upload response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      console.log('✅ Recommendation upload test successful!');
      
      // Test the S3 object URL generation
      const s3ObjectUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${testKey}`;
      console.log('🔗 Generated S3 object URL:', s3ObjectUrl);
      
      // Test if the file is accessible
      console.log('🔍 Testing file accessibility...');
      try {
        const headResponse = await fetch(s3ObjectUrl);
        console.log('📊 Head response status:', headResponse.status);
        if (headResponse.ok) {
          console.log('✅ File is accessible via S3 object URL');
        } else {
          console.log('⚠️  File not accessible via S3 object URL (this might be expected for private files)');
        }
      } catch (headError) {
        console.log('⚠️  Head request failed (this might be expected for private files):', headError.message);
      }
    } else {
      const errorText = await response.text();
      console.error('❌ Recommendation upload test failed:', errorText);
    }
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
    console.log('🧹 Cleaned up test file');
    
    console.log('\n🎉 Recommendation upload flow test completed!');
    
  } catch (error) {
    console.error('❌ Recommendation upload flow test failed:', error.message);
    console.error('Error details:', error);
  }
}

testRecommendationFlow(); 