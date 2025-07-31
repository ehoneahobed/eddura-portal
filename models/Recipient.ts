import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Recipient interface representing a person who can provide recommendation letters
 */
export interface IRecipient extends Document {
  // Basic Information
  email: string;
  name: string;
  title: string; // Professor, Supervisor, Manager, etc.
  institution: string;
  department?: string;
  
  // Contact Information
  phoneNumber?: string;
  officeAddress?: string;
  
  // Preferences
  prefersDrafts: boolean;
  preferredCommunicationMethod: 'email' | 'portal' | 'both';
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Recipient schema for MongoDB
 */
const recipientSchema = new Schema<IRecipient>({
  email: {
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
    enum: ['email', 'portal', 'both'],
    default: 'both',
  },
}, {
  timestamps: true,
});

// Indexes for efficient querying
recipientSchema.index({ email: 1 });
recipientSchema.index({ institution: 1 });
recipientSchema.index({ createdAt: -1 });

// Ensure email uniqueness per user (will be handled at application level)
recipientSchema.index({ email: 1 }, { unique: false });

export const Recipient: Model<IRecipient> = mongoose.models.Recipient || mongoose.model<IRecipient>('Recipient', recipientSchema);

export default Recipient;