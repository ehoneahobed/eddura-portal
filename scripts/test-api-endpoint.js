#!/usr/bin/env node

/**
 * Test API Endpoint
 * This script tests the recommendation API endpoint directly.
 */

async function testAPIEndpoint() {
  try {
    console.log('🧪 Testing recommendation API endpoint...\n');
    
    // Test with a sample token (this should return 404, which is expected)
    const testToken = 'test-token-123';
    console.log('🔗 Testing with sample token:', testToken);
    
    const response = await fetch(`http://localhost:3000/api/recommendations/recipient/${testToken}`);
    const data = await response.json();
    
    console.log('📊 API Response Status:', response.status);
    console.log('📊 API Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 404) {
      console.log('✅ API endpoint is working correctly (404 is expected for invalid token)');
    } else if (response.status === 200) {
      console.log('✅ API endpoint is working correctly (found valid request)');
    } else {
      console.log('❌ API endpoint returned unexpected status:', response.status);
    }
    
    // Test the upload endpoint
    console.log('\n🔗 Testing upload endpoint...');
    
    const formData = new FormData();
    const testFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    formData.append('file', testFile);
    
    const uploadResponse = await fetch(`http://localhost:3000/api/recommendations/recipient/${testToken}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    const uploadData = await uploadResponse.json();
    console.log('📊 Upload API Response Status:', uploadResponse.status);
    console.log('📊 Upload API Response:', JSON.stringify(uploadData, null, 2));
    
    if (uploadResponse.status === 404) {
      console.log('✅ Upload endpoint is working correctly (404 is expected for invalid token)');
    } else if (uploadResponse.status === 201) {
      console.log('✅ Upload endpoint is working correctly (presigned URL generated)');
    } else {
      console.log('❌ Upload endpoint returned unexpected status:', uploadResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error details:', error);
  }
}

testAPIEndpoint(); 