#!/usr/bin/env node

/**
 * Test Presigned URL Generation and Usage
 * This script tests if presigned URLs are being generated and used correctly.
 */

require('dotenv').config({ path: '.env.local' });

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

async function testPresignedUrl() {
  try {
    console.log('🧪 Testing presigned URL generation and usage...\n');
    
    // Initialize S3 client
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    // Test key
    const testKey = `test-uploads/${Date.now()}-test-file.txt`;
    const testContent = 'This is a test file for presigned URL testing.';
    
    console.log('🔗 Step 1: Generating presigned URL...');
    
    // Generate presigned URL
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: testKey,
      ContentType: 'text/plain',
      ACL: 'private',
    });
    
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    console.log('✅ Presigned URL generated successfully');
    console.log('📏 URL length:', presignedUrl.length);
    console.log('🔗 URL starts with:', presignedUrl.substring(0, 50) + '...');
    
    // Test the URL with different methods
    console.log('\n📤 Step 2: Testing URL with fetch...');
    
    // Method 1: Using fetch with Buffer
    try {
      const buffer = Buffer.from(testContent, 'utf8');
      const response1 = await fetch(presignedUrl, {
        method: 'PUT',
        body: buffer,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
      
      console.log('📊 Fetch with Buffer - Status:', response1.status);
      console.log('📊 Fetch with Buffer - Status Text:', response1.statusText);
      
      if (response1.ok) {
        console.log('✅ Fetch with Buffer successful!');
      } else {
        const errorText = await response1.text();
        console.log('❌ Fetch with Buffer failed:', errorText);
      }
    } catch (error1) {
      console.log('❌ Fetch with Buffer error:', error1.message);
    }
    
    // Method 2: Using fetch with Blob (simulating browser behavior)
    try {
      const blob = new Blob([testContent], { type: 'text/plain' });
      const response2 = await fetch(presignedUrl, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
      
      console.log('📊 Fetch with Blob - Status:', response2.status);
      console.log('📊 Fetch with Blob - Status Text:', response2.statusText);
      
      if (response2.ok) {
        console.log('✅ Fetch with Blob successful!');
      } else {
        const errorText = await response2.text();
        console.log('❌ Fetch with Blob failed:', errorText);
      }
    } catch (error2) {
      console.log('❌ Fetch with Blob error:', error2.message);
    }
    
    // Method 3: Using fetch with string
    try {
      const response3 = await fetch(presignedUrl, {
        method: 'PUT',
        body: testContent,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
      
      console.log('📊 Fetch with String - Status:', response3.status);
      console.log('📊 Fetch with String - Status Text:', response3.statusText);
      
      if (response3.ok) {
        console.log('✅ Fetch with String successful!');
      } else {
        const errorText = await response3.text();
        console.log('❌ Fetch with String failed:', errorText);
      }
    } catch (error3) {
      console.log('❌ Fetch with String error:', error3.message);
    }
    
    console.log('\n🎉 Presigned URL testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error details:', error);
  }
}

testPresignedUrl(); 