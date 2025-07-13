import mongoose, { Schema, Document as MongooseDocument, Model } from 'mongoose';

export interface IDocument extends MongooseDocument {
  userId: mongoose.Types.ObjectId;
  title: string;
  type: 'cv' | 'personal_statement' | 'essay' | 'recommendation_letter' | 'transcript' | 'certificate' | 'portfolio' | 'other';
  category: 'academic' | 'professional' | 'personal' | 'creative' | 'other';
  content: string;
  version: number;
  isLatestVersion: boolean;
  previousVersionId?: mongoose.Types.ObjectId;
  tags: string[];
  description?: string;
  targetAudience?: string;
  targetInstitution?: string;
  targetProgram?: string;
  wordCount: number;
  characterCount: number;
  status: 'draft' | 'review' | 'final' | 'archived';
  isPublic: boolean;
  allowComments: boolean;
  comments: Array<{
    userId: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
    isResolved: boolean;
  }>;
  attachments: Array<{
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    uploadedAt: Date;
  }>;
  metadata: {
    language: string;
    format: 'text' | 'rich_text' | 'markdown';
    lastEditedBy: mongoose.Types.ObjectId;
    editHistory: Array<{
      userId: mongoose.Types.ObjectId;
      action: 'created' | 'updated' | 'versioned' | 'archived';
      timestamp: Date;
      changes?: string;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
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
  type: {
    type: String,
    enum: ['cv', 'personal_statement', 'essay', 'recommendation_letter', 'transcript', 'certificate', 'portfolio', 'other'],
    required: true
  },
  category: {
    type: String,
    enum: ['academic', 'professional', 'personal', 'creative', 'other'],
    required: true
  },
  content: {
    type: String,
    required: true,
    // No maxlength - unlimited content
  },
  version: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  isLatestVersion: {
    type: Boolean,
    required: true,
    default: true
  },
  previousVersionId: {
    type: Schema.Types.ObjectId,
    ref: 'Document'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  targetAudience: {
    type: String,
    trim: true,
    maxlength: 200
  },
  targetInstitution: {
    type: String,
    trim: true,
    maxlength: 200
  },
  targetProgram: {
    type: String,
    trim: true,
    maxlength: 200
  },
  wordCount: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  characterCount: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['draft', 'review', 'final', 'archived'],
    required: true,
    default: 'draft'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  comments: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isResolved: {
      type: Boolean,
      default: false
    }
  }],
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    language: {
      type: String,
      default: 'en',
      maxlength: 10
    },
    format: {
      type: String,
      enum: ['text', 'rich_text', 'markdown'],
      default: 'text'
    },
    lastEditedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    editHistory: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      action: {
        type: String,
        enum: ['created', 'updated', 'versioned', 'archived'],
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      changes: {
        type: String,
        maxlength: 500
      }
    }]
  }
}, {
  timestamps: true
});

// Indexes for better query performance
DocumentSchema.index({ userId: 1, type: 1 });
DocumentSchema.index({ userId: 1, status: 1 });
DocumentSchema.index({ userId: 1, isLatestVersion: 1 });
DocumentSchema.index({ tags: 1 });
DocumentSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate word and character counts
DocumentSchema.pre('save', function(this: IDocument, next: () => void) {
  if (this.isModified('content')) {
    this.characterCount = this.content.length;
    this.wordCount = this.content.trim().split(/\s+/).filter((word: string) => word.length > 0).length;
  }
  next();
});

// Static method to create a new version
DocumentSchema.statics.createNewVersion = async function(documentId: string, userId: string, changes: Partial<IDocument>) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Get the current document
    const currentDoc = await this.findById(documentId);
    if (!currentDoc) {
      throw new Error('Document not found');
    }
    
    // Mark current version as not latest
    currentDoc.isLatestVersion = false;
    await currentDoc.save({ session });
    
    // Create new version
    const newVersion = new this({
      ...currentDoc.toObject(),
      _id: new mongoose.Types.ObjectId(),
      version: currentDoc.version + 1,
      isLatestVersion: true,
      previousVersionId: currentDoc._id,
      content: changes.content || currentDoc.content,
      title: changes.title || currentDoc.title,
      description: changes.description || currentDoc.description,
      tags: changes.tags || currentDoc.tags,
      status: changes.status || currentDoc.status,
      metadata: {
        ...currentDoc.metadata,
        lastEditedBy: userId,
        editHistory: [
          ...currentDoc.metadata.editHistory,
          {
            userId,
            action: 'versioned',
            timestamp: new Date(),
            changes: changes.content ? 'Content updated' : 'Document versioned'
          }
        ]
      }
    });
    
    await newVersion.save({ session });
    await session.commitTransaction();
    
    return newVersion;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Virtual for document type display name
DocumentSchema.virtual('typeDisplayName').get(function(this: IDocument) {
  const typeNames: Record<string, string> = {
    cv: 'CV/Resume',
    personal_statement: 'Personal Statement',
    essay: 'Essay',
    recommendation_letter: 'Recommendation Letter',
    transcript: 'Transcript',
    certificate: 'Certificate',
    portfolio: 'Portfolio',
    other: 'Other'
  };
  return typeNames[this.type] || this.type;
});

// Virtual for category display name
DocumentSchema.virtual('categoryDisplayName').get(function(this: IDocument) {
  const categoryNames: Record<string, string> = {
    academic: 'Academic',
    professional: 'Professional',
    personal: 'Personal',
    creative: 'Creative',
    other: 'Other'
  };
  return categoryNames[this.category] || this.category;
});

export const Document: Model<IDocument> = mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);