import mongoose, { Schema, Document as MongooseDocument, Model } from 'mongoose';

export interface IDocument extends MongooseDocument {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  content: string;
  type: 'cv' | 'resume' | 'personal_statement' | 'essay' | 'cover_letter' | 'recommendation' | 'transcript' | 'certificate' | 'other';
  category: 'academic' | 'professional' | 'personal' | 'certification' | 'other';
  tags: string[];
  version: number;
  isActive: boolean;
  isPublic: boolean;
  language: string;
  fileUrl?: string;
  fileSize?: number;
  fileType?: string;
  metadata: {
    wordCount: number;
    characterCount: number;
    readingTime?: number;
    lastEdited: Date;
    createdFromTemplate?: string;
  };
  permissions: {
    canEdit: boolean;
    canShare: boolean;
    canDelete: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IDocumentModel extends Model<IDocument> {
  getNextVersion(userId: string, title: string): Promise<number>;
  createNewVersion(userId: string, documentId: string, updates: Partial<IDocument>): Promise<IDocument>;
}

const DocumentSchema = new Schema<IDocument>({
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
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  content: {
    type: String,
    required: true,
    default: ''
  },
  type: {
    type: String,
    enum: ['cv', 'resume', 'personal_statement', 'essay', 'cover_letter', 'recommendation', 'transcript', 'certificate', 'other'],
    required: true,
    default: 'other'
  },
  category: {
    type: String,
    enum: ['academic', 'professional', 'personal', 'certification', 'other'],
    required: true,
    default: 'other'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
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
  metadata: {
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
    readingTime: {
      type: Number,
      min: 0
    },
    lastEdited: {
      type: Date,
      default: Date.now
    },
    createdFromTemplate: {
      type: String,
      trim: true
    }
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
DocumentSchema.virtual('versionString').get(function(this: IDocument) {
  return `v${this.version}`;
});

// Pre-save middleware to update metadata
DocumentSchema.pre('save', function(this: any, next: () => void) {
  if (this.isModified('content')) {
    // Calculate word and character count
    const content = this.content || '';
    this.metadata.characterCount = content.length;
    this.metadata.wordCount = content.trim().split(/\s+/).filter((word: string) => word.length > 0).length;
    
    // Calculate reading time (average 200 words per minute)
    this.metadata.readingTime = Math.ceil(this.metadata.wordCount / 200);
    
    // Update last edited timestamp
    this.metadata.lastEdited = new Date();
  }
  next();
});

// Static method to get next version number for a document
DocumentSchema.statics.getNextVersion = async function(userId: string, title: string): Promise<number> {
  const existingDoc = await this.findOne({ 
    userId, 
    title, 
    isActive: true 
  }).sort({ version: -1 });
  
  return existingDoc ? existingDoc.version + 1 : 1;
};

// Static method to create a new version
DocumentSchema.statics.createNewVersion = async function(userId: string, documentId: string, updates: Partial<IDocument>): Promise<IDocument> {
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
    metadata: {
      ...originalDoc.metadata,
      lastEdited: new Date()
    }
  });

  return await newVersion.save();
};

const Document: IDocumentModel = mongoose.models.Document || mongoose.model<IDocument, IDocumentModel>('Document', DocumentSchema);

export default Document;