import mongoose, { Schema, Document as MongooseDocument, Model } from 'mongoose';

/**
 * DocumentRating interface for storing user ratings and reviews of library documents
 */
export interface IDocumentRating extends MongooseDocument {
  documentId: mongoose.Types.ObjectId; // Reference to LibraryDocument
  userId: mongoose.Types.ObjectId; // Reference to User
  rating: number; // 1-5 stars
  review?: string; // Optional text review
  createdAt: Date;
  updatedAt: Date;
}

const DocumentRatingSchema: Schema = new Schema<IDocumentRating>({
  documentId: { type: Schema.Types.ObjectId, ref: 'LibraryDocument', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, maxlength: 1000 },
}, {
  timestamps: true,
});

// Ensure one rating per user per document
DocumentRatingSchema.index({ documentId: 1, userId: 1 }, { unique: true });

// Indexes for performance and analytics
DocumentRatingSchema.index({ documentId: 1 });
DocumentRatingSchema.index({ userId: 1 });
DocumentRatingSchema.index({ rating: 1 });
DocumentRatingSchema.index({ createdAt: -1 });

const DocumentRating: Model<IDocumentRating> = mongoose.models.DocumentRating || mongoose.model<IDocumentRating>('DocumentRating', DocumentRatingSchema);

export default DocumentRating; 