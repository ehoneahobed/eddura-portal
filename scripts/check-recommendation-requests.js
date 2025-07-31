const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

async function checkRecommendationRequests() {
  try {
    console.log('🔍 Checking recommendation requests in database...\n');

    // Wait for connection to be ready
    await mongoose.connection.asPromise();

    // Get all recommendation requests without population first
    const requests = await mongoose.connection.db.collection('recommendationrequests').find({}).toArray();
    
    console.log(`Found ${requests.length} recommendation requests:\n`);
    
    if (requests.length === 0) {
      console.log('❌ No recommendation requests found in database');
      console.log('\n💡 This explains why you\'re getting "Request Not Found" errors.');
      console.log('   You need to create some recommendation requests first.');
    } else {
      requests.forEach((request, index) => {
        console.log(`${index + 1}. ID: ${request._id}`);
        console.log(`   Title: ${request.title}`);
        console.log(`   Status: ${request.status}`);
        console.log(`   Student ID: ${request.studentId}`);
        console.log(`   Recipient ID: ${request.recipientId}`);
        console.log(`   Created: ${request.createdAt}`);
        console.log(`   Secure Token: ${request.secureToken ? 'Yes' : 'No'}`);
        console.log(`   Token Expires: ${request.tokenExpiresAt}`);
        console.log('');
      });
    }

    // Also check if there are any users
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log(`Found ${users.length} users in database`);
    
    if (users.length > 0) {
      console.log('Sample users:');
      users.slice(0, 3).forEach(user => {
        console.log(`- ${user.email} (${user.firstName || ''} ${user.lastName || ''})`);
      });
    }

    // Check recipients
    const recipients = await mongoose.connection.db.collection('recipients').find({}).toArray();
    console.log(`\nFound ${recipients.length} recipients in database`);
    
    if (recipients.length > 0) {
      console.log('Sample recipients:');
      recipients.slice(0, 3).forEach(recipient => {
        console.log(`- ${recipient.name} (${recipient.primaryEmail || recipient.emails?.[0] || 'No email'})`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking recommendation requests:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the check
if (require.main === module) {
  checkRecommendationRequests();
}

module.exports = { checkRecommendationRequests }; 