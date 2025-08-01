import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * PageView interface representing a user's page visit
 */
export interface IPageView extends Document {
  userId?: mongoose.Types.ObjectId; // Optional for anonymous users
  sessionId: string;
  pageUrl: string;
  pageTitle: string;
  pageType: string; // 'home', 'schools', 'programs', 'scholarships', 'admin', etc.
  
  // Timing information
  visitTime: Date;
  timeOnPage: number; // in seconds
  isBounce: boolean; // user left after this page
  
  // User interaction data
  scrollDepth: number; // percentage of page scrolled (0-100)
  interactions: Array<{
    type: 'click' | 'scroll' | 'form_submit' | 'download' | 'link_click';
    element?: string;
    timestamp: Date;
    data?: any;
  }>;
  
  // Device and browser information
  userAgent?: string;
  browser?: string;
  os?: string;
  device?: string;
  screenResolution?: string;
  
  // Location information
  ipAddress?: string;
  country?: string;
  city?: string;
  
  // Referrer information
  referrer?: string;
  referrerDomain?: string;
  
  // Performance metrics
  pageLoadTime?: number; // in milliseconds
  domContentLoaded?: number; // in milliseconds
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * PageView schema
 */
const PageViewSchema = new Schema<IPageView>({
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
  pageUrl: {
    type: String,
    required: true
  },
  pageTitle: {
    type: String,
    required: true
  },
  pageType: {
    type: String,
    required: true,
    index: true
  },
  
  // Timing information
  visitTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  timeOnPage: {
    type: Number,
    default: 0
  },
  isBounce: {
    type: Boolean,
    default: false
  },
  
  // User interaction data
  scrollDepth: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  interactions: [{
    type: {
      type: String,
      enum: ['click', 'scroll', 'form_submit', 'download', 'link_click'],
      required: true
    },
    element: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    data: Schema.Types.Mixed
  }],
  
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
  
  // Referrer information
  referrer: {
    type: String,
    default: null
  },
  referrerDomain: {
    type: String,
    default: null
  },
  
  // Performance metrics
  pageLoadTime: {
    type: Number,
    default: null
  },
  domContentLoaded: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
PageViewSchema.index({ sessionId: 1, visitTime: -1 });
PageViewSchema.index({ pageType: 1 });
PageViewSchema.index({ visitTime: -1 });
PageViewSchema.index({ userId: 1, visitTime: -1 });
PageViewSchema.index({ pageUrl: 1 });
PageViewSchema.index({ country: 1 });
PageViewSchema.index({ browser: 1 });
PageViewSchema.index({ device: 1 });

// Method to add interaction
PageViewSchema.methods.addInteraction = function(type: string, element?: string, data?: any) {
  this.interactions.push({
    type: type as any,
    element,
    timestamp: new Date(),
    data
  });
  return this.save();
};

// Method to update scroll depth
PageViewSchema.methods.updateScrollDepth = function(depth: number) {
  this.scrollDepth = Math.max(this.scrollDepth, depth);
  return this.save();
};

// Method to update time on page
PageViewSchema.methods.updateTimeOnPage = function(time: number) {
  this.timeOnPage = time;
  return this.save();
};

// Method to mark as bounce
PageViewSchema.methods.markAsBounce = function() {
  this.isBounce = true;
  return this.save();
};

const PageView = mongoose.models.PageView || mongoose.model<IPageView>('PageView', PageViewSchema);

export default PageView;