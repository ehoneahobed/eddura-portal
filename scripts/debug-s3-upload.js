const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Validate environment variables
const requiredEnvVars = {
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
};

console.log('Environment variables check:', {
  AWS_REGION: requiredEnvVars.AWS_REGION ? 'Set' : 'Missing',
  AWS_ACCESS_KEY_ID: requiredEnvVars.AWS_ACCESS_KEY_ID ? 'Set' : 'Missing',
  AWS_SECRET_ACCESS_KEY: requiredEnvVars.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Missing',
  AWS_S3_BUCKET: requiredEnvVars.AWS_S3_BUCKET ? 'Set' : 'Missing',
});

// Check for missing variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('Missing required AWS environment variables:', missingVars);
  process.exit(1);
}

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function testPresignedUrl() {
  try {
    console.log('\n=== Testing S3 Presigned URL Generation ===');
    
    const testKey = `test-uploads/debug-test-${Date.now()}.txt`;
    const testContent = 'This is a test file for debugging S3 upload issues.';
    
    console.log('Test key:', testKey);
    console.log('Test content length:', testContent.length);
    
    // Generate presigned URL
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: testKey,
      ContentType: 'text/plain',
      ACL: 'private',
    });
    
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    console.log('\nGenerated presigned URL:', presignedUrl);
    console.log('URL length:', presignedUrl.length);
    
    // Test URL format
    try {
      const url = new URL(presignedUrl);
      console.log('\nURL validation passed:', {
        protocol: url.protocol,
        hostname: url.hostname,
        pathname: url.pathname,
        search: url.search
      });
    } catch (urlError) {
      console.error('URL validation failed:', urlError);
      return;
    }
    
    // Test direct upload using Node.js fetch
    console.log('\n=== Testing Direct Upload ===');
    try {
      const response = await fetch(presignedUrl, {
        method: 'PUT',
        body: testContent,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
      
      console.log('Upload response status:', response.status);
      console.log('Upload response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        console.log('✅ Direct upload successful!');
      } else {
        const errorText = await response.text();
        console.error('❌ Direct upload failed:', errorText);
      }
    } catch (fetchError) {
      console.error('❌ Fetch error:', fetchError.message);
      console.error('Error type:', fetchError.constructor.name);
    }
    
    // Test with different content types
    console.log('\n=== Testing Different Content Types ===');
    const contentTypes = [
      'text/plain',
      'application/octet-stream',
      'application/pdf'
    ];
    
    for (const contentType of contentTypes) {
      try {
        console.log(`Testing with Content-Type: ${contentType}`);
        
        const command2 = new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: `${testKey}-${contentType.replace('/', '-')}`,
          ContentType: contentType,
          ACL: 'private',
        });
        
        const presignedUrl2 = await getSignedUrl(s3, command2, { expiresIn: 300 });
        
        const response = await fetch(presignedUrl2, {
          method: 'PUT',
          body: testContent,
          headers: {
            'Content-Type': contentType,
          },
        });
        
        console.log(`  Status: ${response.status} - ${response.ok ? '✅' : '❌'}`);
      } catch (error) {
        console.error(`  Error: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

async function testS3BucketAccess() {
  try {
    console.log('\n=== Testing S3 Bucket Access ===');
    
    // Test listing buckets
    const { ListBucketsCommand } = require('@aws-sdk/client-s3');
    const listCommand = new ListBucketsCommand({});
    const listResponse = await s3.send(listCommand);
    
    console.log('Available buckets:', listResponse.Buckets?.map(b => b.Name));
    
    // Test if our bucket exists
    const bucketExists = listResponse.Buckets?.some(bucket => bucket.Name === process.env.AWS_S3_BUCKET);
    if (bucketExists) {
      console.log(`✅ Bucket "${process.env.AWS_S3_BUCKET}" exists`);
    } else {
      console.warn(`⚠️  Bucket "${process.env.AWS_S3_BUCKET}" not found in available buckets`);
    }
    
  } catch (error) {
    console.error('Bucket access test failed:', error);
  }
}

async function main() {
  console.log('🔍 S3 Upload Debug Script');
  console.log('========================');
  
  await testS3BucketAccess();
  await testPresignedUrl();
  
  console.log('\n✅ Debug script completed');
}

main().catch(console.error); 