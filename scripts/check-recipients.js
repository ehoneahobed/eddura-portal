const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Define recipient schema
const recipientSchema = new mongoose.Schema({
  name: String,
  emails: [String],
  primaryEmail: String,
  title: String,
  institution: String,
  department: String,
  phoneNumber: String,
  officeAddress: String,
  prefersDrafts: Boolean,
  preferredCommunicationMethod: String,
  createdBy: mongoose.Schema.Types.ObjectId,
  createdAt: Date,
  updatedAt: Date,
}, { strict: false });

const Recipient = mongoose.model('Recipient', recipientSchema);

// Define user schema
const userSchema = new mongoose.Schema({
  email: String,
  name: String,
}, { strict: false });

const User = mongoose.model('User', userSchema);

async function checkRecipients() {
  try {
    console.log('Checking all recipients in database...');
    
    // Get all recipients
    const recipients = await Recipient.find({});
    console.log(`Found ${recipients.length} recipients total`);
    
    for (const recipient of recipients) {
      console.log(`\nRecipient ID: ${recipient._id}`);
      console.log(`Name: ${recipient.name}`);
      console.log(`Emails: ${recipient.emails}`);
      console.log(`Primary Email: ${recipient.primaryEmail}`);
      console.log(`Created By: ${recipient.createdBy}`);
      console.log(`Institution: ${recipient.institution}`);
      console.log(`Created At: ${recipient.createdAt}`);
      
      // Check if the user exists
      if (recipient.createdBy) {
        const user = await User.findById(recipient.createdBy);
        if (user) {
          console.log(`✅ User found: ${user.email}`);
        } else {
          console.log(`❌ User not found for ID: ${recipient.createdBy}`);
        }
      } else {
        console.log(`❌ No createdBy field`);
      }
    }
    
    // Get all users
    const users = await User.find({});
    console.log(`\nFound ${users.length} users total`);
    
    for (const user of users) {
      console.log(`User ID: ${user._id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.name}`);
      
      // Check recipients for this user
      const userRecipients = await Recipient.find({ createdBy: user._id });
      console.log(`Recipients for this user: ${userRecipients.length}`);
    }
    
  } catch (error) {
    console.error('Error checking recipients:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkRecipients(); 