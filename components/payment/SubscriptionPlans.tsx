'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Star } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface SubscriptionPlan {
  _id: string;
  planId: string;
  name: string;
  description: string;
  planType: 'free' | 'basic' | 'premium' | 'enterprise' | 'custom';
  monthlyPrice: number;
  quarterlyPrice?: number;
  yearlyPrice?: number;
  currency: string;
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
  limits: {
    storageGB?: number;
    apiCallsPerMonth?: number;
    teamMembers?: number;
    [key: string]: any;
  };
  isActive: boolean;
  isPopular?: boolean;
}

type BillingCycle = 'monthly' | 'quarterly' | 'yearly';

export default function SubscriptionPlans() {
  const { data: session } = useSession();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/payments/plans');
      const data = await response.json();
      
      if (data.plans) {
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!session?.user?.id) {
      toast.error('Please sign in to subscribe');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/payments/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          billingCycle,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Subscription created successfully!');
        // Redirect to payment page or handle success
        if (data.metadata?.stripePaymentIntentId) {
          // Handle Stripe payment
          window.location.href = data.metadata.authorizationUrl || '/dashboard';
        } else if (data.metadata?.paystackAuthorizationUrl) {
          // Handle Paystack payment
          window.location.href = data.metadata.paystackAuthorizationUrl;
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        toast.error(data.error || 'Failed to create subscription');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Failed to create subscription');
    } finally {
      setProcessing(false);
    }
  };

  const getPrice = (plan: SubscriptionPlan) => {
    switch (billingCycle) {
      case 'monthly':
        return plan.monthlyPrice;
      case 'quarterly':
        return plan.quarterlyPrice || plan.monthlyPrice * 3;
      case 'yearly':
        return plan.yearlyPrice || plan.monthlyPrice * 12;
      default:
        return plan.monthlyPrice;
    }
  };

  const getDiscount = (plan: SubscriptionPlan) => {
    if (billingCycle === 'quarterly' && plan.quarterlyPrice) {
      return ((plan.monthlyPrice * 3 - plan.quarterlyPrice) / (plan.monthlyPrice * 3)) * 100;
    }
    if (billingCycle === 'yearly' && plan.yearlyPrice) {
      return ((plan.monthlyPrice * 12 - plan.yearlyPrice) / (plan.monthlyPrice * 12)) * 100;
    }
    return 0;
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free';
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    
    return formatter.format(price);
  };

  const getFeatureValue = (feature: any) => {
    if (feature === -1) return 'Unlimited';
    if (typeof feature === 'boolean') return feature ? 'Yes' : 'No';
    return feature;
  };

  const renderFeature = (key: string, value: any) => {
    if (typeof value === 'boolean') {
      return (
        <div key={key} className="flex items-center gap-2">
          {value ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <X className="h-4 w-4 text-gray-400" />
          )}
          <span className="text-sm capitalize">
            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
          </span>
        </div>
      );
    }

    return (
      <div key={key} className="flex items-center justify-between">
        <span className="text-sm capitalize">
          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
        </span>
        <span className="text-sm font-medium">{getFeatureValue(value)}</span>
      </div>
    );
  };

  const groupFeatures = (features: Record<string, any>) => {
    const groups = {
      core: ['maxApplications', 'maxDocuments', 'maxRecommendations', 'maxScholarships', 'maxPrograms', 'maxSchools'],
      document: ['documentLibrary', 'documentTemplates', 'documentSharing', 'documentFeedback', 'documentRating', 'documentCloning'],
      ai: ['aiFeatures', 'aiContentRefinement', 'aiReview', 'aiRecommendations'],
      advanced: ['prioritySupport', 'customBranding', 'advancedAnalytics', 'apiAccess', 'bulkOperations', 'exportFeatures'],
      communication: ['messaging', 'emailNotifications', 'telegramBot'],
      content: ['contentManagement', 'applicationTemplates', 'requirementsTemplates'],
      task: ['taskManagement', 'progressTracking'],
      assessment: ['careerQuiz', 'aiAnalysis', 'personalizedInsights'],
    };

    const grouped: Record<string, Record<string, any>> = {};
    
    Object.entries(features).forEach(([key, value]) => {
      for (const [groupName, groupKeys] of Object.entries(groups)) {
        if (groupKeys.includes(key)) {
          if (!grouped[groupName]) grouped[groupName] = {};
          grouped[groupName][key] = value;
          break;
        }
      }
    });

    return grouped;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-gray-600 mb-6">
          Select the perfect plan for your educational journey
        </p>
        
        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Button
            variant={billingCycle === 'monthly' ? 'default' : 'outline'}
            onClick={() => setBillingCycle('monthly')}
            size="sm"
          >
            Monthly
          </Button>
          <Button
            variant={billingCycle === 'quarterly' ? 'default' : 'outline'}
            onClick={() => setBillingCycle('quarterly')}
            size="sm"
          >
            Quarterly
            <Badge variant="secondary" className="ml-2">Save 10%</Badge>
          </Button>
          <Button
            variant={billingCycle === 'yearly' ? 'default' : 'outline'}
            onClick={() => setBillingCycle('yearly')}
            size="sm"
          >
            Yearly
            <Badge variant="secondary" className="ml-2">Save 17%</Badge>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const price = getPrice(plan);
          const discount = getDiscount(plan);
          
          return (
            <Card 
              key={plan.planId} 
              className={`relative ${plan.isPopular ? 'border-primary shadow-lg' : ''}`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">
                      {formatPrice(price, plan.currency)}
                    </span>
                    <span className="text-gray-500">
                      /{billingCycle === 'monthly' ? 'month' : billingCycle === 'quarterly' ? 'quarter' : 'year'}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(
                          billingCycle === 'quarterly' 
                            ? plan.monthlyPrice * 3 
                            : plan.monthlyPrice * 12, 
                          plan.currency
                        )}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        Save {discount.toFixed(0)}%
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="space-y-4 mb-6">
                  {Object.entries(groupFeatures(plan.features)).map(([groupName, groupFeatures]) => (
                    <div key={groupName} className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 capitalize">
                        {groupName === 'core' ? 'Core Features' :
                         groupName === 'document' ? 'Document Management' :
                         groupName === 'ai' ? 'AI Features' :
                         groupName === 'advanced' ? 'Advanced Features' :
                         groupName === 'communication' ? 'Communication' :
                         groupName === 'content' ? 'Content Management' :
                         groupName === 'task' ? 'Task Management' :
                         groupName === 'assessment' ? 'Assessment & Quiz' : groupName}
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(groupFeatures).map(([key, value]) => 
                          renderFeature(key, value)
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full"
                  variant={plan.isPopular ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(plan.planId)}
                  disabled={processing || plan.planType === 'free'}
                >
                  {plan.planType === 'free' ? 'Current Plan' : 'Subscribe'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}