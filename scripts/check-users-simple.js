const mongoose = require('mongoose');
require('dotenv').config();

async function checkUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check for users using the collection directly
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    
    console.log(`\n📊 Found ${users.length} users in the database:`);
    
    if (users.length === 0) {
      console.log('❌ No users found in the database');
      console.log('💡 You may need to create a test user to test the application');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - Active: ${user.isActive} - Created: ${user.createdAt}`);
      });
    }

    // Check for admins
    const admins = await mongoose.connection.db.collection('admins').find({}).toArray();
    
    console.log(`\n📊 Found ${admins.length} admins in the database:`);
    
    if (admins.length === 0) {
      console.log('❌ No admins found in the database');
    } else {
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.firstName} ${admin.lastName} (${admin.email}) - Role: ${admin.role} - Active: ${admin.isActive}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

checkUsers();