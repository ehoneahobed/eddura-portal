import mongoose, { Schema, Document } from 'mongoose';

export type ActivityType = 
  | 'quiz_completed'
  | 'quiz_retaken'
  | 'program_viewed'
  | 'scholarship_viewed'
  | 'application_started'
  | 'application_submitted'
  | 'document_uploaded'
  | 'profile_updated'
  | 'recommendation_viewed'
  | 'login';

export interface IUserActivity extends Document {
  userId: mongoose.Types.ObjectId;
  type: ActivityType;
  title: string;
  description: string;
  metadata?: {
    quizScore?: number;
    programId?: string;
    programName?: string;
    scholarshipId?: string;
    scholarshipName?: string;
    applicationId?: string;
    applicationName?: string;
    documentType?: string;
    documentName?: string;
    recommendationType?: string;
    [key: string]: any;
  };
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserActivitySchema = new Schema<IUserActivity>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'quiz_completed',
      'quiz_retaken',
      'program_viewed',
      'scholarship_viewed',
      'application_started',
      'application_submitted',
      'document_uploaded',
      'profile_updated',
      'recommendation_viewed',
      'login'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient querying of user activities
UserActivitySchema.index({ userId: 1, timestamp: -1 });
UserActivitySchema.index({ userId: 1, type: 1, timestamp: -1 });

const UserActivity = mongoose.models.UserActivity || mongoose.model<IUserActivity>('UserActivity', UserActivitySchema);

export default UserActivity;