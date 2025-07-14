import mongoose, { Schema, Document as MongooseDocument, Model } from 'mongoose';

/**
 * LibraryDocument interface representing an admin-curated document in the library
 */
export interface ILibraryDocument extends MongooseDocument {
  // Basic Information
  title: string;
  type: string; // Use DocumentType enum in implementation
  content: string;
  version: number;
  status: 'draft' | 'review' | 'published' | 'archived';

  // Curation & Quality
  qualityScore: number;
  reviewStatus: 'pending' | 'approved' | 'rejected';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewNotes?: string;

  // Categorization
  category: string;
  subcategory?: string;
  tags: string[];
  targetAudience: 'undergraduate' | 'graduate' | 'professional' | 'all';
  fieldOfStudy?: string[];
  country?: string[];

  // Usage & Analytics
  viewCount: number;
  cloneCount: number;
  downloadCount: number;
  averageRating: number;
  ratingCount: number;

  // Metadata
  description: string;
  author?: string;
  source?: string;
  language: string;
  wordCount: number;
  characterCount: number;

  // Template & Cloning
  isTemplate: boolean;
  allowCloning: boolean;

  // Admin Management
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

const LibraryDocumentSchema: Schema = new Schema<ILibraryDocument>({
  // Basic Information
  title: { type: String, required: true, maxlength: 200 },
  type: { type: String, required: true },
  content: { type: String, required: true },
  version: { type: Number, default: 1, min: 1 },

  // Status and review
  status: {
    type: String,
    enum: ['draft', 'review', 'published', 'archived'],
    default: 'draft',
    required: true,
  },
  reviewStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    required: true,
  },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  reviewedAt: { type: Date },
  reviewNotes: { type: String, maxlength: 1000 },

  // Curation & Quality
  qualityScore: { type: Number, min: 1, max: 10, default: 5 },

  // Categorization
  category: { type: String, required: true },
  subcategory: { type: String },
  tags: [{ type: String, maxlength: 50 }],
  targetAudience: {
    type: String,
    enum: ['undergraduate', 'graduate', 'professional', 'all'],
    default: 'all',
    required: true,
  },
  fieldOfStudy: [{ type: String }],
  country: [{ type: String }],

  // Usage & Analytics
  viewCount: { type: Number, default: 0 },
  cloneCount: { type: Number, default: 0 },
  downloadCount: { type: Number, default: 0 },
  averageRating: { type: Number, min: 0, max: 5, default: 0 },
  ratingCount: { type: Number, default: 0 },

  // Metadata
  description: { type: String, required: true, maxlength: 500 },
  author: { type: String, maxlength: 100 },
  source: { type: String, maxlength: 200 },
  language: { type: String, default: 'en' },
  wordCount: { type: Number, default: 0 },
  characterCount: { type: Number, default: 0 },

  // Template & Cloning
  isTemplate: { type: Boolean, default: false },
  allowCloning: { type: Boolean, default: true },

  // Admin Management
  createdBy: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },

  // Timestamps
  publishedAt: { type: Date },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for performance
LibraryDocumentSchema.index({ status: 1, reviewStatus: 1 });
LibraryDocumentSchema.index({ category: 1, subcategory: 1 });
LibraryDocumentSchema.index({ tags: 1 });
LibraryDocumentSchema.index({ targetAudience: 1 });
LibraryDocumentSchema.index({ averageRating: -1, viewCount: -1 });
LibraryDocumentSchema.index({ createdAt: -1 });

const LibraryDocument: Model<ILibraryDocument> = mongoose.models.LibraryDocument || mongoose.model<ILibraryDocument>('LibraryDocument', LibraryDocumentSchema);

export default LibraryDocument; 