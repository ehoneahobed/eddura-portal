import mongoose, { Schema, Document } from 'mongoose';

export interface IMediaFile extends Document {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt?: string;
  caption?: string;
  uploadedBy: string;
  uploadedAt: Date;
  updatedAt: Date;
}

const MediaFileSchema: Schema = new Schema<IMediaFile>({
  filename: {
    type: String,
    required: true,
    unique: true
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
  alt: {
    type: String,
    trim: true
  },
  caption: {
    type: String,
    trim: true
  },
  uploadedBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
MediaFileSchema.index({ uploadedBy: 1, uploadedAt: -1 });
MediaFileSchema.index({ originalName: 'text', alt: 'text' });

export default mongoose.models.MediaFile || mongoose.model<IMediaFile>('MediaFile', MediaFileSchema); 