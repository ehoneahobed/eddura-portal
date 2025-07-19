import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Template categories for different application types
 */
export type TemplateCategory = 'graduate' | 'undergraduate' | 'scholarship' | 'custom';

/**
 * Interface for requirement template items
 */
export interface ITemplateRequirement {
  requirementType: 'document' | 'test_score' | 'fee' | 'interview' | 'other';
  category: 'academic' | 'financial' | 'personal' | 'professional' | 'administrative';
  name: string;
  description?: string;
  isRequired: boolean;
  isOptional: boolean;
  
  // Document-specific
  documentType?: string;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  wordLimit?: number;
  characterLimit?: number;
  
  // Test score-specific
  testType?: string;
  minScore?: number;
  maxScore?: number;
  scoreFormat?: string;
  
  // Application fee-specific
  applicationFeeAmount?: number;
  applicationFeeCurrency?: string;
  applicationFeeDescription?: string;
  
  // Interview-specific
  interviewType?: string;
  interviewDuration?: number;
  interviewNotes?: string;
  
  order: number;
}

/**
 * Interface for requirements templates
 */
export interface IRequirementsTemplate extends Document {
  /** Template name */
  name: string; // e.g., "Graduate School Application", "Undergraduate Application"
  
  /** Template description */
  description?: string;
  
  /** Template category */
  category: TemplateCategory;
  
  /** Template requirements */
  requirements: ITemplateRequirement[];
  
  /** Usage tracking */
  usageCount: number;
  
  /** Whether template is active */
  isActive: boolean;
  
  /** Created by user (for custom templates) */
  createdBy?: mongoose.Types.ObjectId;
  
  /** Whether this is a system template */
  isSystemTemplate: boolean;
  
  /** Tags for categorization */
  tags?: string[];
  
  /** Metadata */
  createdAt: Date;
  updatedAt: Date;
  
  /** Instance methods */
  incrementUsage(): Promise<IRequirementsTemplate>;
  getRequirementsByCategory(category: string): ITemplateRequirement[];
  getRequiredRequirements(): ITemplateRequirement[];
  getOptionalRequirements(): ITemplateRequirement[];
}

const TemplateRequirementSchema = new Schema<ITemplateRequirement>({
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
  
  // Document-specific
  documentType: {
    type: String,
    trim: true
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
  
  // Test score-specific
  testType: {
    type: String,
    trim: true
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
  
  // Application fee-specific
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
  
  // Interview-specific
  interviewType: {
    type: String,
    trim: true
  },
  interviewDuration: {
    type: Number,
    min: 0
  },
  interviewNotes: {
    type: String,
    trim: true
  },
  
  order: {
    type: Number,
    default: 0
  }
}, { _id: false });

const RequirementsTemplateSchema: Schema = new Schema<IRequirementsTemplate>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['graduate', 'undergraduate', 'scholarship', 'custom'],
    required: true
  },
  requirements: [TemplateRequirementSchema],
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  isSystemTemplate: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
RequirementsTemplateSchema.index({ category: 1, isActive: 1 });
RequirementsTemplateSchema.index({ isSystemTemplate: 1, isActive: 1 });
RequirementsTemplateSchema.index({ createdBy: 1 });
RequirementsTemplateSchema.index({ usageCount: -1 });
RequirementsTemplateSchema.index({ name: 1 });

// Virtual populate for creator
RequirementsTemplateSchema.virtual('creator', {
  ref: 'User',
  localField: 'createdBy',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware to validate requirements
RequirementsTemplateSchema.pre('save', function(this: IRequirementsTemplate, next: (error?: Error) => void) {
  // Ensure requirements have unique names within the template
  const requirementNames = this.requirements.map(req => req.name);
  const uniqueNames = new Set(requirementNames);
  
  if (requirementNames.length !== uniqueNames.size) {
    return next(new Error('Requirements must have unique names within a template'));
  }
  
  // Sort requirements by order
  this.requirements.sort((a, b) => a.order - b.order);
  
  next();
});

// Method to increment usage count
RequirementsTemplateSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  return this.save();
};

// Method to get requirements by category
RequirementsTemplateSchema.methods.getRequirementsByCategory = function(category: string) {
  return this.requirements.filter((req: ITemplateRequirement) => req.category === category);
};

// Method to get required requirements
RequirementsTemplateSchema.methods.getRequiredRequirements = function() {
  return this.requirements.filter((req: ITemplateRequirement) => req.isRequired && !req.isOptional);
};

// Method to get optional requirements
RequirementsTemplateSchema.methods.getOptionalRequirements = function() {
  return this.requirements.filter((req: ITemplateRequirement) => req.isOptional);
};

const RequirementsTemplate: Model<IRequirementsTemplate> = mongoose.models.RequirementsTemplate || 
  mongoose.model<IRequirementsTemplate>('RequirementsTemplate', RequirementsTemplateSchema);

export default RequirementsTemplate; 