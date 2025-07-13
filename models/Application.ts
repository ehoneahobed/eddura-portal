import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Application status types
 */
export type ApplicationStatus = 
  | 'draft'           // Application is being worked on
  | 'in_progress'     // Application is partially completed
  | 'submitted'       // Application has been submitted
  | 'under_review'    // Application is being reviewed
  | 'approved'        // Application has been approved
  | 'rejected'        // Application has been rejected
  | 'waitlisted'      // Application is on waitlist
  | 'withdrawn';      // Application has been withdrawn

/**
 * Interface for individual question responses
 */
export interface IQuestionResponse {
  questionId: string;
  value: string | string[] | number | boolean | Date;
  files?: string[];  // Array of file URLs
  timestamp: Date;
  isComplete: boolean;
}

/**
 * Interface for section responses
 */
export interface ISectionResponse {
  sectionId: string;
  responses: IQuestionResponse[];
  isComplete: boolean;
  startedAt: Date;
  completedAt?: Date;
}

/**
 * Main interface for user applications
 */
export interface IApplication extends Document {
  userId: mongoose.Types.ObjectId;
  scholarshipId: mongoose.Types.ObjectId;
  applicationTemplateId: mongoose.Types.ObjectId;
  status: ApplicationStatus;
  sections: ISectionResponse[];
  currentSectionId?: string;  // Current section being worked on
  progress: number;  // Overall progress percentage (0-100)
  startedAt: Date;
  lastActivityAt: Date;
  submittedAt?: Date;
  completedAt?: Date;
  estimatedTimeRemaining?: number;  // in minutes
  notes?: string;  // User notes about the application
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionResponseSchema = new Schema<IQuestionResponse>({
  questionId: { type: String, required: true },
  value: { type: Schema.Types.Mixed, required: true },
  files: [{ type: String }],  // Array of file URLs
  timestamp: { type: Date, default: Date.now },
  isComplete: { type: Boolean, default: false }
});

const SectionResponseSchema = new Schema<ISectionResponse>({
  sectionId: { type: String, required: true },
  responses: [QuestionResponseSchema],
  isComplete: { type: Boolean, default: false },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

const ApplicationSchema: Schema = new Schema<IApplication>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  scholarshipId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Scholarship', 
    required: true 
  },
  applicationTemplateId: { 
    type: Schema.Types.ObjectId, 
    ref: 'ApplicationTemplate', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['draft', 'in_progress', 'submitted', 'under_review', 'approved', 'rejected', 'waitlisted', 'withdrawn'],
    default: 'draft',
    required: true 
  },
  sections: [SectionResponseSchema],
  currentSectionId: { type: String },
  progress: { 
    type: Number, 
    default: 0, 
    min: 0, 
    max: 100 
  },
  startedAt: { type: Date, default: Date.now },
  lastActivityAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },
  completedAt: { type: Date },
  estimatedTimeRemaining: { type: Number, min: 0 },
  notes: { type: String, trim: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
ApplicationSchema.index({ userId: 1, scholarshipId: 1 }, { unique: true });
ApplicationSchema.index({ userId: 1, status: 1 });
ApplicationSchema.index({ scholarshipId: 1, status: 1 });
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ lastActivityAt: -1 });
ApplicationSchema.index({ createdAt: -1 });

// Virtual populate for related data
ApplicationSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

ApplicationSchema.virtual('scholarship', {
  ref: 'Scholarship',
  localField: 'scholarshipId',
  foreignField: '_id',
  justOne: true
});

ApplicationSchema.virtual('applicationTemplate', {
  ref: 'ApplicationTemplate',
  localField: 'applicationTemplateId',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware to update lastActivityAt
ApplicationSchema.pre('save', function(this: IApplication, next: () => void) {
  this.lastActivityAt = new Date();
  next();
});

// Method to calculate progress
ApplicationSchema.methods.calculateProgress = function(this: IApplication): number {
  if (!this.sections || this.sections.length === 0) return 0;
  
  const completedSections = this.sections.filter((section: ISectionResponse) => section.isComplete).length;
  return Math.round((completedSections / this.sections.length) * 100);
};

// Method to get current section
ApplicationSchema.methods.getCurrentSection = function(this: IApplication) {
  if (!this.currentSectionId) return null;
  return this.sections.find((section: ISectionResponse) => section.sectionId === this.currentSectionId);
};

// Method to get next section
ApplicationSchema.methods.getNextSection = function(this: IApplication) {
  // This method would need to be implemented in the application logic
  // since we can't access the populated applicationTemplate here
  return null;
};

// Method to get previous section
ApplicationSchema.methods.getPreviousSection = function(this: IApplication) {
  // This method would need to be implemented in the application logic
  // since we can't access the populated applicationTemplate here
  return null;
};

const Application: Model<IApplication> = mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);

export default Application;