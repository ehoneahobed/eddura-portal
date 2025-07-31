const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Define the old schema (for existing documents)
const oldRecipientSchema = new mongoose.Schema({
  email: String,
  name: String,
  title: String,
  institution: String,
  department: String,
  phoneNumber: String,
  officeAddress: String,
  prefersDrafts: Boolean,
  preferredCommunicationMethod: String,
  createdAt: Date,
  updatedAt: Date,
}, { strict: false });

const OldRecipient = mongoose.model('Recipient', oldRecipientSchema);

// Define the new schema
const newRecipientSchema = new mongoose.Schema({
  emails: {
    type: [String],
    required: true,
    validate: {
      validator: function(emails) {
        return emails.length > 0;
      },
      message: 'At least one email is required'
    }
  },
  primaryEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  institution: {
    type: String,
    required: true,
    trim: true,
  },
  department: {
    type: String,
    trim: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  officeAddress: {
    type: String,
    trim: true,
  },
  prefersDrafts: {
    type: Boolean,
    default: false,
  },
  preferredCommunicationMethod: {
    type: String,
    enum: ['email', 'phone', 'both'],
    default: 'email',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

// Indexes
newRecipientSchema.index({ primaryEmail: 1 });
newRecipientSchema.index({ emails: 1 });
newRecipientSchema.index({ institution: 1 });
newRecipientSchema.index({ createdAt: -1 });
newRecipientSchema.index({ createdBy: 1 });
newRecipientSchema.index({ primaryEmail: 1, createdBy: 1 }, { unique: true });

const NewRecipient = mongoose.model('NewRecipient', newRecipientSchema);

async function migrateRecipients() {
  try {
    console.log('Starting recipient migration...');
    
    // Get all existing recipients
    const oldRecipients = await OldRecipient.find({});
    console.log(`Found ${oldRecipients.length} recipients to migrate`);
    
    for (const oldRecipient of oldRecipients) {
      console.log(`Migrating recipient: ${oldRecipient.name} (${oldRecipient.email})`);
      
      // Create new recipient with updated schema
      const newRecipient = new NewRecipient({
        emails: [oldRecipient.email],
        primaryEmail: oldRecipient.email,
        name: oldRecipient.name,
        title: oldRecipient.title,
        institution: oldRecipient.institution,
        department: oldRecipient.department,
        phoneNumber: oldRecipient.phoneNumber,
        officeAddress: oldRecipient.officeAddress,
        prefersDrafts: oldRecipient.prefersDrafts || false,
        preferredCommunicationMethod: oldRecipient.preferredCommunicationMethod || 'email',
        createdBy: oldRecipient.createdBy || new mongoose.Types.ObjectId(), // Default if missing
        createdAt: oldRecipient.createdAt,
        updatedAt: oldRecipient.updatedAt,
      });
      
      await newRecipient.save();
      console.log(`Successfully migrated: ${oldRecipient.name}`);
    }
    
    // Drop the old collection and rename the new one
    await mongoose.connection.db.dropCollection('recipients');
    await mongoose.connection.db.renameCollection('newrecipients', 'recipients');
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

migrateRecipients(); 