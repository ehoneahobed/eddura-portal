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

async function fixRecipientUser() {
  try {
    console.log('Fixing recipient user association...');
    
    // Find the user with email obedehoneah@gmail.com
    const user = await User.findOne({ email: 'obedehoneah@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`Found user: ${user.email} (ID: ${user._id})`);
    
    // Find the recipient
    const recipient = await Recipient.findOne({ name: 'Obed Ehoneah' });
    if (!recipient) {
      console.log('❌ Recipient not found');
      return;
    }
    
    console.log(`Found recipient: ${recipient.name} (ID: ${recipient._id})`);
    console.log(`Current createdBy: ${recipient.createdBy}`);
    
    // Update the recipient to be associated with the correct user
    await Recipient.findByIdAndUpdate(recipient._id, {
      createdBy: user._id
    });
    
    console.log(`✅ Updated recipient to be associated with user: ${user.email}`);
    
    // Verify the fix
    const updatedRecipient = await Recipient.findById(recipient._id);
    console.log(`Updated recipient createdBy: ${updatedRecipient.createdBy}`);
    
  } catch (error) {
    console.error('Error fixing recipient user:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixRecipientUser(); 