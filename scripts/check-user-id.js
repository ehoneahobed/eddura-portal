const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

async function checkUserID() {
  try {
    console.log('🔍 Checking user ID for email...\n');

    // Wait for connection to be ready
    await mongoose.connection.asPromise();

    // Check for the user with the email from the database
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    
    console.log(`Found ${users.length} users in database:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user._id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.firstName || ''} ${user.lastName || ''}`);
      console.log('');
    });

    // Check which user created the recommendation requests
    const requests = await mongoose.connection.db.collection('recommendationrequests').find({}).toArray();
    
    console.log('Recommendation requests and their creators:');
    requests.forEach((request, index) => {
      console.log(`${index + 1}. Request ID: ${request._id}`);
      console.log(`   Title: ${request.title}`);
      console.log(`   Student ID: ${request.studentId}`);
      console.log(`   Status: ${request.status}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error checking user ID:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the check
if (require.main === module) {
  checkUserID();
}

module.exports = { checkUserID }; 