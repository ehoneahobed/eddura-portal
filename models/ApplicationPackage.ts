import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * ApplicationPackage interface representing a complete application package for a program or scholarship
 */
export interface IApplicationPackage extends Document {
  /** Reference to the user */
  userId: mongoose.Types.ObjectId;
  /** Reference to UserInterest */
  interestId: mongoose.Types.ObjectId;
  
  // Package details
  /** Name of the application package */
  name: string;
  /** Type of application package */
  type: 'program' | 'scholarship' | 'combined';
  
  // Document management
  /** Required and uploaded documents */
  documents: {
    /** Document type */
    type: 'transcript' | 'personal_statement' | 'cv' | 'recommendation_letter' | 'test_scores' | 'portfolio' | 'scholarship_essay' | 'financial_documents' | 'other';
    /** Document name */
    name: string;
    /** Whether document is required */
    required: boolean;
    /** File URL if uploaded to our platform */
    fileUrl?: string;
    /** External URL if stored elsewhere */
    externalUrl?: string;
    /** Reference to Document model */
    documentId?: mongoose.Types.ObjectId;
    /** Document status */
    status: 'pending' | 'uploaded' | 'reviewed' | 'approved';
    /** Additional notes */
    notes?: string;
    /** When document was uploaded */
    uploadedAt?: Date;
    /** When document was reviewed */
    reviewedAt?: Date;
  }[];
  
  // Progress tracking
  /** Progress percentage (0-100) */
  progress: number;
  /** Whether package is ready for application */
  isReady: boolean;
  
  // Application status
  /** When application was submitted */
  appliedAt?: Date;
  /** Current application status */
  applicationStatus?: 'not_started' | 'in_progress' | 'submitted' | 'under_review' | 'interview_scheduled' | 'decision_made';
  /** Application decision */
  decision?: 'accepted' | 'rejected' | 'waitlisted';
  /** When decision was made */
  decisionDate?: Date;
  
  // Scholarship integration
  /** Linked scholarships */
  linkedScholarships?: {
    /** Scholarship ID */
    scholarshipId: mongoose.Types.ObjectId;
    /** Scholarship name */
    scholarshipName: string;
    /** Scholarship status */
    status: 'interested' | 'applied' | 'awarded' | 'rejected';
    /** Separate package for scholarship */
    applicationPackageId?: mongoose.Types.ObjectId;
  }[];
  
  // Metadata
  /** Additional notes */
  notes?: string;
  /** When package was created */
  createdAt: Date;
  /** When package was last updated */
  updatedAt: Date;
}

const ApplicationPackageSchema: Schema = new Schema<IApplicationPackage>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  interestId: {
    type: Schema.Types.ObjectId,
    ref: 'UserInterest',
    required: true,
    index: true
  },
  
  // Package details
  name: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['program', 'scholarship', 'combined'],
    required: true
  },
  
  // Document management
  documents: [{
    type: {
      type: String,
      enum: ['transcript', 'personal_statement', 'cv', 'recommendation_letter', 'test_scores', 'portfolio', 'scholarship_essay', 'financial_documents', 'other'],
      required: true
    },
    name: { type: String, required: true, trim: true },
    required: { type: Boolean, default: true },
    fileUrl: { type: String, trim: true },
    externalUrl: { type: String, trim: true },
    documentId: { type: Schema.Types.ObjectId, ref: 'Document' },
    status: {
      type: String,
      enum: ['pending', 'uploaded', 'reviewed', 'approved'],
      default: 'pending'
    },
    notes: { type: String, trim: true },
    uploadedAt: { type: Date },
    reviewedAt: { type: Date }
  }],
  
  // Progress tracking
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  isReady: { type: Boolean, default: false },
  
  // Application status
  appliedAt: { type: Date },
  applicationStatus: {
    type: String,
    enum: ['not_started', 'in_progress', 'submitted', 'under_review', 'interview_scheduled', 'decision_made'],
    default: 'not_started'
  },
  decision: {
    type: String,
    enum: ['accepted', 'rejected', 'waitlisted']
  },
  decisionDate: { type: Date },
  
  // Scholarship integration
  linkedScholarships: [{
    scholarshipId: { type: Schema.Types.ObjectId, ref: 'Scholarship', required: true },
    scholarshipName: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['interested', 'applied', 'awarded', 'rejected'],
      default: 'interested'
    },
    applicationPackageId: { type: Schema.Types.ObjectId, ref: 'ApplicationPackage' }
  }],
  
  // Metadata
  notes: { type: String, trim: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate for user interest
ApplicationPackageSchema.virtual('interest', {
  ref: 'UserInterest',
  localField: 'interestId',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware to calculate progress
ApplicationPackageSchema.pre('save', function(this: IApplicationPackage, next: any) {
  if (this.documents && this.documents.length > 0) {
    const requiredDocs = this.documents.filter(doc => doc.required);
    const completedDocs = requiredDocs.filter(doc => doc.status === 'uploaded' || doc.status === 'reviewed' || doc.status === 'approved');
    
    this.progress = requiredDocs.length > 0 ? Math.round((completedDocs.length / requiredDocs.length) * 100) : 0;
    this.isReady = this.progress === 100;
  }
  next();
});

// Indexes for better query performance
ApplicationPackageSchema.index({ userId: 1, type: 1 });
ApplicationPackageSchema.index({ userId: 1, applicationStatus: 1 });
ApplicationPackageSchema.index({ userId: 1, isReady: 1 });
ApplicationPackageSchema.index({ interestId: 1 });

const ApplicationPackage: Model<IApplicationPackage> = mongoose.models.ApplicationPackage || mongoose.model<IApplicationPackage>('ApplicationPackage', ApplicationPackageSchema);

export default ApplicationPackage;