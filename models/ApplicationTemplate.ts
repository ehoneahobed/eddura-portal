import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Question types available for application forms
 */
export type QuestionType = 
  | 'text'           // Short text input
  | 'textarea'       // Long text input
  | 'email'          // Email input
  | 'phone'          // Phone number input
  | 'number'         // Numeric input
  | 'date'           // Date picker
  | 'select'         // Single choice dropdown
  | 'multiselect'    // Multiple choice dropdown
  | 'radio'          // Single choice radio buttons
  | 'checkbox'       // Multiple choice checkboxes
  | 'file'           // File upload
  | 'url'            // URL input
  | 'address'        // Address input
  | 'education'      // Education history
  | 'experience'     // Work experience
  | 'reference'      // Reference contact
  | 'essay'          // Essay/long form response
  | 'statement'      // Personal statement
  | 'gpa'            // GPA input with validation
  | 'test_score';    // Test scores (SAT, GRE, etc.)

/**
 * Interface for individual question options (for select, radio, checkbox types)
 */
export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
}

/**
 * Interface for file upload configuration
 */
export interface FileUploadConfig {
  allowedTypes: string[];  // e.g., ['pdf', 'doc', 'docx']
  maxSize: number;         // in MB
  maxFiles?: number;       // number of files allowed
  description?: string;    // description of what files are expected
}

/**
 * Interface for validation rules
 */
export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'email' | 'url' | 'phone' | 'gpa' | 'test_score';
  value?: string | number;
  message: string;
}

/**
 * Interface for a single question in the application form
 */
export interface IQuestion {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  order: number;
  options?: QuestionOption[];
  fileConfig?: FileUploadConfig;
  validation?: ValidationRule[];
  conditional?: {
    dependsOn: string;  // ID of the question this depends on
    condition: 'equals' | 'not_equals' | 'contains' | 'not_contains';
    value: string;
  };
  helpText?: string;
  maxLength?: number;
  minLength?: number;
  defaultValue?: string | number | boolean;
  group?: string;  // For grouping related questions
}

/**
 * Interface for application form template sections
 */
export interface IFormSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  questions: IQuestion[];
  isRepeatable?: boolean;  // For sections that can be repeated (e.g., work experience)
  maxRepeats?: number;     // Maximum number of times this section can be repeated
}

/**
 * Main interface for application form template
 */
export interface IApplicationTemplate extends Document {
  scholarshipId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  version: string;
  isActive: boolean;
  sections: IFormSection[];
  estimatedTime: number;  // Estimated time to complete in minutes
  instructions?: string;  // General instructions for applicants
  submissionDeadline?: Date;
  allowDraftSaving: boolean;
  requireEmailVerification: boolean;
  requirePhoneVerification: boolean;
  maxFileSize: number;  // Maximum file size in MB
  allowedFileTypes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const QuestionOptionSchema = new Schema<QuestionOption>({
  value: { type: String, required: true },
  label: { type: String, required: true },
  description: { type: String }
});

const FileUploadConfigSchema = new Schema<FileUploadConfig>({
  allowedTypes: [{ type: String, required: true }],
  maxSize: { type: Number, required: true, min: 1 },
  maxFiles: { type: Number, min: 1 },
  description: { type: String }
});

const ValidationRuleSchema = new Schema<ValidationRule>({
  type: { 
    type: String, 
    required: true,
    enum: ['required', 'min', 'max', 'pattern', 'email', 'url', 'phone', 'gpa', 'test_score']
  },
  value: { type: Schema.Types.Mixed },
  message: { type: String, required: true }
});

const QuestionSchema = new Schema<IQuestion>({
  id: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['text', 'textarea', 'email', 'phone', 'number', 'date', 'select', 'multiselect', 'radio', 'checkbox', 'file', 'url', 'address', 'education', 'experience', 'reference', 'essay', 'statement', 'gpa', 'test_score']
  },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  placeholder: { type: String, trim: true },
  required: { type: Boolean, default: false },
  order: { type: Number, required: true },
  options: [QuestionOptionSchema],
  fileConfig: FileUploadConfigSchema,
  validation: [ValidationRuleSchema],
  conditional: {
    dependsOn: { type: String },
    condition: { 
      type: String, 
      enum: ['equals', 'not_equals', 'contains', 'not_contains']
    },
    value: { type: String }
  },
  helpText: { type: String, trim: true },
  maxLength: { type: Number, min: 1 },
  minLength: { type: Number, min: 1 },
  defaultValue: { type: Schema.Types.Mixed },
  group: { type: String, trim: true }
});

const FormSectionSchema = new Schema<IFormSection>({
  id: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  order: { type: Number, required: true },
  questions: [QuestionSchema],
  isRepeatable: { type: Boolean, default: false },
  maxRepeats: { type: Number, min: 1 }
});

const ApplicationTemplateSchema: Schema = new Schema<IApplicationTemplate>({
  scholarshipId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Scholarship', 
    required: true 
  },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  version: { type: String, required: true, default: '1.0.0' },
  isActive: { type: Boolean, default: true },
  sections: [FormSectionSchema],
  estimatedTime: { type: Number, required: true, min: 1 },
  instructions: { type: String, trim: true },
  submissionDeadline: { type: Date },
  allowDraftSaving: { type: Boolean, default: true },
  requireEmailVerification: { type: Boolean, default: false },
  requirePhoneVerification: { type: Boolean, default: false },
  maxFileSize: { type: Number, default: 10, min: 1 },  // 10MB default
  allowedFileTypes: [{ type: String, trim: true }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
ApplicationTemplateSchema.index({ scholarshipId: 1 });
ApplicationTemplateSchema.index({ isActive: 1 });
ApplicationTemplateSchema.index({ createdAt: -1 });

// Virtual populate for scholarship information
ApplicationTemplateSchema.virtual('scholarship', {
  ref: 'Scholarship',
  localField: 'scholarshipId',
  foreignField: '_id',
  justOne: true
});

const ApplicationTemplate: Model<IApplicationTemplate> = mongoose.models.ApplicationTemplate || mongoose.model<IApplicationTemplate>('ApplicationTemplate', ApplicationTemplateSchema);

export default ApplicationTemplate; 