import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * UserInterest interface representing a user's interest in a program, school, or scholarship
 */
export interface IUserInterest extends Document {
  /** Reference to the user */
  userId: mongoose.Types.ObjectId;
  
  // Target identification (flexible for internal/external)
  /** For programs in our system */
  programId?: mongoose.Types.ObjectId;
  /** For schools in our system */
  schoolId?: mongoose.Types.ObjectId;
  /** For external schools */
  schoolName?: string;
  /** For external programs */
  programName?: string;
  /** External application link */
  applicationUrl?: string;
  
  // Interest tracking
  /** Current status of the interest */
  status: 'interested' | 'preparing' | 'applied' | 'interviewed' | 'accepted' | 'rejected' | 'waitlisted';
  /** Priority level */
  priority: 'high' | 'medium' | 'low';
  /** Additional notes */
  notes?: string;
  
  // Interview tracking
  /** Whether interview is required */
  requiresInterview?: boolean;
  /** Whether interview is scheduled */
  interviewScheduled?: boolean;
  /** Interview date */
  interviewDate?: Date;
  /** Type of interview */
  interviewType?: 'in-person' | 'virtual' | 'phone';
  /** Interview notes */
  interviewNotes?: string;
  
  // Timeline
  /** When the interest was created */
  createdAt: Date;
  /** When the interest was last updated */
  updatedAt: Date;
  /** When the application was submitted */
  appliedAt?: Date;
  /** Expected decision date */
  decisionDate?: Date;
}

const UserInterestSchema: Schema = new Schema<IUserInterest>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Target identification
  programId: { type: Schema.Types.ObjectId, ref: 'Program' },
  schoolId: { type: Schema.Types.ObjectId, ref: 'School' },
  schoolName: { type: String, trim: true },
  programName: { type: String, trim: true },
  applicationUrl: { type: String, trim: true },
  
  // Interest tracking
  status: {
    type: String,
    enum: ['interested', 'preparing', 'applied', 'interviewed', 'accepted', 'rejected', 'waitlisted'],
    default: 'interested',
    required: true
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium',
    required: true
  },
  notes: { type: String, trim: true },
  
  // Interview tracking
  requiresInterview: { type: Boolean, default: false },
  interviewScheduled: { type: Boolean, default: false },
  interviewDate: { type: Date },
  interviewType: {
    type: String,
    enum: ['in-person', 'virtual', 'phone']
  },
  interviewNotes: { type: String, trim: true },
  
  // Timeline
  appliedAt: { type: Date },
  decisionDate: { type: Date }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate for program information
UserInterestSchema.virtual('program', {
  ref: 'Program',
  localField: 'programId',
  foreignField: '_id',
  justOne: true
});

// Virtual populate for school information
UserInterestSchema.virtual('school', {
  ref: 'School',
  localField: 'schoolId',
  foreignField: '_id',
  justOne: true
});

// Indexes for better query performance
UserInterestSchema.index({ userId: 1, status: 1 });
UserInterestSchema.index({ userId: 1, priority: 1 });
UserInterestSchema.index({ userId: 1, createdAt: -1 });
UserInterestSchema.index({ programId: 1 });
UserInterestSchema.index({ schoolId: 1 });

const UserInterest: Model<IUserInterest> = mongoose.models.UserInterest || mongoose.model<IUserInterest>('UserInterest', UserInterestSchema);

export default UserInterest;