import mongoose, { Schema, Document as MongooseDocument, Model } from 'mongoose';

/**
 * DocumentView interface for tracking individual document views
 */
export interface IDocumentView extends MongooseDocument {
  documentId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId; // Optional - anonymous views are allowed
  userType: 'admin' | 'user' | 'anonymous';
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  sessionId?: string;
  createdAt: Date;
}

const DocumentViewSchema: Schema = new Schema<IDocumentView>({
  documentId: { type: Schema.Types.ObjectId, ref: 'LibraryDocument', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  userType: { 
    type: String, 
    enum: ['admin', 'user', 'anonymous'], 
    default: 'anonymous',
    required: true 
  },
  ipAddress: { type: String },
  userAgent: { type: String },
  referrer: { type: String },
  sessionId: { type: String },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

// Indexes for performance
DocumentViewSchema.index({ documentId: 1, createdAt: -1 });
DocumentViewSchema.index({ userType: 1, createdAt: -1 });
DocumentViewSchema.index({ createdAt: -1 });

const DocumentView: Model<IDocumentView> = mongoose.models.DocumentView || mongoose.model<IDocumentView>('DocumentView', DocumentViewSchema);

export default DocumentView;