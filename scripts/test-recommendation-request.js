#!/usr/bin/env node

/**
 * Test Recommendation Request Access
 * This script tests if we can access recommendation requests from the database.
 */

require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');

async function testRecommendationRequest() {
  try {
    console.log('🧪 Testing recommendation request access...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Import models
    const RecommendationRequest = require('../models/RecommendationRequest');
    
    // Check if there are any recommendation requests
    const totalRequests = await RecommendationRequest.countDocuments();
    console.log('📊 Total recommendation requests in database:', totalRequests);
    
    if (totalRequests === 0) {
      console.log('⚠️  No recommendation requests found in database');
      console.log('💡 You need to create a recommendation request first');
      return;
    }
    
    // Get a sample request
    const sampleRequest = await RecommendationRequest.findOne({
      status: { $ne: 'cancelled' },
      tokenExpiresAt: { $gt: new Date() }
    });
    
    if (!sampleRequest) {
      console.log('⚠️  No valid recommendation requests found');
      console.log('💡 All requests might be cancelled or expired');
      return;
    }
    
    console.log('✅ Found valid recommendation request:');
    console.log('   ID:', sampleRequest._id);
    console.log('   Title:', sampleRequest.title);
    console.log('   Status:', sampleRequest.status);
    console.log('   Token:', sampleRequest.secureToken);
    console.log('   Expires:', sampleRequest.tokenExpiresAt);
    
    // Test the API endpoint with this token
    console.log('\n🔗 Testing API endpoint with real token...');
    
    const response = await fetch(`http://localhost:3000/api/recommendations/recipient/${sampleRequest.secureToken}`);
    const data = await response.json();
    
    console.log('📊 API Response Status:', response.status);
    console.log('📊 API Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ API endpoint working correctly!');
    } else {
      console.log('❌ API endpoint failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error details:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testRecommendationRequest(); 