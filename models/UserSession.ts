import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * UserSession interface representing a user's session on the platform
 */
export interface IUserSession extends Document {
  userId?: mongoose.Types.ObjectId;
  adminId?: mongoose.Types.ObjectId;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  isActive: boolean;
  
  // Device and browser information
  userAgent?: string;
  browser?: string;
  browserVersion?: string;
  os?: string;
  device?: string;
  screenResolution?: string;
  
  // Location information
  ipAddress?: string;
  country?: string;
  city?: string;
  timezone?: string;
  
  // Session metadata
  referrer?: string;
  entryPage?: string;
  exitPage?: string;
  totalPages: number;
  
  // Engagement metrics
  totalTimeOnSite: number; // in seconds
  averageTimePerPage: number; // in seconds
  bounceRate: boolean; // left after viewing only one page
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * UserSession schema
 */
const UserSessionSchema = new Schema<IUserSession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true
  },
  adminId: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
    required: false,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Device and browser information
  userAgent: {
    type: String,
    default: null
  },
  browser: {
    type: String,
    default: null
  },
  browserVersion: {
    type: String,
    default: null
  },
  os: {
    type: String,
    default: null
  },
  device: {
    type: String,
    default: null
  },
  screenResolution: {
    type: String,
    default: null
  },
  
  // Location information
  ipAddress: {
    type: String,
    default: null
  },
  country: {
    type: String,
    default: null
  },
  city: {
    type: String,
    default: null
  },
  timezone: {
    type: String,
    default: null
  },
  
  // Session metadata
  referrer: {
    type: String,
    default: null
  },
  entryPage: {
    type: String,
    default: null
  },
  exitPage: {
    type: String,
    default: null
  },
  totalPages: {
    type: Number,
    default: 0
  },
  
  // Engagement metrics
  totalTimeOnSite: {
    type: Number,
    default: 0
  },
  averageTimePerPage: {
    type: Number,
    default: 0
  },
  bounceRate: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
UserSessionSchema.index({ userId: 1, startTime: -1 });
UserSessionSchema.index({ adminId: 1, startTime: -1 });
UserSessionSchema.index({ sessionId: 1 });
UserSessionSchema.index({ isActive: 1 });
UserSessionSchema.index({ startTime: -1 });
UserSessionSchema.index({ country: 1 });
UserSessionSchema.index({ browser: 1 });
UserSessionSchema.index({ device: 1 });

// Virtual for session duration
UserSessionSchema.virtual('sessionDuration').get(function() {
  if (this.endTime && this.startTime) {
    return Math.floor((this.endTime.getTime() - this.startTime.getTime()) / 1000);
  }
  return null;
});

// Method to end session
UserSessionSchema.methods.endSession = function() {
  this.endTime = new Date();
  this.isActive = false;
  if (this.startTime) {
    this.duration = Math.floor((this.endTime.getTime() - this.startTime.getTime()) / 1000);
  }
  return this.save();
};

// Method to update session metrics
UserSessionSchema.methods.updateMetrics = function(totalPages: number, totalTime: number) {
  this.totalPages = totalPages;
  this.totalTimeOnSite = totalTime;
  this.averageTimePerPage = totalPages > 0 ? totalTime / totalPages : 0;
  this.bounceRate = totalPages <= 1;
  return this.save();
};

const UserSession = mongoose.models.UserSession || mongoose.model<IUserSession>('UserSession', UserSessionSchema);

export default UserSession;