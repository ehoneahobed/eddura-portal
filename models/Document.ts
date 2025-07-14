import mongoose, { Schema, Document as MongooseDocument, Model, CallbackWithoutResult } from 'mongoose';
import { DocumentType, DOCUMENT_TYPE_CONFIG } from '@/types/documents';

/**
 * StudentDocument interface representing a student document in the Eddura platform
 */
export interface IStudentDocument extends MongooseDocument {
  // Basic Information
  userId: mongoose.Types.ObjectId;
  title: string;
  type: DocumentType;
  content: string;
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
  
  // Enhanced features from our branch
  category?: 'academic' | 'professional' | 'personal' | 'certification' | 'other';
  isPublic?: boolean;
  language?: string;
  fileUrl?: string;
  fileSize?: number;
  fileType?: string;
  readingTime?: number;
  createdFromTemplate?: string;
  permissions?: {
    canEdit: boolean;
    canShare: boolean;
    canDelete: boolean;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface IDocumentModel extends Model<IStudentDocument> {
  getNextVersion(userId: string, title: string): Promise<number>;
  createNewVersion(userId: string, documentId: string, updates: Partial<IStudentDocument>): Promise<IStudentDocument>;
}

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
    required: true,
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
    trim: true
  },
  targetScholarship: {
    type: String,
    trim: true
  },
  targetInstitution: {
    type: String,
    trim: true
  },
  
  // Document-specific fields
  wordCount: {
    type: Number,
    default: 0,
    min: 0
  },
  characterCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastEditedAt: {
    type: Date,
    default: Date.now
  },
  
  // Enhanced features from our branch
  category: {
    type: String,
    enum: ['academic', 'professional', 'personal', 'certification', 'other'],
    default: 'other'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  language: {
    type: String,
    default: 'en',
    maxlength: 10
  },
  fileUrl: {
    type: String,
    trim: true
  },
  fileSize: {
    type: Number,
    min: 0
  },
  fileType: {
    type: String,
    trim: true
  },
  readingTime: {
    type: Number,
    min: 0
  },
  createdFromTemplate: {
    type: String,
    trim: true
  },
  permissions: {
    canEdit: {
      type: Boolean,
      default: true
    },
    canShare: {
      type: Boolean,
      default: true
    },
    canDelete: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
DocumentSchema.index({ userId: 1, type: 1 });
DocumentSchema.index({ userId: 1, category: 1 });
DocumentSchema.index({ userId: 1, isActive: 1 });
DocumentSchema.index({ userId: 1, tags: 1 });
DocumentSchema.index({ userId: 1, version: 1 });

// Virtual for full version string
DocumentSchema.virtual('versionString').get(function(this: IStudentDocument) {
  return `v${this.version}`;
});

// Pre-save middleware to update metadata
DocumentSchema.pre('save', function(this: any, next: () => void) {
  if (this.isModified('content')) {
    // Calculate word and character count
    const content = this.content || '';
    this.characterCount = content.length;
    this.wordCount = content.trim().split(/\s+/).filter((word: string) => word.length > 0).length;
    
    // Calculate reading time (average 200 words per minute)
    this.readingTime = Math.ceil(this.wordCount / 200);
    
    // Update last edited timestamp
    this.lastEditedAt = new Date();
  }
  next();
});

// Static method to get next version number for a document
(DocumentSchema.statics as any).getNextVersion = async function(userId: string, title: string): Promise<number> {
  const existingDoc = await this.findOne({ 
    userId, 
    title, 
    isActive: true 
  }).sort({ version: -1 });
  
  return existingDoc ? existingDoc.version + 1 : 1;
};

// Static method to create a new version
(DocumentSchema.statics as any).createNewVersion = async function(userId: string, documentId: string, updates: Partial<IStudentDocument>): Promise<IStudentDocument> {
  const originalDoc = await this.findById(documentId);
  if (!originalDoc || originalDoc.userId.toString() !== userId) {
    throw new Error('Document not found or access denied');
  }

  // Create new version
  const newVersion = new this({
    ...originalDoc.toObject(),
    _id: undefined, // Remove the original _id
    version: originalDoc.version + 1,
    ...updates,
    lastEditedAt: new Date()
  });

  return await newVersion.save();
};

const Document = mongoose.models.Document || mongoose.model<IStudentDocument>('Document', DocumentSchema);

export default Document;