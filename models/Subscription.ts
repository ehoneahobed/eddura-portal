import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Subscription interface representing a user's subscription in the platform
 */
export interface ISubscription extends Document {
  // Basic Information
  userId: mongoose.Types.ObjectId;
  planId: string;
  planName: string;
  planType: 'free' | 'basic' | 'premium' | 'enterprise' | 'custom';
  
  // Subscription Status
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | 'paused';
  isActive: boolean;
  
  // Billing Information
  billingCycle: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  amount: number;
  currency: string;
  nextBillingDate: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  
  // Payment Gateway Information
  paymentGateway: 'stripe' | 'paystack' | 'flutterwave' | 'paypal' | 'razorpay' | 'custom';
  gatewaySubscriptionId?: string;
  gatewayCustomerId?: string;
  
  // Usage Tracking
  usageLimit?: number;
  currentUsage?: number;
  overageAmount?: number;
  
  // Trial Information
  trialStart?: Date;
  trialEnd?: Date;
  isTrialActive: boolean;
  
  // Cancellation Information
  canceledAt?: Date;
  cancelReason?: string;
  willCancelAtPeriodEnd: boolean;
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  isExpired(): boolean;
  isInTrial(): boolean;
  daysUntilRenewal(): number;
  canAccessFeature(feature: string): boolean;
}

/**
 * Subscription Plan interface for defining available plans
 */
export interface ISubscriptionPlan extends Document {
  planId: string;
  name: string;
  description: string;
  planType: 'free' | 'basic' | 'premium' | 'enterprise' | 'custom';
  
  // Pricing
  monthlyPrice: number;
  quarterlyPrice?: number;
  yearlyPrice?: number;
  currency: string;
  
  // Features
  features: {
    maxApplications?: number;
    maxDocuments?: number;
    maxRecommendations?: number;
    aiFeatures?: boolean;
    prioritySupport?: boolean;
    customBranding?: boolean;
    advancedAnalytics?: boolean;
    apiAccess?: boolean;
    [key: string]: any;
  };
  
  // Limits
  limits: {
    storageGB?: number;
    apiCallsPerMonth?: number;
    teamMembers?: number;
    [key: string]: any;
  };
  
  // Status
  isActive: boolean;
  isPopular?: boolean;
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Payment Transaction interface for tracking all payment activities
 */
export interface IPaymentTransaction extends Document {
  // Basic Information
  userId: mongoose.Types.ObjectId;
  subscriptionId?: mongoose.Types.ObjectId;
  
  // Transaction Details
  transactionId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed';
  
  // Payment Gateway Information
  paymentGateway: 'stripe' | 'paystack' | 'flutterwave' | 'paypal' | 'razorpay' | 'custom';
  gatewayTransactionId?: string;
  gatewayResponse?: Record<string, any>;
  
  // Payment Method
  paymentMethod: 'card' | 'bank_transfer' | 'mobile_money' | 'crypto' | 'wallet';
  paymentMethodDetails?: {
    cardType?: string;
    last4?: string;
    bankName?: string;
    accountNumber?: string;
    [key: string]: any;
  };
  
  // Billing Information
  billingAddress?: {
    country: string;
    state?: string;
    city?: string;
    postalCode?: string;
    line1?: string;
    line2?: string;
  };
  
  // Description
  description: string;
  metadata?: Record<string, any>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Subscription Schema
const subscriptionSchema = new Schema<ISubscription>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  planId: {
    type: String,
    required: true
  },
  planName: {
    type: String,
    required: true
  },
  planType: {
    type: String,
    enum: ['free', 'basic', 'premium', 'enterprise', 'custom'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'unpaid', 'trialing', 'paused'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly', 'custom'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  nextBillingDate: {
    type: Date,
    required: true
  },
  currentPeriodStart: {
    type: Date,
    required: true
  },
  currentPeriodEnd: {
    type: Date,
    required: true
  },
  paymentGateway: {
    type: String,
    enum: ['stripe', 'paystack', 'flutterwave', 'paypal', 'razorpay', 'custom'],
    required: true
  },
  gatewaySubscriptionId: String,
  gatewayCustomerId: String,
  usageLimit: Number,
  currentUsage: {
    type: Number,
    default: 0
  },
  overageAmount: {
    type: Number,
    default: 0
  },
  trialStart: Date,
  trialEnd: Date,
  isTrialActive: {
    type: Boolean,
    default: false
  },
  canceledAt: Date,
  cancelReason: String,
  willCancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Subscription Plan Schema
const subscriptionPlanSchema = new Schema<ISubscriptionPlan>({
  planId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  planType: {
    type: String,
    enum: ['free', 'basic', 'premium', 'enterprise', 'custom'],
    required: true
  },
  monthlyPrice: {
    type: Number,
    required: true
  },
  quarterlyPrice: Number,
  yearlyPrice: Number,
  currency: {
    type: String,
    default: 'USD'
  },
  features: {
    type: Schema.Types.Mixed,
    default: {}
  },
  limits: {
    type: Schema.Types.Mixed,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Payment Transaction Schema
const paymentTransactionSchema = new Schema<IPaymentTransaction>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subscriptionId: {
    type: Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'disputed'],
    default: 'pending'
  },
  paymentGateway: {
    type: String,
    enum: ['stripe', 'paystack', 'flutterwave', 'paypal', 'razorpay', 'custom'],
    required: true
  },
  gatewayTransactionId: String,
  gatewayResponse: {
    type: Schema.Types.Mixed,
    default: {}
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'mobile_money', 'crypto', 'wallet'],
    required: true
  },
  paymentMethodDetails: {
    type: Schema.Types.Mixed,
    default: {}
  },
  billingAddress: {
    country: String,
    state: String,
    city: String,
    postalCode: String,
    line1: String,
    line2: String
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Subscription Methods
subscriptionSchema.methods.isExpired = function(): boolean {
  return new Date() > this.currentPeriodEnd;
};

subscriptionSchema.methods.isInTrial = function(): boolean {
  if (!this.trialStart || !this.trialEnd) return false;
  const now = new Date();
  return now >= this.trialStart && now <= this.trialEnd;
};

subscriptionSchema.methods.daysUntilRenewal = function(): number {
  const now = new Date();
  const diffTime = this.nextBillingDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

subscriptionSchema.methods.canAccessFeature = function(feature: string): boolean {
  // This would be implemented based on the plan features
  // For now, return true for active subscriptions
  return this.isActive && this.status === 'active';
};

// Indexes
subscriptionSchema.index({ userId: 1, isActive: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ nextBillingDate: 1 });

paymentTransactionSchema.index({ userId: 1, createdAt: -1 });
paymentTransactionSchema.index({ status: 1 });
paymentTransactionSchema.index({ paymentGateway: 1 });

// Models
export const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);
export const SubscriptionPlan = mongoose.model<ISubscriptionPlan>('SubscriptionPlan', subscriptionPlanSchema);
export const PaymentTransaction = mongoose.model<IPaymentTransaction>('PaymentTransaction', paymentTransactionSchema);

export type { ISubscription, ISubscriptionPlan, IPaymentTransaction };