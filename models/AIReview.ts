import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * AI Review Status
 */
export type AIReviewStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

/**
 * Review Categories for different aspects of evaluation
 */
export type ReviewCategory = 
  | 'content_quality' 
  | 'completeness' 
  | 'relevance' 
  | 'formatting' 
  | 'clarity' 
  | 'strength' 
  | 'overall';

/**
 * Feedback types for AI reviews
 */
export type FeedbackType = 'positive' | 'negative' | 'suggestion' | 'warning' | 'improvement';

/**
 * Interface for AI review feedback items
 */
export interface IAIReviewFeedback {
  type: FeedbackType;
  category: ReviewCategory;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  suggestions?: string[];
  examples?: string[];
}

/**
 * Interface for AI review results
 */
export interface IAIReview extends Document {
  /** Reference to the application this review belongs to */
  applicationId: mongoose.Types.ObjectId;
  
  /** Reference to the specific requirement being reviewed */
  requirementId: mongoose.Types.ObjectId;
  
  /** Reference to the document being reviewed (if applicable) */
  documentId?: mongoose.Types.ObjectId;
  
  /** User who requested the review */
  userId: mongoose.Types.ObjectId;
  
  /** Review metadata */
  reviewType: 'document_review' | 'requirement_compliance' | 'overall_package';
  status: AIReviewStatus;
  
  /** Overall scores (0-100) */
  scores: {
    overall: number;
    contentQuality: number;
    completeness: number;
    relevance: number;
    formatting: number;
    clarity: number;
    strength: number;
  };
  
  /** Detailed feedback */
  feedback: IAIReviewFeedback[];
  
  /** Summary of the review */
  summary: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    overallAssessment: string;
  };
  
  /** AI model information */
  aiModel: string;
  aiProvider: string;
  
  /** Processing metadata */
  processingTime?: number; // in milliseconds
  tokensUsed?: number;
  
  /** Review metadata */
  createdAt: Date;
  updatedAt: Date;
  reviewedAt?: Date;
  
  /** Instance methods */
  getOverallScore(): number;
  getCategoryScore(category: ReviewCategory): number;
  getFeedbackByCategory(category: ReviewCategory): IAIReviewFeedback[];
  getFeedbackByType(type: FeedbackType): IAIReviewFeedback[];
  isPassingScore(threshold?: number): boolean;
}

const AIReviewFeedbackSchema = new Schema<IAIReviewFeedback>({
  type: {
    type: String,
    enum: ['positive', 'negative', 'suggestion', 'warning', 'improvement'],
    required: true
  },
  category: {
    type: String,
    enum: ['content_quality', 'completeness', 'relevance', 'formatting', 'clarity', 'strength', 'overall'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  suggestions: [{
    type: String,
    trim: true
  }],
  examples: [{
    type: String,
    trim: true
  }]
});

const AIReviewSummarySchema = new Schema({
  strengths: [{
    type: String,
    trim: true
  }],
  weaknesses: [{
    type: String,
    trim: true
  }],
  recommendations: [{
    type: String,
    trim: true
  }],
  overallAssessment: {
    type: String,
    required: true,
    trim: true
  }
});

const AIReviewScoresSchema = new Schema({
  overall: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  contentQuality: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  completeness: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  relevance: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  formatting: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  clarity: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  strength: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }
});

const AIReviewSchema: Schema = new Schema<IAIReview>({
  applicationId: {
    type: Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  requirementId: {
    type: Schema.Types.ObjectId,
    ref: 'ApplicationRequirement',
    required: true
  },
  documentId: {
    type: Schema.Types.ObjectId,
    ref: 'Document'
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewType: {
    type: String,
    enum: ['document_review', 'requirement_compliance', 'overall_package'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed'],
    default: 'pending',
    required: true
  },
  scores: {
    type: AIReviewScoresSchema,
    required: true
  },
  feedback: [AIReviewFeedbackSchema],
  summary: {
    type: AIReviewSummarySchema,
    required: true
  },
  aiModel: {
    type: String,
    required: true,
    trim: true
  },
  aiProvider: {
    type: String,
    required: true,
    trim: true
  },
  processingTime: {
    type: Number,
    min: 0
  },
  tokensUsed: {
    type: Number,
    min: 0
  },
  reviewedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
AIReviewSchema.index({ applicationId: 1, requirementId: 1 });
AIReviewSchema.index({ userId: 1, createdAt: -1 });
AIReviewSchema.index({ status: 1 });
AIReviewSchema.index({ documentId: 1 });
AIReviewSchema.index({ 'scores.overall': -1 });

// Virtual populate for related data
AIReviewSchema.virtual('application', {
  ref: 'Application',
  localField: 'applicationId',
  foreignField: '_id',
  justOne: true
});

AIReviewSchema.virtual('requirement', {
  ref: 'ApplicationRequirement',
  localField: 'requirementId',
  foreignField: '_id',
  justOne: true
});

AIReviewSchema.virtual('document', {
  ref: 'Document',
  localField: 'documentId',
  foreignField: '_id',
  justOne: true
});

AIReviewSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware to set reviewedAt when status changes to completed
AIReviewSchema.pre('save', function(this: IAIReview, next: (error?: Error) => void) {
  if (this.isModified('status') && this.status === 'completed' && !this.reviewedAt) {
    this.reviewedAt = new Date();
  }
  next();
});

// Method to get overall score
AIReviewSchema.methods.getOverallScore = function(): number {
  return this.scores.overall;
};

// Method to get category score
AIReviewSchema.methods.getCategoryScore = function(category: ReviewCategory): number {
  const categoryMap: Record<ReviewCategory, keyof typeof this.scores> = {
    content_quality: 'contentQuality',
    completeness: 'completeness',
    relevance: 'relevance',
    formatting: 'formatting',
    clarity: 'clarity',
    strength: 'strength',
    overall: 'overall'
  };
  
  const scoreKey = categoryMap[category];
  return scoreKey ? this.scores[scoreKey] : 0;
};

// Method to get feedback by category
AIReviewSchema.methods.getFeedbackByCategory = function(category: ReviewCategory): IAIReviewFeedback[] {
  return this.feedback.filter((item: IAIReviewFeedback) => item.category === category);
};

// Method to get feedback by type
AIReviewSchema.methods.getFeedbackByType = function(type: FeedbackType): IAIReviewFeedback[] {
  return this.feedback.filter((item: IAIReviewFeedback) => item.type === type);
};

// Method to check if score is passing
AIReviewSchema.methods.isPassingScore = function(threshold: number = 70): boolean {
  return this.scores.overall >= threshold;
};

const AIReview: Model<IAIReview> = mongoose.models.AIReview || 
  mongoose.model<IAIReview>('AIReview', AIReviewSchema);

export default AIReview; 