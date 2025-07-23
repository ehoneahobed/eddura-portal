import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Requirement types for different application components
 */
export type RequirementType = 'document' | 'test_score' | 'fee' | 'interview' | 'other';

/**
 * Categories for organizing requirements
 */
export type RequirementCategory = 'academic' | 'financial' | 'personal' | 'professional' | 'administrative';

/**
 * Document types for document requirements
 */
export type DocumentType = 
  | 'personal_statement' 
  | 'cv' 
  | 'transcript' 
  | 'recommendation_letter' 
  | 'test_scores' 
  | 'portfolio' 
  | 'financial_documents' 
  | 'other';

/**
 * Test types for test score requirements
 */
export type TestType = 'toefl' | 'ielts' | 'gre' | 'gmat' | 'sat' | 'act' | 'other';

/**
 * Interview types
 */
export type InterviewType = 'in-person' | 'virtual' | 'phone' | 'multiple';

/**
 * Requirement status tracking
 */
export type RequirementStatus = 'pending' | 'in_progress' | 'completed' | 'waived' | 'not_applicable';

/**
 * Interface for application requirements
 */
export interface IApplicationRequirement extends Document {
  /** Reference to the application this requirement belongs to */
  applicationId: mongoose.Types.ObjectId;
  
  /** Type of requirement */
  requirementType: RequirementType;
  
  /** Category for organizing requirements */
  category: RequirementCategory;
  
  /** Requirement details */
  name: string; // e.g., "Personal Statement", "TOEFL Score", "Application Fee"
  description?: string;
  isRequired: boolean;
  isOptional: boolean;
  
  /** Document-specific requirements */
  documentType?: DocumentType;
  maxFileSize?: number; // in MB
  allowedFileTypes?: string[];
  wordLimit?: number;
  characterLimit?: number;
  
  /** Test score requirements */
  testType?: TestType;
  minScore?: number;
  maxScore?: number;
  scoreFormat?: string; // e.g., "120 total, 25+ per section"
  
  /** Application fee requirements */
  applicationFeeAmount?: number;
  applicationFeeCurrency?: string;
  applicationFeeDescription?: string;
  applicationFeePaid?: boolean;
  applicationFeePaidAt?: Date;
  
  /** Interview requirements */
  interviewType?: InterviewType;
  interviewDuration?: number; // in minutes
  interviewNotes?: string;
  
  /** Status tracking */
  status: RequirementStatus;
  submittedAt?: Date;
  verifiedAt?: Date;
  notes?: string;
  
  /** Document linking (links to existing documents in user's library) */
  linkedDocumentId?: mongoose.Types.ObjectId; // Reference to existing Document model
  externalUrl?: string; // If stored elsewhere (not in our system)
  taskId?: mongoose.Types.ObjectId; // Associated task
  
  /** Metadata */
  order: number; // Display order
  createdAt: Date;
  updatedAt: Date;
  
  /** Instance methods */
  isComplete(): boolean;
  isRequiredField(): boolean;
  updateStatus(newStatus: RequirementStatus, notes?: string): Promise<IApplicationRequirement>;
}

