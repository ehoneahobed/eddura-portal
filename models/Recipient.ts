import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Recipient interface representing a person who can provide recommendation letters
 */
export interface IRecipient extends Document {
  // Basic Information
  emails: string[]; // Array of email addresses
  primaryEmail: string; // Primary email for display and default sending
  name: string;
  title: string; // Professor, Supervisor, Manager, etc.
  institution: string;
  department?: string;
  
  // Contact Information
  phoneNumber?: string;
  officeAddress?: string;
  
  // Preferences
  prefersDrafts: boolean;
  preferredCommunicationMethod: 'email' | 'phone' | 'both';
  
  // User association
  createdBy: mongoose.Types.ObjectId;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Recipient schema for MongoDB
 */
const recipientSchema = new Schema<IRecipient>({
  emails: {
    type: [String],
    required: true,
    validate: {
      validator: function(emails: string[]) {
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
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

// Indexes for efficient querying
recipientSchema.index({ primaryEmail: 1 });
recipientSchema.index({ emails: 1 });
recipientSchema.index({ institution: 1 });
recipientSchema.index({ createdAt: -1 });
recipientSchema.index({ createdBy: 1 });

// Compound index for email uniqueness per user
recipientSchema.index({ primaryEmail: 1, createdBy: 1 }, { unique: true });

// Clear existing model if it exists to force recompilation
if (mongoose.models.Recipient) {
  delete mongoose.models.Recipient;
}

export const Recipient: Model<IRecipient> = mongoose.model<IRecipient>('Recipient', recipientSchema);

export default Recipient;