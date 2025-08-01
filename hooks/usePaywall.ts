'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { getClientPaymentConfig } from '@/lib/payment/payment-config';

interface Subscription {
  _id: string;
  planId: string;
  planName: string;
  planType: string;
  status: string;
  isActive: boolean;
  billingCycle: string;
  amount: number;
  currency: string;
  nextBillingDate: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  paymentGateway: string;
  trialStart?: string;
  trialEnd?: string;
  isTrialActive: boolean;
  canceledAt?: string;
  willCancelAtPeriodEnd: boolean;
  currentUsage?: number;
  usageLimit?: number;
}

interface Usage {
  current: number;
  limit: number;
  percentage: number;
}

interface Trial {
  isActive: boolean;
  daysRemaining: number;
  endDate: Date;
}

interface PaywallResult {
  allowed: boolean;
  reason?: string;
  subscription?: Subscription;
  usage?: Usage;
  trial?: Trial;
}

export function usePaywall() {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [trial, setTrial] = useState<Trial | null>(null);
  
  const paymentConfig = getClientPaymentConfig();

  useEffect(() => {
    // If payments are disabled, don't fetch subscription
    if (!paymentConfig.enabled) {
      setLoading(false);
      return;
    }
    
    if (session?.user?.id) {
      fetchSubscription();
    } else {
      setLoading(false);
    }
  }, [session, paymentConfig.enabled]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/payments/subscriptions');
      const data = await response.json();
      
      if (data.subscription) {
        setSubscription(data.subscription);
        
        // Check trial status
        if (data.subscription.isTrialActive) {
          const trialEnd = new Date(data.subscription.trialEnd);
          const daysRemaining = Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          
          setTrial({
            isActive: true,
            daysRemaining: Math.max(0, daysRemaining),
            endDate: trialEnd
          });
        }
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFeatureAccess = async (feature: string): Promise<PaywallResult> => {
    try {
      const response = await fetch('/api/payments/check-feature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feature }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking feature access:', error);
      return {
        allowed: false,
        reason: 'Error checking feature access'
      };
    }
  };

  const checkUsageLimit = async (usageType: string): Promise<PaywallResult> => {
    try {
      const response = await fetch('/api/payments/check-usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usageType }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking usage limit:', error);
      return {
        allowed: false,
        reason: 'Error checking usage limits'
      };
    }
  };

  const isFeatureEnabled = (feature: string): boolean => {
    // If payments are disabled, all features are enabled
    if (!paymentConfig.enabled) return true;
    
    if (!subscription) return false;
    
    // For now, we'll use a simple check based on plan type
    // In a real implementation, you'd check the actual feature flags
    const planFeatures: Record<string, Record<string, boolean>> = {
      free: {
        documentLibrary: true,
        careerQuiz: true,
        emailNotifications: true,
        aiFeatures: false,
        documentTemplates: false,
        documentSharing: false,
        messaging: false,
        telegramBot: false,
        prioritySupport: false,
        advancedAnalytics: false,
        apiAccess: false,
        customBranding: false,
      },
      basic: {
        documentLibrary: true,
        careerQuiz: true,
        emailNotifications: true,
        aiFeatures: true,
        documentTemplates: true,
        documentSharing: true,
        messaging: true,
        telegramBot: false,
        prioritySupport: false,
        advancedAnalytics: false,
        apiAccess: false,
        customBranding: false,
      },
      premium: {
        documentLibrary: true,
        careerQuiz: true,
        emailNotifications: true,
        aiFeatures: true,
        documentTemplates: true,
        documentSharing: true,
        messaging: true,
        telegramBot: true,
        prioritySupport: true,
        advancedAnalytics: true,
        apiAccess: false,
        customBranding: false,
      },
      enterprise: {
        documentLibrary: true,
        careerQuiz: true,
        emailNotifications: true,
        aiFeatures: true,
        documentTemplates: true,
        documentSharing: true,
        messaging: true,
        telegramBot: true,
        prioritySupport: true,
        advancedAnalytics: true,
        apiAccess: true,
        customBranding: true,
      },
    };

    const planType = subscription.planType as keyof typeof planFeatures;
    return planFeatures[planType]?.[feature] || false;
  };

  const getUsageLimit = (usageType: string): number => {
    // If payments are disabled, return unlimited
    if (!paymentConfig.enabled) return -1;
    
    if (!subscription) return 0;
    
    const limits: Record<string, Record<string, number>> = {
      free: {
        applications: 3,
        documents: 5,
        recommendations: 2,
        scholarships: 10,
        programs: 5,
        schools: 5,
      },
      basic: {
        applications: 10,
        documents: 20,
        recommendations: 5,
        scholarships: 50,
        programs: 20,
        schools: 20,
      },
      premium: {
        applications: 50,
        documents: 100,
        recommendations: 15,
        scholarships: 200,
        programs: 100,
        schools: 100,
      },
      enterprise: {
        applications: -1, // Unlimited
        documents: -1,
        recommendations: -1,
        scholarships: -1,
        programs: -1,
        schools: -1,
      },
    };

    const planType = subscription.planType as keyof typeof limits;
    return limits[planType]?.[usageType] || 0;
  };

  const showUpgradePrompt = (feature?: string, usageType?: string) => {
    // If payments are disabled, don't show upgrade prompts
    if (!paymentConfig.enabled) return;
    
    let message = 'This feature requires a paid plan.';
    
    if (feature) {
      message = `The ${feature} feature requires a paid plan.`;
    } else if (usageType) {
      message = `You've reached your ${usageType} limit. Upgrade your plan for more.`;
    }
    
    toast.error(message, {
      action: {
        label: 'Upgrade',
        onClick: () => window.location.href = '/pricing'
      }
    });
  };

  const isInTrial = (): boolean => {
    // If payments are disabled, no trial
    if (!paymentConfig.enabled) return false;
    return trial?.isActive || false;
  };

  const getTrialDaysRemaining = (): number => {
    // If payments are disabled, no trial
    if (!paymentConfig.enabled) return 0;
    return trial?.daysRemaining || 0;
  };

  const hasActiveSubscription = (): boolean => {
    // If payments are disabled, consider as having active subscription
    if (!paymentConfig.enabled) return true;
    return subscription?.isActive && 
           ['active', 'trialing'].includes(subscription.status);
  };

  const getPlanType = (): string => {
    // If payments are disabled, return enterprise plan
    if (!paymentConfig.enabled) return 'enterprise';
    return subscription?.planType || 'free';
  };

  const getPlanName = (): string => {
    // If payments are disabled, return enterprise plan
    if (!paymentConfig.enabled) return 'Enterprise Plan';
    return subscription?.planName || 'Free Plan';
  };

  return {
    // State
    subscription,
    loading,
    trial,
    
    // Methods
    checkFeatureAccess,
    checkUsageLimit,
    isFeatureEnabled,
    getUsageLimit,
    showUpgradePrompt,
    isInTrial,
    getTrialDaysRemaining,
    hasActiveSubscription,
    getPlanType,
    getPlanName,
    fetchSubscription,
  };
}