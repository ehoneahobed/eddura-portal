import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * RecommendationLetter interface representing a submitted recommendation letter
 */
export interface IRecommendationLetter extends Document {
  // References
  requestId: mongoose.Types.ObjectId; // Reference to RecommendationRequest
  recipientId: mongoose.Types.ObjectId; // Reference to Recipient
  
  // Content
  content: string;
  fileName?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  
  // Metadata
  submittedAt: Date;
  submittedBy: string; // recipient email or 'student'
  
  // Quality Control
  isVerified: boolean;
  verificationNotes?: string;
  verifiedBy?: mongoose.Types.ObjectId; // Reference to Admin
  verifiedAt?: Date;
  
  // Version Control
  version: number;
  previousVersion?: mongoose.Types.ObjectId; // Reference to previous version
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * RecommendationLetter schema for MongoDB
 */
const recommendationLetterSchema = new Schema<IRecommendationLetter>({
  requestId: {
    type: Schema.Types.ObjectId,
    ref: 'RecommendationRequest',
    required: true,
    index: true,
  },
  recipientId: {
    type: Schema.Types.ObjectId,
    ref: 'Recipient',
    required: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  fileName: {
    type: String,
    trim: true,
  },
  fileUrl: {
    type: String,
    trim: true,
  },
  fileType: {
    type: String,
    trim: true,
  },
  fileSize: {
    type: Number,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  submittedBy: {
    type: String,
    required: true,
    trim: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
    index: true,
  },
  verificationNotes: {
    type: String,
    trim: true,
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
  },
  verifiedAt: {
    type: Date,
  },
  version: {
    type: Number,
    default: 1,
  },
  previousVersion: {
    type: Schema.Types.ObjectId,
    ref: 'RecommendationLetter',
  },
}, {
  timestamps: true,
});

// Indexes for efficient querying
recommendationLetterSchema.index({ requestId: 1, version: -1 });
recommendationLetterSchema.index({ recipientId: 1, submittedAt: -1 });
recommendationLetterSchema.index({ isVerified: 1, submittedAt: -1 });
recommendationLetterSchema.index({ createdAt: -1 });

// Ensure only one active letter per request (latest version)
recommendationLetterSchema.index({ requestId: 1, version: 1 }, { unique: true });

// Virtual for checking if letter is from recipient
recommendationLetterSchema.virtual('isFromRecipient').get(function() {
  return this.submittedBy !== 'student';
});

// Virtual for file extension
recommendationLetterSchema.virtual('fileExtension').get(function() {
  if (!this.fileName) return null;
  return this.fileName.split('.').pop()?.toLowerCase();
});

// Pre-save middleware to handle versioning
recommendationLetterSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Get the latest version for this request
    const latestLetter = await this.constructor.findOne(
      { requestId: this.requestId },
      {},
      { sort: { version: -1 } }
    );
    
    if (latestLetter) {
      this.version = latestLetter.version + 1;
      this.previousVersion = latestLetter._id;
    } else {
      this.version = 1;
    }
  }
  next();
});

export const RecommendationLetter: Model<IRecommendationLetter> = mongoose.models.RecommendationLetter || mongoose.model<IRecommendationLetter>('RecommendationLetter', recommendationLetterSchema);

export default RecommendationLetter;