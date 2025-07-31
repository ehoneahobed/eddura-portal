const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

async function generateTestURL() {
  try {
    console.log('🔗 Generating test URL with real secure token...\n');

    // Wait for connection to be ready
    await mongoose.connection.asPromise();

    // Get a recommendation request with a secure token
    const requests = await mongoose.connection.db.collection('recommendationrequests').find({
      secureToken: { $exists: true, $ne: null }
    }).toArray();
    
    if (requests.length === 0) {
      console.log('❌ No recommendation requests with secure tokens found');
      return;
    }

    const request = requests[0]; // Use the first one
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'; // Note: using port 3000
    
    console.log('📋 Found recommendation request:');
    console.log(`   ID: ${request._id}`);
    console.log(`   Title: ${request.title}`);
    console.log(`   Status: ${request.status}`);
    console.log(`   Secure Token: ${request.secureToken}`);
    console.log(`   Token Expires: ${request.tokenExpiresAt}`);
    
    const testUrl = `${baseUrl}/recommendation/${request.secureToken}`;
    console.log('\n🔗 Test URL:');
    console.log(testUrl);
    
    console.log('\n📋 API Endpoint:');
    console.log(`${baseUrl}/api/recommendations/recipient/${request.secureToken}`);
    
    console.log('\n💡 Instructions:');
    console.log('1. Copy the test URL above');
    console.log('2. Open it in your browser');
    console.log('3. This should load the recipient portal');
    console.log('4. Check the browser console for any errors');

  } catch (error) {
    console.error('❌ Error generating test URL:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the script
if (require.main === module) {
  generateTestURL();
}

module.exports = { generateTestURL }; 