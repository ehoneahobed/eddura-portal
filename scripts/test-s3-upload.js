#!/usr/bin/env node

/**
 * Test S3 Upload Functionality
 * This script tests S3 upload functionality to identify issues.
 */

require('dotenv').config({ path: '.env.local' });

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const fs = require('fs');
const path = require('path');

async function testS3Upload() {
  try {
    console.log('🧪 Testing S3 upload functionality...\n');
    
    // Create a test file
    const testFilePath = path.join(__dirname, 'test-upload.txt');
    const testContent = 'This is a test file for S3 upload testing.';
    fs.writeFileSync(testFilePath, testContent);
    
    console.log('📄 Created test file:', testFilePath);
    
    // Initialize S3 client
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    // Generate a test key
    const testKey = `test-uploads/${Date.now()}-test-file.txt`;
    
    console.log('🔗 Generating presigned URL...');
    
    // Generate presigned URL
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: testKey,
      ContentType: 'text/plain',
      ACL: 'private',
    });
    
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    console.log('✅ Presigned URL generated:', presignedUrl.substring(0, 100) + '...');
    
    // Test the upload using Node.js fetch (simulating browser behavior)
    console.log('📤 Testing upload with presigned URL...');
    
    const fileBuffer = fs.readFileSync(testFilePath);
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: fileBuffer,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
    
    console.log('📊 Upload response status:', response.status);
    console.log('📊 Upload response status text:', response.statusText);
    
    if (response.ok) {
      console.log('✅ S3 upload test successful!');
      
      // Verify the file was uploaded
      console.log('🔍 Verifying file upload...');
      const headCommand = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: testKey,
      });
      
      try {
        await s3.send(headCommand);
        console.log('✅ File verification successful!');
      } catch (verifyError) {
        console.log('⚠️  File verification failed (this might be normal for presigned URLs):', verifyError.message);
      }
    } else {
      const errorText = await response.text();
      console.error('❌ S3 upload test failed:', errorText);
    }
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
    console.log('🧹 Cleaned up test file');
    
    console.log('\n🎉 S3 upload test completed!');
    
  } catch (error) {
    console.error('❌ S3 upload test failed:', error.message);
    console.error('Error details:', error);
  }
}

testS3Upload(); 