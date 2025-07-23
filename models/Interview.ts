import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Interview types
 */
export type InterviewType = 'video' | 'phone' | 'in_person';

/**
 * Interview status
 */
export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

/**
 * Interface for interview documents
 */
export interface IInterview extends Document {
  /** Reference to the application this interview belongs to */
  applicationId: mongoose.Types.ObjectId;
  
  /** Type of interview */
  type: InterviewType;
  
  /** Interview status */
  status: InterviewStatus;
  
  /** Scheduled date and time */
  scheduledDate?: Date;
  
  /** Duration in minutes */
  duration?: number;
  
  /** Interviewer name */
  interviewer?: string;
  
  /** Interview location */
  location?: string;
  
  /** Whether this is a virtual interview */
  isVirtual?: boolean;
  
  /** Meeting link for virtual interviews */
  meetingLink?: string;
  
  /** Meeting ID for virtual interviews */
  meetingId?: string;
  
  /** Meeting password for virtual interviews */
  meetingPassword?: string;
  
  /** Additional notes */
  notes?: string;
  
  /** Metadata */
  createdAt: Date;
  updatedAt: Date;
  
  /** Instance methods */
  isUpcoming(): boolean;
  isPast(): boolean;
  updateStatus(newStatus: InterviewStatus, notes?: string): Promise<IInterview>;
}

const InterviewSchema: Schema = new Schema<IInterview>({
  applicationId: {
    type: Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  type: {
    type: String,
    enum: ['video', 'phone', 'in_person'],
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled',
    required: true
  },
  scheduledDate: {
    type: Date
  },
  duration: {
    type: Number,
    min: 0
  },
  interviewer: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  isVirtual: {
    type: Boolean,
    default: false
  },
  meetingLink: {
    type: String,
    trim: true
  },
  meetingId: {
    type: String,
    trim: true
  },
  meetingPassword: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
InterviewSchema.index({ applicationId: 1, status: 1 });
InterviewSchema.index({ applicationId: 1, scheduledDate: 1 });

// Instance methods
InterviewSchema.methods.isUpcoming = function(): boolean {
  if (!this.scheduledDate) return false;
  return this.scheduledDate > new Date() && this.status === 'scheduled';
};

InterviewSchema.methods.isPast = function(): boolean {
  if (!this.scheduledDate) return false;
  return this.scheduledDate < new Date();
};

InterviewSchema.methods.updateStatus = async function(newStatus: InterviewStatus, notes?: string): Promise<IInterview> {
  this.status = newStatus;
  if (notes) {
    this.notes = this.notes ? `${this.notes}\n\n${notes}` : notes;
  }
  return await this.save();
};

// Virtual for formatted scheduled date
InterviewSchema.virtual('formattedScheduledDate').get(function() {
  if (!this.scheduledDate) return null;
  return (this.scheduledDate as Date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Ensure virtuals are included in JSON output
InterviewSchema.set('toJSON', { virtuals: true });
InterviewSchema.set('toObject', { virtuals: true });

const Interview: Model<IInterview> = mongoose.models.Interview || mongoose.model<IInterview>('Interview', InterviewSchema);

export default Interview; 