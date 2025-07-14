import mongoose, { Schema, Document as MongooseDocument, Model } from 'mongoose';

/**
 * DocumentClone interface for tracking user clones of library documents
 */
export interface IDocumentClone extends MongooseDocument {
  originalDocumentId: mongoose.Types.ObjectId; // Reference to LibraryDocument
  userId: mongoose.Types.ObjectId; // Reference to User (alias for clonedBy)
  clonedBy: mongoose.Types.ObjectId; // Reference to User
  clonedContent: string; // The cloned content
  customizations: {
    title?: string;
    description?: string;
    tags?: string[];
  };
  clonedAt: Date;
  lastAccessedAt?: Date;
  accessCount: number;
  userDocumentId?: mongoose.Types.ObjectId; // Reference to user's personal Document
  createdAt: Date;
  updatedAt: Date;
}

const DocumentCloneSchema: Schema = new Schema<IDocumentClone>({
  originalDocumentId: { type: Schema.Types.ObjectId, ref: 'LibraryDocument', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clonedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clonedContent: { type: String, required: true },
  customizations: {
    title: { type: String },
    description: { type: String },
    tags: [{ type: String }]
  },
  clonedAt: { type: Date, default: Date.now },
  lastAccessedAt: { type: Date },
  accessCount: { type: Number, default: 0 },
  userDocumentId: { type: Schema.Types.ObjectId, ref: 'Document' },
}, {
  timestamps: true,
});

// Indexes for performance and analytics
DocumentCloneSchema.index({ originalDocumentId: 1 });
DocumentCloneSchema.index({ userId: 1 });
DocumentCloneSchema.index({ clonedBy: 1 });
DocumentCloneSchema.index({ createdAt: -1 });

const DocumentClone: Model<IDocumentClone> = mongoose.models.DocumentClone || mongoose.model<IDocumentClone>('DocumentClone', DocumentCloneSchema);

export default DocumentClone; 