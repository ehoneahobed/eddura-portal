import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Eddura Squad interface representing a collaborative group for application support
 */
export interface IEdduraSquad extends Document {
  // Squad Identity
  name: string;
  description: string;
  maxMembers: number;
  visibility: 'public' | 'private' | 'invite_only';
  
  // Formation Criteria (Optional)
  formationType: 'general' | 'academic_level' | 'field_of_study' | 'geographic' | 'activity_based';
  
  // Optional Filters (Not Required)
  academicLevel?: string[];
  fieldOfStudy?: string[];
  geographicRegion?: string[];
  
  // Squad Goals (Trackable & Measurable)
  goals: Array<{
    type: 'applications_started' | 'applications_completed' | 'documents_created' | 'peer_reviews_provided' | 'days_active' | 'streak_days' | 'squad_activity';
    target: number;
    timeframe: 'weekly' | 'monthly' | 'quarterly' | 'ongoing';
    startDate: Date;
    endDate: Date;
    description?: string;
    individualTarget?: number;
    currentProgress: number;
    progressPercentage: number;
    daysRemaining: number;
    isOnTrack: boolean;
    memberProgress: Array<{
      userId: mongoose.Types.ObjectId;
      progress: number;
      target: number;
      percentage: number;
      lastActivity: Date;
      needsHelp: boolean;
      isOnTrack: boolean;
    }>;
  }>;
  
  // Squad Settings
  squadType: 'primary' | 'secondary';
  creatorId: mongoose.Types.ObjectId;
  memberIds: mongoose.Types.ObjectId[];
  
  // Activity Tracking
  totalApplications: number;
  totalDocuments: number;
  totalReviews: number;
  averageActivityScore: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Squad Goal Schema
const SquadGoalSchema = new Schema({
  type: {
    type: String,
    enum: ['applications_started', 'applications_completed', 'documents_created', 'peer_reviews_provided', 'days_active', 'streak_days', 'squad_activity'],
    required: true
  },
  target: { type: Number, required: true, min: 1 },
  timeframe: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly', 'ongoing'],
    required: true
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  description: { type: String, trim: true },
  individualTarget: { type: Number, min: 1 },
  currentProgress: { type: Number, default: 0, min: 0 },
  progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
  daysRemaining: { type: Number, default: 0 },
  isOnTrack: { type: Boolean, default: true },
  memberProgress: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    progress: { type: Number, default: 0, min: 0 },
    target: { type: Number, min: 1 },
    percentage: { type: Number, default: 0, min: 0, max: 100 },
    lastActivity: { type: Date, default: Date.now },
    needsHelp: { type: Boolean, default: false },
    isOnTrack: { type: Boolean, default: true }
  }]
}, { _id: false });

const EdduraSquadSchema: Schema = new Schema<IEdduraSquad>({
  // Squad Identity
  name: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 100 
  },
  description: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 500 
  },
  maxMembers: { 
    type: Number, 
    required: true, 
    min: 2, 
    max: 12 
  },
  visibility: { 
    type: String, 
    enum: ['public', 'private', 'invite_only'], 
    default: 'invite_only' 
  },
  
  // Formation Criteria (Optional)
  formationType: { 
    type: String, 
    enum: ['general', 'academic_level', 'field_of_study', 'geographic', 'activity_based'],
    default: 'general'
  },
  
  // Optional Filters (Not Required)
  academicLevel: [{ 
    type: String, 
    trim: true 
  }],
  fieldOfStudy: [{ 
    type: String, 
    trim: true 
  }],
  geographicRegion: [{ 
    type: String, 
    trim: true 
  }],
  
  // Squad Goals (Trackable & Measurable)
  goals: [SquadGoalSchema],
  
  // Squad Settings
  squadType: { 
    type: String, 
    enum: ['primary', 'secondary'], 
    required: true 
  },
  creatorId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  memberIds: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  
  // Activity Tracking
  totalApplications: { 
    type: Number, 
    default: 0 
  },
  totalDocuments: { 
    type: Number, 
    default: 0 
  },
  totalReviews: { 
    type: Number, 
    default: 0 
  },
  averageActivityScore: { 
    type: Number, 
    default: 0 
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for member count
EdduraSquadSchema.virtual('memberCount').get(function() {
  return this.memberIds ? (this.memberIds as any[]).length : 0;
});

// Virtual for squad activity level
EdduraSquadSchema.virtual('activityLevel').get(function() {
  const score = this.averageActivityScore as number;
  if (score >= 80) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
});

// Virtual for squad completion percentage
EdduraSquadSchema.virtual('completionPercentage').get(function() {
  const goals = this.goals as any[];
  if (!goals || goals.length === 0) return 0;
  
  const totalProgress = goals.reduce((sum: number, goal: any) => sum + goal.progressPercentage, 0);
  return Math.round(totalProgress / goals.length);
});

// Indexes for better query performance
EdduraSquadSchema.index({ squadType: 1 });
EdduraSquadSchema.index({ formationType: 1 });
EdduraSquadSchema.index({ visibility: 1 });
EdduraSquadSchema.index({ creatorId: 1 });
EdduraSquadSchema.index({ memberIds: 1 });
EdduraSquadSchema.index({ createdAt: -1 });

const EdduraSquad: Model<IEdduraSquad> = mongoose.models.EddurSquad || mongoose.model<IEdduraSquad>('EddurSquad', EdduraSquadSchema);

export default EdduraSquad;