#!/usr/bin/env node

/**
 * Test S3 Configuration
 * This script checks if AWS environment variables are properly configured
 * and tests basic S3 functionality.
 */

require('dotenv').config({ path: '.env.local' });

const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

// Check required environment variables
const requiredEnvVars = {
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
};

console.log('🔍 Checking AWS Environment Variables...\n');

const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('❌ Missing required AWS environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease add these variables to your .env.local file:');
  console.error('AWS_REGION=your-aws-region');
  console.error('AWS_ACCESS_KEY_ID=your-access-key-id');
  console.error('AWS_SECRET_ACCESS_KEY=your-secret-access-key');
  console.error('AWS_S3_BUCKET=your-s3-bucket-name');
  process.exit(1);
}

console.log('✅ All required environment variables are present\n');

// Test S3 connection
async function testS3Connection() {
  try {
    console.log('🔗 Testing S3 connection...');
    
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const command = new ListBucketsCommand({});
    const response = await s3.send(command);
    
    console.log('✅ S3 connection successful!');
    console.log(`📦 Available buckets: ${response.Buckets?.length || 0}`);
    
    // Check if the configured bucket exists
    const bucketExists = response.Buckets?.some(bucket => bucket.Name === process.env.AWS_S3_BUCKET);
    
    if (bucketExists) {
      console.log(`✅ Configured bucket "${process.env.AWS_S3_BUCKET}" exists`);
    } else {
      console.warn(`⚠️  Configured bucket "${process.env.AWS_S3_BUCKET}" not found in available buckets`);
      console.log('Available buckets:', response.Buckets?.map(b => b.Name).join(', ') || 'None');
    }
    
    console.log('\n🎉 S3 configuration is working correctly!');
    
  } catch (error) {
    console.error('❌ S3 connection failed:', error.message);
    console.error('\nPossible issues:');
    console.error('1. Invalid AWS credentials');
    console.error('2. Incorrect AWS region');
    console.error('3. Network connectivity issues');
    console.error('4. IAM permissions insufficient');
    process.exit(1);
  }
}

testS3Connection(); 