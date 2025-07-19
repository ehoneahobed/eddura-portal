import mongoose, { Document, Schema } from 'mongoose';

export interface IScholarshipApplication extends Document {
  userId: mongoose.Types.ObjectId;
  scholarshipId: mongoose.Types.ObjectId;
  applicationPackageId?: mongoose.Types.ObjectId; // Link to main application package

  // Application details
  status: 'draft' | 'submitted' | 'under_review' | 'interviewed' | 'awarded' | 'rejected';
  submittedAt?: Date;
  decisionDate?: Date;

  // Form responses (if we provide application form)
  formResponses?: {
    questionId: string;
    answer: string;
    attachments?: string[];
  }[];

  // Interview tracking
  requiresInterview?: boolean;
  interviewScheduled?: boolean;
  interviewDate?: Date;
  interviewType?: 'in-person' | 'virtual' | 'phone';
  interviewNotes?: string;

  // Award details
  awardAmount?: number;
  awardCurrency?: string;
  awardConditions?: string;

  // Metadata
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScholarshipApplicationSchema = new Schema<IScholarshipApplication>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  scholarshipId: {
    type: Schema.Types.ObjectId,
    ref: 'Scholarship',
    required: true,
    index: true
  },
  applicationPackageId: {
    type: Schema.Types.ObjectId,
    ref: 'ApplicationPackage',
    index: true
  },

  // Application details
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'interviewed', 'awarded', 'rejected'],
    default: 'draft',
    required: true
  },
  submittedAt: {
    type: Date
  },
  decisionDate: {
    type: Date
  },

  // Form responses
  formResponses: [{
    questionId: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    },
    attachments: [{
      type: String
    }]
  }],

  // Interview tracking
  requiresInterview: {
    type: Boolean,
    default: false
  },
  interviewScheduled: {
    type: Boolean,
    default: false
  },
  interviewDate: {
    type: Date
  },
  interviewType: {
    type: String,
    enum: ['in-person', 'virtual', 'phone']
  },
  interviewNotes: {
    type: String
  },

  // Award details
  awardAmount: {
    type: Number
  },
  awardCurrency: {
    type: String,
    default: 'USD'
  },
  awardConditions: {
    type: String
  },

  // Metadata
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
ScholarshipApplicationSchema.index({ userId: 1, scholarshipId: 1 }, { unique: true });
ScholarshipApplicationSchema.index({ status: 1, submittedAt: 1 });
ScholarshipApplicationSchema.index({ interviewDate: 1 });
ScholarshipApplicationSchema.index({ decisionDate: 1 });

// Virtual for application age
ScholarshipApplicationSchema.virtual('applicationAge').get(function() {
  if (!this.submittedAt) return null;
  return Date.now() - this.submittedAt.getTime();
});

// Virtual for days until decision
ScholarshipApplicationSchema.virtual('daysUntilDecision').get(function() {
  if (!this.decisionDate) return null;
  return this.decisionDate.getTime() - Date.now();
});

// Pre-save middleware to update timestamps
ScholarshipApplicationSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'submitted' && !this.submittedAt) {
    this.submittedAt = new Date();
  }
  if (this.isModified('status') && ['awarded', 'rejected'].includes(this.status) && !this.decisionDate) {
    this.decisionDate = new Date();
  }
  next();
});

// Static method to get applications by status
ScholarshipApplicationSchema.statics.findByStatus = function(status: string) {
  return this.find({ status });
};

// Static method to get applications requiring interviews
ScholarshipApplicationSchema.statics.findRequiringInterviews = function() {
  return this.find({ requiresInterview: true, interviewScheduled: false });
};

// Instance method to schedule interview
ScholarshipApplicationSchema.methods.scheduleInterview = function(date: Date, type: string, notes?: string) {
  this.interviewScheduled = true;
  this.interviewDate = date;
  this.interviewType = type;
  if (notes) this.interviewNotes = notes;
  return this.save();
};

// Instance method to update award details
ScholarshipApplicationSchema.methods.updateAward = function(amount: number, currency: string, conditions?: string) {
  this.awardAmount = amount;
  this.awardCurrency = currency;
  if (conditions) this.awardConditions = conditions;
  this.status = 'awarded';
  this.decisionDate = new Date();
  return this.save();
};

export default mongoose.models.ScholarshipApplication || 
  mongoose.model<IScholarshipApplication>('ScholarshipApplication', ScholarshipApplicationSchema);