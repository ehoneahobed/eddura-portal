import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Notification interface for real-time alerts and achievements
 */
export interface INotification extends Document {
  // Basic Information
  userId: mongoose.Types.ObjectId;
  type: 'squad_activity' | 'goal_progress' | 'help_request' | 'achievement' | 'invitation' | 'reminder';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Content & Actions
  content?: {
    squadId?: mongoose.Types.ObjectId;
    goalId?: string;
    achievementId?: string;
    memberId?: mongoose.Types.ObjectId;
    actionUrl?: string;
  };
  
  // Status & Delivery
  isRead: boolean;
  isDelivered: boolean;
  readAt?: Date;
  deliveredAt?: Date;
  
  // Metadata
  metadata?: {
    squadName?: string;
    goalName?: string;
    achievementName?: string;
    memberName?: string;
    progressPercentage?: number;
    daysRemaining?: number;
  };
  
  // Timestamps
  createdAt: Date;
  expiresAt?: Date;
}

const NotificationSchema: Schema = new Schema<INotification>({
  // Basic Information
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['squad_activity', 'goal_progress', 'help_request', 'achievement', 'invitation', 'reminder'],
    required: true 
  },
  title: { 
    type: String, 
    required: true, 
    maxlength: 200 
  },
  message: { 
    type: String, 
    required: true, 
    maxlength: 1000 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  },
  
  // Content & Actions
  content: {
    squadId: { type: Schema.Types.ObjectId, ref: 'Squad' },
    goalId: { type: String },
    achievementId: { type: String },
    memberId: { type: Schema.Types.ObjectId, ref: 'User' },
    actionUrl: { type: String }
  },
  
  // Status & Delivery
  isRead: { 
    type: Boolean, 
    default: false 
  },
  isDelivered: { 
    type: Boolean, 
    default: false 
  },
  readAt: { 
    type: Date 
  },
  deliveredAt: { 
    type: Date 
  },
  
  // Metadata
  metadata: {
    squadName: { type: String },
    goalName: { type: String },
    achievementName: { type: String },
    memberName: { type: String },
    progressPercentage: { type: Number },
    daysRemaining: { type: Number }
  },
  
  // Timestamps
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  expiresAt: { 
    type: Date 
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for notification age
NotificationSchema.virtual('age').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks}w ago`;
});

// Indexes for better query performance
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ priority: 1 });
NotificationSchema.index({ expiresAt: 1 });

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;