const ApplicationRequirementSchema: Schema = new Schema<IApplicationRequirement>({
  applicationId: {
    type: Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  requirementType: {
    type: String,
    enum: ['document', 'test_score', 'fee', 'interview', 'other'],
    required: true
  },
  category: {
    type: String,
    enum: ['academic', 'financial', 'personal', 'professional', 'administrative'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isRequired: {
    type: Boolean,
    default: true
  },
  isOptional: {
    type: Boolean,
    default: false
  },
  
  // Document-specific fields
  documentType: {
    type: String,
    enum: ['personal_statement', 'cv', 'transcript', 'recommendation_letter', 'test_scores', 'portfolio', 'financial_documents', 'other']
  },
  maxFileSize: {
    type: Number,
    min: 0
  },
  allowedFileTypes: [{
    type: String,
    trim: true
  }],
  wordLimit: {
    type: Number,
    min: 0
  },
  characterLimit: {
    type: Number,
    min: 0
  },
  
  // Test score-specific fields
  testType: {
    type: String,
    enum: ['toefl', 'ielts', 'gre', 'gmat', 'sat', 'act', 'other']
  },
  minScore: {
    type: Number,
    min: 0
  },
  maxScore: {
    type: Number,
    min: 0
  },
  scoreFormat: {
    type: String,
    trim: true
  },
  
  // Application fee-specific fields
  applicationFeeAmount: {
    type: Number,
    min: 0
  },
  applicationFeeCurrency: {
    type: String,
    trim: true,
    uppercase: true
  },
  applicationFeeDescription: {
    type: String,
    trim: true
  },
  applicationFeePaid: {
    type: Boolean,
    default: false
  },
  applicationFeePaidAt: {
    type: Date
  },
  
  // Interview-specific fields
  interviewType: {
    type: String,
    enum: ['in-person', 'virtual', 'phone', 'multiple']
  },
  interviewDuration: {
    type: Number,
    min: 0
  },
  interviewNotes: {
    type: String,
    trim: true
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'waived', 'not_applicable'],
    default: 'pending',
    required: true
  },
  submittedAt: {
    type: Date
  },
  verifiedAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  
  // Document linking
  linkedDocumentId: {
    type: Schema.Types.ObjectId,
    ref: 'Document'
  },
  externalUrl: {
    type: String,
    trim: true
  },
  taskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task'
  },
  
  // Metadata
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
ApplicationRequirementSchema.index({ applicationId: 1, order: 1 });
ApplicationRequirementSchema.index({ applicationId: 1, status: 1 });
ApplicationRequirementSchema.index({ applicationId: 1, category: 1 });
ApplicationRequirementSchema.index({ applicationId: 1, requirementType: 1 });
ApplicationRequirementSchema.index({ linkedDocumentId: 1 });
ApplicationRequirementSchema.index({ taskId: 1 });

// Virtual populate for related data
ApplicationRequirementSchema.virtual('application', {
  ref: 'Application',
  localField: 'applicationId',
  foreignField: '_id',
  justOne: true
});

ApplicationRequirementSchema.virtual('linkedDocument', {
  ref: 'Document',
  localField: 'linkedDocumentId',
  foreignField: '_id',
  justOne: true
});

ApplicationRequirementSchema.virtual('task', {
  ref: 'Task',
  localField: 'taskId',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware to validate requirement-specific fields
ApplicationRequirementSchema.pre('save', function(this: IApplicationRequirement, next: (error?: Error) => void) {
  // Validate document-specific fields
  if (this.requirementType === 'document' && !this.documentType) {
    return next(new Error('Document type is required for document requirements'));
  }
  
  // Validate test score-specific fields
  if (this.requirementType === 'test_score' && !this.testType) {
    return next(new Error('Test type is required for test score requirements'));
  }
  
  // Validate fee-specific fields
  if (this.requirementType === 'fee' && !this.applicationFeeAmount) {
    return next(new Error('Fee amount is required for fee requirements'));
  }
  
  // Validate interview-specific fields
  if (this.requirementType === 'interview' && !this.interviewType) {
    return next(new Error('Interview type is required for interview requirements'));
  }
  
  next();
});

// Method to check if requirement is complete
ApplicationRequirementSchema.methods.isComplete = function(): boolean {
  return this.status === 'completed' || this.status === 'waived' || this.status === 'not_applicable';
};

// Method to check if requirement is required
ApplicationRequirementSchema.methods.isRequiredField = function(): boolean {
  return this.isRequired && !this.isOptional;
};

// Method to update status
ApplicationRequirementSchema.methods.updateStatus = function(newStatus: RequirementStatus, notes?: string) {
  this.status = newStatus;
  if (notes) this.notes = notes;
  
  if (newStatus === 'completed') {
    this.submittedAt = new Date();
  }
  
  return this.save();
};

const ApplicationRequirement: Model<IApplicationRequirement> = mongoose.models.ApplicationRequirement || 
  mongoose.model<IApplicationRequirement>('ApplicationRequirement', ApplicationRequirementSchema);

export default ApplicationRequirement; 