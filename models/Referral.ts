import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Referral interface for tracking user referrals
 */
export interface IReferral extends Document {
  // Referral Information
  referrerId: mongoose.Types.ObjectId; // User who created the referral
  referredId?: mongoose.Types.ObjectId; // User who used the referral (optional until used)
  referralCode: string; // Unique referral code
  referralLink: string; // Full referral link
  
  // Status
  isUsed: boolean;
  usedAt?: Date;
  
  // Rewards
  referrerReward: number; // Tokens earned by referrer
  referredReward: number; // Tokens earned by referred user
  referrerRewardClaimed: boolean;
  referredRewardClaimed: boolean;
  
  // Tracking
  clicks: number; // Number of times link was clicked
  signups: number; // Number of successful signups from this referral
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema: Schema = new Schema<IReferral>({
  // Referral Information
  referrerId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  referredId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  referralCode: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    minlength: 6,
    maxlength: 10
  },
  referralLink: { 
    type: String, 
    required: true 
  },
  
  // Status
  isUsed: { 
    type: Boolean, 
    default: false 
  },
  usedAt: { 
    type: Date 
  },
  
  // Rewards
  referrerReward: { 
    type: Number, 
    default: 50, // 50 tokens for successful referral
    min: 0 
  },
  referredReward: { 
    type: Number, 
    default: 25, // 25 tokens for new user
    min: 0 
  },
  referrerRewardClaimed: { 
    type: Boolean, 
    default: false 
  },
  referredRewardClaimed: { 
    type: Boolean, 
    default: false 
  },
  
  // Tracking
  clicks: { 
    type: Number, 
    default: 0 
  },
  signups: { 
    type: Number, 
    default: 0 
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for referral status
ReferralSchema.virtual('status').get(function() {
  if ((this as any).isUsed) return 'used';
  if ((this as any).clicks > 0) return 'active';
  return 'pending';
});

// Virtual for total reward value
ReferralSchema.virtual('totalRewardValue').get(function() {
  return (this as any).referrerReward + (this as any).referredReward;
});

// Indexes for better query performance
ReferralSchema.index({ referrerId: 1 });
ReferralSchema.index({ referralCode: 1 }, { unique: true });
ReferralSchema.index({ isUsed: 1 });
ReferralSchema.index({ createdAt: -1 });

const Referral: Model<IReferral> = mongoose.models.Referral || mongoose.model<IReferral>('Referral', ReferralSchema);

export default Referral;