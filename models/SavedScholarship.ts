import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * SavedScholarship interface representing a scholarship saved by a user
 */
export interface ISavedScholarship extends Document {
  userId: mongoose.Types.ObjectId;
  scholarshipId: mongoose.Types.ObjectId;
  savedAt: Date;
  notes?: string;
  status: 'saved' | 'applied' | 'interested' | 'not-interested';
  reminderDate?: Date;
  isReminderSet: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const SavedScholarshipSchema: Schema = new Schema<ISavedScholarship>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  scholarshipId: {
    type: Schema.Types.ObjectId,
    ref: 'Scholarship',
    required: true,
    index: true
  },
  savedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['saved', 'applied', 'interested', 'not-interested'],
    default: 'saved'
  },
  reminderDate: {
    type: Date
  },
  isReminderSet: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index to ensure a user can only save a scholarship once
SavedScholarshipSchema.index({ userId: 1, scholarshipId: 1 }, { unique: true });

// Index for querying saved scholarships by user and status
SavedScholarshipSchema.index({ userId: 1, status: 1 });
SavedScholarshipSchema.index({ userId: 1, savedAt: -1 });

const SavedScholarship: Model<ISavedScholarship> = mongoose.models.SavedScholarship || mongoose.model<ISavedScholarship>('SavedScholarship', SavedScholarshipSchema);

export default SavedScholarship;