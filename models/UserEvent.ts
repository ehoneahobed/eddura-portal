import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * UserEvent interface representing user actions and events
 */
export interface IUserEvent extends Document {
  userId?: mongoose.Types.ObjectId; // Optional for anonymous users
  sessionId: string;
  eventType: string; // 'login', 'logout', 'search', 'filter', 'save', 'download', 'share', etc.
  eventCategory: string; // 'authentication', 'navigation', 'content', 'engagement', 'error'
  
  // Event details
  eventName: string;
  eventData?: any; // Additional event-specific data
  pageUrl?: string;
  pageTitle?: string;
  
  // User context
  userType?: 'anonymous' | 'registered' | 'admin';
  userRole?: string;
  
  // Device and browser information
  userAgent?: string;
  browser?: string;
  os?: string;
  device?: string;
  
  // Location information
  ipAddress?: string;
  country?: string;
  city?: string;
  
  // Timing
  eventTime: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * UserEvent schema
 */
const UserEventSchema = new Schema<IUserEvent>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  eventType: {
    type: String,
    required: true,
    index: true
  },
  eventCategory: {
    type: String,
    required: true,
    index: true
  },
  
  // Event details
  eventName: {
    type: String,
    required: true
  },
  eventData: {
    type: Schema.Types.Mixed,
    default: null
  },
  pageUrl: {
    type: String,
    default: null
  },
  pageTitle: {
    type: String,
    default: null
  },
  
  // User context
  userType: {
    type: String,
    enum: ['anonymous', 'registered', 'admin'],
    default: 'anonymous',
    index: true
  },
  userRole: {
    type: String,
    default: null
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
  os: {
    type: String,
    default: null
  },
  device: {
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
  
  // Timing
  eventTime: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
UserEventSchema.index({ sessionId: 1, eventTime: -1 });
UserEventSchema.index({ eventType: 1 });
UserEventSchema.index({ eventCategory: 1 });
UserEventSchema.index({ eventTime: -1 });
UserEventSchema.index({ userId: 1, eventTime: -1 });
UserEventSchema.index({ userType: 1 });
UserEventSchema.index({ country: 1 });

// Compound indexes for common queries
UserEventSchema.index({ eventType: 1, eventTime: -1 });
UserEventSchema.index({ eventCategory: 1, eventTime: -1 });
UserEventSchema.index({ userId: 1, eventType: 1 });

// Method to add event data
UserEventSchema.methods.addEventData = function(data: any) {
  this.eventData = { ...this.eventData, ...data };
  return this.save();
};

// Static method to track common events
UserEventSchema.statics.trackEvent = async function(data: {
  userId?: mongoose.Types.ObjectId;
  sessionId: string;
  eventType: string;
  eventCategory: string;
  eventName: string;
  eventData?: any;
  pageUrl?: string;
  pageTitle?: string;
  userType?: 'anonymous' | 'registered' | 'admin';
  userRole?: string;
  userAgent?: string;
  browser?: string;
  os?: string;
  device?: string;
  ipAddress?: string;
  country?: string;
  city?: string;
}) {
  return this.create(data);
};

// Static method to get event statistics
UserEventSchema.statics.getEventStats = async function(startDate: Date, endDate: Date) {
  return this.aggregate([
    {
      $match: {
        eventTime: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          eventType: '$eventType',
          eventCategory: '$eventCategory'
        },
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' },
        uniqueSessions: { $addToSet: '$sessionId' }
      }
    },
    {
      $project: {
        eventType: '$_id.eventType',
        eventCategory: '$_id.eventCategory',
        count: 1,
        uniqueUsers: { $size: '$uniqueUsers' },
        uniqueSessions: { $size: '$uniqueSessions' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

const UserEvent = mongoose.models.UserEvent || mongoose.model<IUserEvent>('UserEvent', UserEventSchema);

export default UserEvent;