import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Subscription, SubscriptionPlan } from '@/models/Subscription';
import User from '@/models/User';
import { isPaywallEnabled } from './payment-config';

export interface PaywallConfig {
  // Feature requirements
  requiredFeature?: string;
  requiredPlan?: 'free' | 'basic' | 'premium' | 'enterprise';
  
  // Usage limits
  usageType?: 'applications' | 'documents' | 'recommendations' | 'scholarships' | 'programs' | 'schools' | 'aiCalls' | 'storage' | 'searchQueries';
  usageLimit?: number;
  
  // Trial settings
  allowTrial?: boolean;
  trialDays?: number;
  
  // Error responses
  errorMessage?: string;
  redirectTo?: string;
}

export interface PaywallResult {
  allowed: boolean;
  reason?: string;
  subscription?: any;
  usage?: {
    current: number;
    limit: number;
    percentage: number;
  };
  trial?: {
    isActive: boolean;
    daysRemaining: number;
    endDate: Date;
  };
}

/**
 * Check if a user has access to a specific feature
 */
export async function checkFeatureAccess(
  userId: string, 
  feature: string
): Promise<PaywallResult> {
  try {
    await connectDB();

    // Get user's active subscription
    const subscription = await Subscription.findOne({
      userId,
      isActive: true,
      status: { $in: ['active', 'trialing'] }
    });

    if (!subscription) {
      return {
        allowed: false,
        reason: 'No active subscription found'
      };
    }

    // Get plan details
    const plan = await SubscriptionPlan.findOne({ planId: subscription.planId });
    if (!plan) {
      return {
        allowed: false,
        reason: 'Plan not found'
      };
    }

    // Check if feature is enabled for this plan
    const featureEnabled = plan.features[feature];
    if (featureEnabled === false) {
      return {
        allowed: false,
        reason: `Feature '${feature}' not available in your plan`,
        subscription
      };
    }

    // Check trial status
    const trial = subscription.isTrialActive ? {
      isActive: true,
      daysRemaining: Math.ceil((new Date(subscription.trialEnd || 0).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      endDate: subscription.trialEnd
    } : null;

    return {
      allowed: true,
      subscription,
      trial
    };
  } catch (error) {
    console.error('Error checking feature access:', error);
    return {
      allowed: false,
      reason: 'Error checking subscription status'
    };
  }
}

/**
 * Check usage limits for a specific resource
 */
export async function checkUsageLimit(
  userId: string,
  usageType: string,
  currentUsage?: number
): Promise<PaywallResult> {
  try {
    await connectDB();

    // Get user's active subscription
    const subscription = await Subscription.findOne({
      userId,
      isActive: true,
      status: { $in: ['active', 'trialing'] }
    });

    if (!subscription) {
      return {
        allowed: false,
        reason: 'No active subscription found'
      };
    }

    // Get plan details
    const plan = await SubscriptionPlan.findOne({ planId: subscription.planId });
    if (!plan) {
      return {
        allowed: false,
        reason: 'Plan not found'
      };
    }

    // Get current usage
    let current = currentUsage || 0;
    
    // If not provided, try to get from subscription
    if (!currentUsage) {
      switch (usageType) {
        case 'applications':
          current = subscription.currentUsage || 0;
          break;
        case 'documents':
          // You might want to count from Document model
          current = 0;
          break;
        case 'recommendations':
          // You might want to count from RecommendationLetter model
          current = 0;
          break;
        case 'scholarships':
          // You might want to count from SavedScholarship model
          current = 0;
          break;
        default:
          current = 0;
      }
    }

    // Get limit from plan
    const limit = plan.features[`max${usageType.charAt(0).toUpperCase() + usageType.slice(1)}`] || 0;
    
    // Unlimited check
    if (limit === -1) {
      return {
        allowed: true,
        subscription,
        usage: {
          current,
          limit: -1,
          percentage: 0
        }
      };
    }

    // Check if usage is within limit
    const allowed = current < limit;
    const percentage = limit > 0 ? (current / limit) * 100 : 0;

    return {
      allowed,
      reason: allowed ? undefined : `Usage limit exceeded for ${usageType}`,
      subscription,
      usage: {
        current,
        limit,
        percentage
      }
    };
  } catch (error) {
    console.error('Error checking usage limit:', error);
    return {
      allowed: false,
      reason: 'Error checking usage limits'
    };
  }
}

/**
 * Middleware function to enforce paywall for API routes
 */
export async function enforcePaywall(
  request: NextRequest,
  config: PaywallConfig
): Promise<PaywallResult> {
  try {
    // Check if paywall is enabled
    if (!isPaywallEnabled()) {
      return {
        allowed: true,
        reason: 'Paywall disabled'
      };
    }

    // Get user session
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return {
        allowed: false,
        reason: 'Authentication required'
      };
    }

    const userId = session.user.id;

    // Check if user is on trial
    const user = await User.findById(userId);
    if (!user) {
      return {
        allowed: false,
        reason: 'User not found'
      };
    }

    // Get user's subscription
    const subscription = await Subscription.findOne({
      userId,
      isActive: true,
      status: { $in: ['active', 'trialing'] }
    });

    // If no subscription, check if trial is allowed
    if (!subscription && config.allowTrial) {
      // Check if user is within trial period (first 7 days after registration)
      const trialEndDate = new Date(user.createdAt.getTime() + (config.trialDays || 7) * 24 * 60 * 60 * 1000);
      const isInTrial = new Date() <= trialEndDate;
      
      if (isInTrial) {
        return {
          allowed: true,
          trial: {
            isActive: true,
            daysRemaining: Math.ceil((trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
            endDate: trialEndDate
          }
        };
      }
    }

    // Check feature access if required
    if (config.requiredFeature) {
      const featureCheck = await checkFeatureAccess(userId, config.requiredFeature);
      if (!featureCheck.allowed) {
        return featureCheck;
      }
    }

    // Check usage limits if required
    if (config.usageType) {
      const usageCheck = await checkUsageLimit(userId, config.usageType);
      if (!usageCheck.allowed) {
        return usageCheck;
      }
    }

    // Check plan requirements
    if (config.requiredPlan && subscription) {
      const plan = await SubscriptionPlan.findOne({ planId: subscription.planId });
      if (plan) {
        const planHierarchy = { free: 0, basic: 1, premium: 2, enterprise: 3 };
        const userPlanLevel = planHierarchy[plan.planType as keyof typeof planHierarchy] || 0;
        const requiredLevel = planHierarchy[config.requiredPlan];
        
        if (userPlanLevel < requiredLevel) {
          return {
            allowed: false,
            reason: `${config.requiredPlan} plan or higher required`,
            subscription
          };
        }
      }
    }

    return {
      allowed: true,
      subscription
    };
  } catch (error) {
    console.error('Error in paywall middleware:', error);
    return {
      allowed: false,
      reason: 'Error checking access permissions'
    };
  }
}

/**
 * Helper function to create paywall error response
 */
export function createPaywallResponse(result: PaywallResult, config: PaywallConfig): NextResponse {
  const errorMessage = config.errorMessage || result.reason || 'Access denied';
  
  if (config.redirectTo) {
    return NextResponse.redirect(new URL(config.redirectTo, process.env.NEXT_PUBLIC_APP_URL));
  }
  
  return NextResponse.json(
    {
      error: errorMessage,
      code: 'PAYWALL_RESTRICTED',
      subscription: result.subscription,
      usage: result.usage,
      trial: result.trial
    },
    { status: 403 }
  );
}

/**
 * Helper function to check if user is in trial period
 */
export async function isUserInTrial(userId: string): Promise<boolean> {
  try {
    await connectDB();
    
    const user = await User.findById(userId);
    if (!user) return false;
    
    const trialEndDate = new Date(user.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
    return new Date() <= trialEndDate;
  } catch (error) {
    console.error('Error checking trial status:', error);
    return false;
  }
}

/**
 * Helper function to get user's trial days remaining
 */
export async function getTrialDaysRemaining(userId: string): Promise<number> {
  try {
    await connectDB();
    
    const user = await User.findById(userId);
    if (!user) return 0;
    
    const trialEndDate = new Date(user.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
    const daysRemaining = Math.ceil((trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    return Math.max(0, daysRemaining);
  } catch (error) {
    console.error('Error getting trial days remaining:', error);
    return 0;
  }
}