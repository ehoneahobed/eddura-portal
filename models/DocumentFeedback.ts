import mongoose, { Schema, Document as MongooseDocument, Model } from 'mongoose';

/**
 * DocumentFeedback interface representing feedback on a document
 */
export interface IDocumentFeedback extends MongooseDocument {
  // Document and share reference
  documentId: mongoose.Types.ObjectId;
  documentShareId: mongoose.Types.ObjectId;
  
  // Reviewer information
  reviewerName: string;
  reviewerEmail?: string;
  
  // Feedback content
  comments: IFeedbackComment[];
  overallRating?: number; // 1-5 rating
  generalFeedback?: string;
  
  // Status
  isResolved: boolean;
  resolvedAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * FeedbackComment interface representing individual comments
 */
export interface IFeedbackComment {
  id: string;
  content: string;
  position?: {
    start: number;
    end: number;
    text: string; // The highlighted text
  };
  type: 'general' | 'suggestion' | 'correction' | 'question';
  status: 'pending' | 'addressed' | 'ignored';
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackCommentSchema: Schema = new Schema<IFeedbackComment>({
  id: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  position: {
    start: Number,
    end: Number,
    text: String
  },
  type: {
    type: String,
    enum: ['general', 'suggestion', 'correction', 'question'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['pending', 'addressed', 'ignored'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const DocumentFeedbackSchema: Schema = new Schema<IDocumentFeedback>({
  // Document and share reference
  documentId: {
    type: Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
    index: true
  },
  documentShareId: {
    type: Schema.Types.ObjectId,
    ref: 'DocumentShare',
    required: true,
    index: true
  },
  
  // Reviewer information
  reviewerName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  reviewerEmail: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 255
  },
  
  // Feedback content
  comments: [FeedbackCommentSchema],
  overallRating: {
    type: Number,
    min: 1,
    max: 5
  },
  generalFeedback: {
    type: String,
    trim: true,
    maxlength: 5000
  },
  
  // Status
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate unique comment ID
DocumentFeedbackSchema.pre('save', function(this: IDocumentFeedback, next: any) {
  if (this.comments) {
    this.comments.forEach(comment => {
      if (!comment.id) {
        comment.id = generateCommentId();
      }
      comment.updatedAt = new Date();
    });
  }
  next();
});

// Helper function to generate unique comment ID
function generateCommentId(): string {
  return 'comment_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

// Indexes for better query performance
DocumentFeedbackSchema.index({ documentId: 1, createdAt: -1 });
DocumentFeedbackSchema.index({ documentShareId: 1 });
DocumentFeedbackSchema.index({ reviewerEmail: 1 });
DocumentFeedbackSchema.index({ isResolved: 1 });

const DocumentFeedback: Model<IDocumentFeedback> = mongoose.models.DocumentFeedback || 
  mongoose.model<IDocumentFeedback>('DocumentFeedback', DocumentFeedbackSchema);

export default DocumentFeedback;