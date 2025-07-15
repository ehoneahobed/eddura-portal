import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Application types
 */
export type ApplicationType = 'school' | 'program' | 'scholarship';

/**
 * Enhanced application status types for comprehensive tracking
 */
export type ApplicationStatus = 
  | 'not_started'      // Haven't started the application yet
  | 'researching'       // Researching the opportunity
  | 'draft'            // Application is being worked on
  | 'in_progress'      // Application is partially completed
  | 'waiting_for_documents' // Waiting for documents/transcripts
  | 'waiting_for_recommendations' // Waiting for recommendation letters
  | 'waiting_for_test_scores' // Waiting for test scores (GRE, TOEFL, etc.)
  | 'ready_to_submit'  // All materials ready, ready to submit
  | 'submitted'        // Application has been submitted
  | 'under_review'     // Application is being reviewed
  | 'interview_scheduled' // Interview has been scheduled
  | 'interview_completed' // Interview completed, waiting for decision
  | 'waiting_for_feedback' // Waiting for feedback/decision
  | 'need_to_follow_up' // Need to follow up with school/professor
  | 'approved'         // Application has been approved
  | 'rejected'         // Application has been rejected
  | 'waitlisted'       // Application is on waitlist
  | 'deferred'         // Application has been deferred
  | 'withdrawn';       // Application has been withdrawn

/**
 * Task interface for tracking action items
 */
export interface ITask {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  category: 'document' | 'test' | 'recommendation' | 'follow_up' | 'interview' | 'other';
  completedAt?: Date;
  notes?: string;
}

/**
 * Communication log interface
 */
export interface ICommunication {
  id: string;
  type: 'email' | 'phone' | 'in_person' | 'portal_message';
  subject: string;
  content: string;
  date: Date;
  withWhom: string;
  outcome?: string;
  followUpRequired: boolean;
  followUpDate?: Date;
}

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
  applicationType: ApplicationType;
  
  // References to different types of opportunities
  scholarshipId?: mongoose.Types.ObjectId;
  schoolId?: mongoose.Types.ObjectId;
  programId?: mongoose.Types.ObjectId;
  
  // Application details
  title: string; // Custom title for the application
  description?: string;
  applicationTemplateId?: mongoose.Types.ObjectId;
  status: ApplicationStatus;
  
  // Deadlines and important dates
  applicationDeadline: Date;
  earlyDecisionDeadline?: Date;
  regularDecisionDeadline?: Date;
  rollingDeadline?: boolean;
  
  // Progress tracking
  sections: ISectionResponse[];
  currentSectionId?: string;
  progress: number; // Overall progress percentage (0-100)
  
  // Timestamps
  startedAt: Date;
  lastActivityAt: Date;
  submittedAt?: Date;
  completedAt?: Date;
  
  // Task and communication management
  tasks: ITask[];
  communications: ICommunication[];
  
  // Additional metadata
  estimatedTimeRemaining?: number; // in minutes
  notes?: string; // User notes about the application
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[]; // Custom tags for organization
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'completed', 'overdue'],
    default: 'pending'
  },
  category: { 
    type: String, 
    enum: ['document', 'test', 'recommendation', 'follow_up', 'interview', 'other'],
    required: true
  },
  completedAt: { type: Date },
  notes: { type: String }
});

const CommunicationSchema = new Schema<ICommunication>({
  id: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['email', 'phone', 'in_person', 'portal_message'],
    required: true
  },
  subject: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
  withWhom: { type: String, required: true },
  outcome: { type: String },
  followUpRequired: { type: Boolean, default: false },
  followUpDate: { type: Date }
});

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
    enum: ['school', 'program', 'scholarship'],
    required: true 
  },
  
  // References to different types of opportunities
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
  
  // Application details
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  applicationTemplateId: { 
    type: Schema.Types.ObjectId, 
    ref: 'ApplicationTemplate'
  },
  status: { 
    type: String, 
    enum: [
      'not_started', 'researching', 'draft', 'in_progress', 
      'waiting_for_documents', 'waiting_for_recommendations', 
      'waiting_for_test_scores', 'ready_to_submit', 'submitted', 
      'under_review', 'interview_scheduled', 'interview_completed',
      'waiting_for_feedback', 'need_to_follow_up', 'approved', 
      'rejected', 'waitlisted', 'deferred', 'withdrawn'
    ],
    default: 'not_started',
    required: true 
  },
  
  // Deadlines and important dates
  applicationDeadline: { type: Date, required: true },
  earlyDecisionDeadline: { type: Date },
  regularDecisionDeadline: { type: Date },
  rollingDeadline: { type: Boolean, default: false },
  
  // Progress tracking
  sections: [SectionResponseSchema],
  currentSectionId: { type: String },
  progress: { 
    type: Number, 
    default: 0, 
    min: 0, 
    max: 100 
  },
  
  // Timestamps
  startedAt: { type: Date, default: Date.now },
  lastActivityAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },
  completedAt: { type: Date },
  
  // Task and communication management
  tasks: [TaskSchema],
  communications: [CommunicationSchema],
  
  // Additional metadata
  estimatedTimeRemaining: { type: Number, min: 0 },
  notes: { type: String, trim: true },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  tags: [{ type: String, trim: true }],
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
ApplicationSchema.index({ applicationDeadline: 1 });
ApplicationSchema.index({ lastActivityAt: -1 });
ApplicationSchema.index({ createdAt: -1 });
ApplicationSchema.index({ tags: 1 });

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

// Method to get overdue tasks
ApplicationSchema.methods.getOverdueTasks = function(this: IApplication): ITask[] {
  const now = new Date();
  return this.tasks.filter(task => 
    task.status !== 'completed' && 
    task.dueDate && 
    task.dueDate < now
  );
};

// Method to get upcoming deadlines
ApplicationSchema.methods.getUpcomingDeadlines = function(this: IApplication): { type: string; date: Date }[] {
  const deadlines = [];
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  if (this.applicationDeadline && this.applicationDeadline > now && this.applicationDeadline <= thirtyDaysFromNow) {
    deadlines.push({ type: 'Application Deadline', date: this.applicationDeadline });
  }
  
  if (this.earlyDecisionDeadline && this.earlyDecisionDeadline > now && this.earlyDecisionDeadline <= thirtyDaysFromNow) {
    deadlines.push({ type: 'Early Decision Deadline', date: this.earlyDecisionDeadline });
  }
  
  if (this.regularDecisionDeadline && this.regularDecisionDeadline > now && this.regularDecisionDeadline <= thirtyDaysFromNow) {
    deadlines.push({ type: 'Regular Decision Deadline', date: this.regularDecisionDeadline });
  }
  
  return deadlines.sort((a, b) => a.date.getTime() - b.date.getTime());
};

const Application: Model<IApplication> = mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);

export default Application;