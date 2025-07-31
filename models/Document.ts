import mongoose, { Schema, Document as MongooseDocument, Model, CallbackWithoutResult } from 'mongoose';

/**
 * StudentDocument interface representing a student document in the Eddura platform
 */
export interface IStudentDocument extends MongooseDocument {
  // Basic Information
  userId: mongoose.Types.ObjectId;
  title: string;
  type: DocumentType;
  content?: string;
  version: number;
  isActive: boolean;
  
  // Metadata
  description?: string;
  tags?: string[];
  targetProgram?: string;
  targetScholarship?: string;
  targetInstitution?: string;
  
  // Document-specific fields
  wordCount?: number;
  characterCount?: number;
  lastEditedAt: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // File upload fields (for upload-based document types)
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
}

import { DocumentType, DOCUMENT_TYPE_CONFIG } from '@/types/documents';



const DocumentSchema: Schema = new Schema<IStudentDocument>({
  // Basic Information
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  type: {
    type: String,
    enum: Object.values(DocumentType),
    required: true
  },
  content: {
    type: String,
    required: false,
    trim: true
  },
  version: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Metadata
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  targetProgram: {
    type: String,
    trim: true,
    maxlength: 200
  },
  targetScholarship: {
    type: String,
    trim: true,
    maxlength: 200
  },
  targetInstitution: {
    type: String,
    trim: true,
    maxlength: 200
  },
  
  // Document-specific fields
  wordCount: {
    type: Number,
    min: 0,
    default: 0
  },
  characterCount: {
    type: Number,
    min: 0,
    default: 0
  },
  lastEditedAt: {
    type: Date,
    default: Date.now
  },

  // File upload fields (for upload-based document types)
  fileUrl: {
    type: String,
    trim: true,
    default: null,
  },
  fileType: {
    type: String,
    trim: true,
    default: null,
  },
  fileSize: {
    type: Number,
    default: null,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for document type configuration
DocumentSchema.virtual('typeConfig').get(function() {
  return DOCUMENT_TYPE_CONFIG[this.type as DocumentType];
});

// Virtual for document category
DocumentSchema.virtual('category').get(function() {
  return DOCUMENT_TYPE_CONFIG[this.type as DocumentType]?.category || 'other';
});

// Pre-save middleware to update word and character counts
DocumentSchema.pre('save', function(this: IStudentDocument, next: any) {
  if ((this as any).isModified('content')) {
    if (this.content && this.content.trim().length > 0) {
      this.wordCount = this.content.trim().split(/\s+/).filter(word => word.length > 0).length;
      this.characterCount = this.content.length;
    } else {
      this.wordCount = 0;
      this.characterCount = 0;
    }
    this.lastEditedAt = new Date();
  }
  next();
});

// Indexes for better query performance
DocumentSchema.index({ userId: 1, type: 1 });
DocumentSchema.index({ userId: 1, isActive: 1 });
DocumentSchema.index({ userId: 1, createdAt: -1 });
DocumentSchema.index({ type: 1, isActive: 1 });

const Document: Model<IStudentDocument> = mongoose.models.Document || mongoose.model<IStudentDocument>('Document', DocumentSchema);

export default Document;