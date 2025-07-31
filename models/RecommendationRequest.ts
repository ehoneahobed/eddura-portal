import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * RecommendationRequest interface representing a request for a recommendation letter
 */
export interface IRecommendationRequest extends Document {
  // References
  studentId: mongoose.Types.ObjectId; // Reference to User
  recipientId: mongoose.Types.ObjectId; // Reference to Recipient
  applicationId?: mongoose.Types.ObjectId; // Optional reference to application
  scholarshipId?: mongoose.Types.ObjectId; // Optional reference to scholarship
  
  // Request Details
  title: string;
  description: string;
  deadline: Date;
  priority: 'low' | 'medium' | 'high';
  
  // Recipient Preferences
  includeDraft: boolean;
  draftContent?: string;
  
  // Status Tracking
  status: 'pending' | 'sent' | 'received' | 'overdue' | 'cancelled';
  sentAt?: Date;
  receivedAt?: Date;
  
  // Reminder Settings
  reminderIntervals: number[]; // Days before deadline
  lastReminderSent?: Date;
  nextReminderDate?: Date;
  
  // Communication
  secureToken: string;
  tokenExpiresAt: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * RecommendationRequest schema for MongoDB
 */
const recommendationRequestSchema = new Schema<IRecommendationRequest>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  recipientId: {
    type: Schema.Types.ObjectId,
    ref: 'Recipient',
    required: true,
    index: true,
  },
  applicationId: {
    type: Schema.Types.ObjectId,
    ref: 'Application',
    index: true,
  },
  scholarshipId: {
    type: Schema.Types.ObjectId,
    ref: 'Scholarship',
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  deadline: {
    type: Date,
    required: true,
    index: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  includeDraft: {
    type: Boolean,
    default: false,
  },
  draftContent: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'received', 'overdue', 'cancelled'],
    default: 'pending',
    index: true,
  },
  sentAt: {
    type: Date,
  },
  receivedAt: {
    type: Date,
  },
  reminderIntervals: {
    type: [Number],
    default: [7, 3, 1], // 7 days, 3 days, 1 day before deadline
  },
  lastReminderSent: {
    type: Date,
  },
  nextReminderDate: {
    type: Date,
    index: true,
  },
  secureToken: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  tokenExpiresAt: {
    type: Date,
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

// Indexes for efficient querying
recommendationRequestSchema.index({ studentId: 1, status: 1 });
recommendationRequestSchema.index({ recipientId: 1, status: 1 });
recommendationRequestSchema.index({ deadline: 1, status: 1 });
recommendationRequestSchema.index({ nextReminderDate: 1, status: 1 });
recommendationRequestSchema.index({ createdAt: -1 });

// Virtual for checking if request is overdue
recommendationRequestSchema.virtual('isOverdue').get(function() {
  return this.deadline < new Date() && this.status !== 'received' && this.status !== 'cancelled';
});

// Virtual for days until deadline
recommendationRequestSchema.virtual('daysUntilDeadline').get(function() {
  const now = new Date();
  const deadline = new Date(this.deadline);
  const diffTime = deadline.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to update status based on deadline
recommendationRequestSchema.pre('save', function(next) {
  if (this.isModified('deadline') || this.isModified('status')) {
    const now = new Date();
    if (this.deadline < now && this.status !== 'received' && this.status !== 'cancelled') {
      this.status = 'overdue';
    }
  }
  next();
});

export const RecommendationRequest: Model<IRecommendationRequest> = mongoose.models.RecommendationRequest || mongoose.model<IRecommendationRequest>('RecommendationRequest', recommendationRequestSchema);

export default RecommendationRequest;