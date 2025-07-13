import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Status of the application form request
 */
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'completed';

/**
 * Interface for application form request
 */
export interface IApplicationFormRequest extends Document {
  userId: mongoose.Types.ObjectId;
  scholarshipId: mongoose.Types.ObjectId;
  status: RequestStatus;
  requestReason?: string;
  adminNotes?: string;
  requestedAt: Date;
  processedAt?: Date;
  processedBy?: mongoose.Types.ObjectId;
  applicationTemplateId?: mongoose.Types.ObjectId; // If an application form was created
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationFormRequestSchema: Schema = new Schema<IApplicationFormRequest>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  scholarshipId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Scholarship', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending',
    required: true 
  },
  requestReason: { 
    type: String, 
    trim: true,
    maxlength: 1000 
  },
  adminNotes: { 
    type: String, 
    trim: true,
    maxlength: 2000 
  },
  requestedAt: { 
    type: Date, 
    default: Date.now,
    required: true 
  },
  processedAt: { 
    type: Date 
  },
  processedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'Admin' 
  },
  applicationTemplateId: { 
    type: Schema.Types.ObjectId, 
    ref: 'ApplicationTemplate' 
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
ApplicationFormRequestSchema.index({ userId: 1 });
ApplicationFormRequestSchema.index({ scholarshipId: 1 });
ApplicationFormRequestSchema.index({ status: 1 });
ApplicationFormRequestSchema.index({ requestedAt: -1 });
ApplicationFormRequestSchema.index({ userId: 1, scholarshipId: 1 }, { unique: true });

// Virtual populate for user information
ApplicationFormRequestSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual populate for scholarship information
ApplicationFormRequestSchema.virtual('scholarship', {
  ref: 'Scholarship',
  localField: 'scholarshipId',
  foreignField: '_id',
  justOne: true
});

// Virtual populate for admin who processed the request
ApplicationFormRequestSchema.virtual('admin', {
  ref: 'Admin',
  localField: 'processedBy',
  foreignField: '_id',
  justOne: true
});

// Virtual populate for application template if created
ApplicationFormRequestSchema.virtual('applicationTemplate', {
  ref: 'ApplicationTemplate',
  localField: 'applicationTemplateId',
  foreignField: '_id',
  justOne: true
});

const ApplicationFormRequest: Model<IApplicationFormRequest> = mongoose.models.ApplicationFormRequest || mongoose.model<IApplicationFormRequest>('ApplicationFormRequest', ApplicationFormRequestSchema);

export default ApplicationFormRequest;