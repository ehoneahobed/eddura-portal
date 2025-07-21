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

export type ApplicationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ApplicationPhase = 'interest' | 'preparation' | 'application' | 'interview' | 'decision' | 'accepted' | 'rejected';

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
  applicationType: 'scholarship' | 'school' | 'program' | 'external';
  
  // Target identification (flexible for internal/external)
  targetId?: string; // Generic target ID for any type
  targetName?: string; // Human-readable target name
  scholarshipId?: mongoose.Types.ObjectId;
  schoolId?: mongoose.Types.ObjectId;
  programId?: mongoose.Types.ObjectId;
  
  // External application support
  isExternal?: boolean;
  externalSchoolName?: string;
  externalProgramName?: string;
  externalScholarshipName?: string;
  externalApplicationUrl?: string;
  externalType?: 'program' | 'scholarship' | 'school';
  
  // Application package details
  name: string; // e.g., "MIT Computer Science Application"
  description?: string;
  applicationTemplateId?: mongoose.Types.ObjectId; // Made optional
  status: ApplicationStatus;
  priority: ApplicationPriority;
  
  // Requirements management
  requirements: mongoose.Types.ObjectId[]; // References to ApplicationRequirement
  requirementsProgress: {
    total: number;
    completed: number;
    required: number;
    requiredCompleted: number;
    optional: number;
    optionalCompleted: number;
  };
  
  // Interview management
  requiresInterview?: boolean;
  interviewScheduled?: boolean;
  interviewDate?: Date;
  interviewType?: 'in-person' | 'virtual' | 'phone';
  interviewNotes?: string;
  interviewStatus?: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  
  // Timeline and deadlines
  applicationDeadline?: Date;
  decisionDate?: Date;
  appliedAt?: Date;
  decision?: 'accepted' | 'rejected' | 'waitlisted' | 'conditional';
  
  // Scholarship integration
  linkedScholarships?: {
    scholarshipId: mongoose.Types.ObjectId;
    scholarshipName: string;
    status: 'interested' | 'applied' | 'awarded' | 'rejected';
    applicationId?: mongoose.Types.ObjectId; // Separate application for scholarship
  }[];
  
  // Progress tracking
  progress: number; // 0-100%
  currentPhase: ApplicationPhase;
  
  // Form responses (for internal applications)
  sections: ISectionResponse[];
  currentSectionId?: string;  // Current section being worked on
  
  // Legacy fields for backward compatibility
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
  applicationType: {
    type: String,
    enum: ['scholarship', 'school', 'program', 'external'],
    required: true
  },
  
  // Target identification (flexible for internal/external)
  targetId: { type: String, trim: true },
  targetName: { type: String, trim: true },
  scholarshipId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Scholarship'
  },
  schoolId: { 
    type: Schema.Types.ObjectId, 
    ref: 'School'
  },
  programId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Program'
  },
  
  // External application support
  isExternal: { type: Boolean, default: false },
  externalSchoolName: { type: String, trim: true },
  externalProgramName: { type: String, trim: true },
  externalScholarshipName: { type: String, trim: true },
  externalApplicationUrl: { type: String, trim: true },
  externalType: {
    type: String,
    enum: ['program', 'scholarship', 'school']
  },
  
  // Application package details
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  applicationTemplateId: { 
    type: Schema.Types.ObjectId, 
    ref: 'ApplicationTemplate'
  },
  status: { 
    type: String, 
    enum: ['draft', 'in_progress', 'submitted', 'under_review', 'approved', 'rejected', 'waitlisted', 'withdrawn'],
    default: 'draft',
    required: true 
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Requirements management
  requirements: [{
    type: Schema.Types.ObjectId,
    ref: 'ApplicationRequirement'
  }],
  requirementsProgress: {
    total: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    required: { type: Number, default: 0 },
    requiredCompleted: { type: Number, default: 0 },
    optional: { type: Number, default: 0 },
    optionalCompleted: { type: Number, default: 0 }
  },
  
  // Interview management
  requiresInterview: { type: Boolean, default: false },
  interviewScheduled: { type: Boolean, default: false },
  interviewDate: { type: Date },
  interviewType: {
    type: String,
    enum: ['in-person', 'virtual', 'phone']
  },
  interviewNotes: { type: String, trim: true },
  interviewStatus: {
    type: String,
    enum: ['pending', 'scheduled', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Timeline and deadlines
  applicationDeadline: { type: Date },
  decisionDate: { type: Date },
  appliedAt: { type: Date },
  decision: {
    type: String,
    enum: ['accepted', 'rejected', 'waitlisted', 'conditional']
  },
  
  // Scholarship integration
  linkedScholarships: [{
    scholarshipId: { type: Schema.Types.ObjectId, ref: 'Scholarship' },
    scholarshipName: { type: String, trim: true },
    status: {
      type: String,
      enum: ['interested', 'applied', 'awarded', 'rejected'],
      default: 'interested'
    },
    applicationId: { type: Schema.Types.ObjectId, ref: 'Application' }
  }],
  
  // Progress tracking
  progress: { 
    type: Number, 
    default: 0, 
    min: 0, 
    max: 100 
  },
  currentPhase: {
    type: String,
    enum: ['interest', 'preparation', 'application', 'interview', 'decision', 'accepted', 'rejected'],
    default: 'interest'
  },
  
  // Form responses (for internal applications)
  sections: [SectionResponseSchema],
  currentSectionId: { type: String },
  
  // Legacy fields for backward compatibility
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
ApplicationSchema.index({ userId: 1, applicationType: 1 });
ApplicationSchema.index({ userId: 1, status: 1 });
ApplicationSchema.index({ userId: 1, priority: 1 });
ApplicationSchema.index({ userId: 1, currentPhase: 1 });
ApplicationSchema.index({ scholarshipId: 1, status: 1 });
ApplicationSchema.index({ schoolId: 1, status: 1 });
ApplicationSchema.index({ programId: 1, status: 1 });
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ priority: 1 });
ApplicationSchema.index({ currentPhase: 1 });
ApplicationSchema.index({ applicationDeadline: 1 });
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

ApplicationSchema.virtual('school', {
  ref: 'School',
  localField: 'schoolId',
  foreignField: '_id',
  justOne: true
});

ApplicationSchema.virtual('program', {
  ref: 'Program',
  localField: 'programId',
  foreignField: '_id',
  justOne: true
});

ApplicationSchema.virtual('applicationTemplate', {
  ref: 'ApplicationTemplate',
  localField: 'applicationTemplateId',
  foreignField: '_id',
  justOne: true
});

ApplicationSchema.virtual('applicationRequirements', {
  ref: 'ApplicationRequirement',
  localField: 'requirements',
  foreignField: '_id'
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