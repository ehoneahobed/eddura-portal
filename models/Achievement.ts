import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Achievement interface for gamification
 */
export interface IAchievement extends Document {
  // Basic Information
  name: string;
  description: string;
  category: 'squad' | 'personal' | 'document' | 'application' | 'review' | 'streak' | 'milestone';
  icon: string;
  color: string;
  
  // Requirements & Progress
  requirements: {
    type: 'count' | 'streak' | 'percentage' | 'completion';
    target: number;
    metric: string; // e.g., 'documents_created', 'days_active', 'squad_goals_completed'
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  };
  
  // Rewards
  rewards: {
    points: number;
    badges?: string[];
    tokens?: number;
    specialAccess?: string[];
  };
  
  // Status
  isActive: boolean;
  isHidden: boolean;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Achievement interface for tracking user progress
 */
export interface IUserAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  achievementId: mongoose.Types.ObjectId;
  squadId?: mongoose.Types.ObjectId;
  
  // Progress Tracking
  currentProgress: number;
  targetProgress: number;
  isCompleted: boolean;
  completedAt?: Date;
  
  // Rewards
  pointsEarned: number;
  tokensEarned: number;
  badgesEarned: string[];
  
  // Timestamps
  startedAt: Date;
  updatedAt: Date;
}

const AchievementSchema: Schema = new Schema<IAchievement>({
  // Basic Information
  name: { 
    type: String, 
    required: true, 
    maxlength: 100 
  },
  description: { 
    type: String, 
    required: true, 
    maxlength: 500 
  },
  category: { 
    type: String, 
    enum: ['squad', 'personal', 'document', 'application', 'review', 'streak', 'milestone'],
    required: true 
  },
  icon: { 
    type: String, 
    required: true 
  },
  color: { 
    type: String, 
    required: true 
  },
  
  // Requirements & Progress
  requirements: {
    type: { 
      type: String, 
      enum: ['count', 'streak', 'percentage', 'completion'],
      required: true 
    },
    target: { 
      type: Number, 
      required: true, 
      min: 1 
    },
    metric: { 
      type: String, 
      required: true 
    },
    timeframe: { 
      type: String, 
      enum: ['daily', 'weekly', 'monthly', 'all_time'] 
    }
  },
  
  // Rewards
  rewards: {
    points: { 
      type: Number, 
      default: 0 
    },
    badges: [{ 
      type: String 
    }],
    tokens: { 
      type: Number, 
      default: 0 
    },
    specialAccess: [{ 
      type: String 
    }]
  },
  
  // Status
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isHidden: { 
    type: Boolean, 
    default: false 
  },
  rarity: { 
    type: String, 
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common' 
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const UserAchievementSchema: Schema = new Schema<IUserAchievement>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  achievementId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Achievement', 
    required: true 
  },
  squadId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Squad' 
  },
  
  // Progress Tracking
  currentProgress: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  targetProgress: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  isCompleted: { 
    type: Boolean, 
    default: false 
  },
  completedAt: { 
    type: Date 
  },
  
  // Rewards
  pointsEarned: { 
    type: Number, 
    default: 0 
  },
  tokensEarned: { 
    type: Number, 
    default: 0 
  },
  badgesEarned: [{ 
    type: String 
  }],
  
  // Timestamps
  startedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for progress percentage
UserAchievementSchema.virtual('progressPercentage').get(function() {
  const currentProgress = this.currentProgress as number;
  const targetProgress = this.targetProgress as number;
  return Math.round((currentProgress / targetProgress) * 100);
});

// Indexes
AchievementSchema.index({ category: 1, isActive: 1 });
AchievementSchema.index({ rarity: 1 });
UserAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });
UserAchievementSchema.index({ userId: 1, isCompleted: 1 });
UserAchievementSchema.index({ squadId: 1, isCompleted: 1 });

const Achievement: Model<IAchievement> = mongoose.models.Achievement || mongoose.model<IAchievement>('Achievement', AchievementSchema);
const UserAchievement: Model<IUserAchievement> = mongoose.models.UserAchievement || mongoose.model<IUserAchievement>('UserAchievement', UserAchievementSchema);

export { Achievement, UserAchievement };
export default Achievement;