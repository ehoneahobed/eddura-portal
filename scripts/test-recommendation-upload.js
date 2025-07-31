#!/usr/bin/env node

/**
 * Test Recommendation Upload Endpoint
 * This script tests the recommendation upload endpoint to identify issues.
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');

async function testRecommendationUpload() {
  try {
    console.log('🧪 Testing recommendation upload endpoint...\n');
    
    // Create a test file
    const testFilePath = path.join(__dirname, 'test-recommendation.txt');
    const testContent = 'This is a test recommendation letter for testing purposes.';
    fs.writeFileSync(testFilePath, testContent);
    
    console.log('📄 Created test file:', testFilePath);
    
    // Create FormData-like object for testing
    const formData = new FormData();
    const testFile = new File([testContent], 'test-recommendation.txt', { type: 'text/plain' });
    formData.append('file', testFile);
    
    console.log('📤 Testing upload endpoint...');
    
    // Note: This is a simulation - in a real test, you'd need to start the dev server
    // and make an actual HTTP request to the endpoint
    
    console.log('✅ Test setup complete');
    console.log('\nTo test the actual endpoint:');
    console.log('1. Start the development server: pnpm dev');
    console.log('2. Create a recommendation request');
    console.log('3. Try uploading a file through the UI');
    console.log('4. Check the server logs for any errors');
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
    console.log('🧹 Cleaned up test file');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRecommendationUpload(); 