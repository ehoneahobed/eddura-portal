import mongoose, { Schema, Document as MongooseDocument, Model } from 'mongoose';

/**
 * DocumentShare interface representing a shared document
 */
export interface IDocumentShare extends MongooseDocument {
  // Document reference
  documentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // Document owner
  
  // Sharing details
  shareType: 'email' | 'link';
  email?: string; // For email-based sharing
  shareToken: string; // Unique token for link-based sharing
  isActive: boolean;
  expiresAt?: Date;
  
  // Permissions
  canComment: boolean;
  canEdit: boolean;
  canDownload: boolean;
  
  // Metadata
  message?: string; // Optional message from the sharer
  reviewerName?: string; // Name of the reviewer (for email shares)
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const DocumentShareSchema: Schema = new Schema<IDocumentShare>({
  // Document reference
  documentId: {
    type: Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Sharing details
  shareType: {
    type: String,
    enum: ['email', 'link'],
    required: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: function() {
      return this.shareType === 'email';
    }
  },
  shareToken: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date
  },
  
  // Permissions
  canComment: {
    type: Boolean,
    default: true
  },
  canEdit: {
    type: Boolean,
    default: false
  },
  canDownload: {
    type: Boolean,
    default: true
  },
  
  // Metadata
  message: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  reviewerName: {
    type: String,
    trim: true,
    maxlength: 100
  }
}, {
  timestamps: true
});

// Generate unique share token
DocumentShareSchema.pre('save', function(this: IDocumentShare, next: any) {
  if (!this.shareToken) {
    this.shareToken = generateShareToken();
  }
  next();
});

// Helper function to generate unique share token
function generateShareToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) +
         Date.now().toString(36);
}

// Indexes for better query performance
DocumentShareSchema.index({ documentId: 1, isActive: 1 });
DocumentShareSchema.index({ userId: 1, isActive: 1 });
DocumentShareSchema.index({ shareToken: 1, isActive: 1 });
DocumentShareSchema.index({ email: 1, isActive: 1 });

const DocumentShare: Model<IDocumentShare> = mongoose.models.DocumentShare || 
  mongoose.model<IDocumentShare>('DocumentShare', DocumentShareSchema);

export default DocumentShare;