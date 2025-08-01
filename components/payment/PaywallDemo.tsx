'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Brain, 
  FileText, 
  MessageSquare, 
  Bot, 
  BarChart3, 
  Settings,
  Lock,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { usePaywall } from '@/hooks/usePaywall';
import { toast } from 'sonner';

interface Feature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  requiredPlan: 'free' | 'basic' | 'premium' | 'enterprise';
  usageType?: string;
}

const features: Feature[] = [
  {
    id: 'aiContentRefinement',
    name: 'AI Content Refinement',
    description: 'Improve your documents with AI-powered editing',
    icon: <Brain className="h-5 w-5" />,
    requiredPlan: 'basic'
  },
  {
    id: 'aiReview',
    name: 'AI Review',
    description: 'Get detailed AI analysis of your documents',
    icon: <Bot className="h-5 w-5" />,
    requiredPlan: 'premium'
  },
  {
    id: 'documentTemplates',
    name: 'Document Templates',
    description: 'Access to professional document templates',
    icon: <FileText className="h-5 w-5" />,
    requiredPlan: 'basic'
  },
  {
    id: 'messaging',
    name: 'Messaging System',
    description: 'Communicate with other users on the platform',
    icon: <MessageSquare className="h-5 w-5" />,
    requiredPlan: 'basic'
  },
  {
    id: 'telegramBot',
    name: 'Telegram Bot',
    description: 'Get notifications and updates via Telegram',
    icon: <Bot className="h-5 w-5" />,
    requiredPlan: 'premium'
  },
  {
    id: 'advancedAnalytics',
    name: 'Advanced Analytics',
    description: 'Detailed insights and performance metrics',
    icon: <BarChart3 className="h-5 w-5" />,
    requiredPlan: 'premium'
  },
  {
    id: 'apiAccess',
    name: 'API Access',
    description: 'Programmatic access to platform features',
    icon: <Settings className="h-5 w-5" />,
    requiredPlan: 'enterprise'
  },
  {
    id: 'documents',
    name: 'Document Creation',
    description: 'Create and manage documents',
    icon: <FileText className="h-5 w-5" />,
    requiredPlan: 'free',
    usageType: 'documents'
  }
];

export default function PaywallDemo() {
  const {
    subscription,
    loading,
    trial,
    isFeatureEnabled,
    getUsageLimit,
    showUpgradePrompt,
    isInTrial,
    getTrialDaysRemaining,
    hasActiveSubscription,
    getPlanType,
    getPlanName
  } = usePaywall();

  const [testingFeature, setTestingFeature] = useState<string | null>(null);

  const handleFeatureTest = async (feature: Feature) => {
    setTestingFeature(feature.id);
    
    try {
      if (feature.usageType) {
        // Test usage limit
        const response = await fetch('/api/payments/check-usage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usageType: feature.usageType }),
        });
        
        const result = await response.json();
        
        if (result.allowed) {
          toast.success(`${feature.name} is available!`);
        } else {
          showUpgradePrompt(undefined, feature.usageType);
        }
      } else {
        // Test feature access
        const response = await fetch('/api/payments/check-feature', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feature: feature.id }),
        });
        
        const result = await response.json();
        
        if (result.allowed) {
          toast.success(`${feature.name} is available!`);
        } else {
          showUpgradePrompt(feature.name);
        }
      }
    } catch (error) {
      toast.error('Error testing feature');
    } finally {
      setTestingFeature(null);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'enterprise': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'free': return <CheckCircle className="h-4 w-4" />;
      case 'basic': return <CheckCircle className="h-4 w-4" />;
      case 'premium': return <CheckCircle className="h-4 w-4" />;
      case 'enterprise': return <CheckCircle className="h-4 w-4" />;
      default: return <XCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Subscription Status
          </CardTitle>
          <CardDescription>
            Your current plan and usage information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-600">Current Plan</div>
              <div className="flex items-center gap-2">
                <Badge className={getPlanColor(getPlanType())}>
                  {getPlanIcon(getPlanType())}
                  {getPlanName()}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-600">Status</div>
              <div className="flex items-center gap-2">
                {hasActiveSubscription() ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    Active
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800">
                    <XCircle className="h-4 w-4" />
                    No Subscription
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-600">Trial Status</div>
              <div className="flex items-center gap-2">
                {isInTrial() ? (
                  <Badge className="bg-blue-100 text-blue-800">
                    <Clock className="h-4 w-4" />
                    {getTrialDaysRemaining()} days left
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800">
                    <XCircle className="h-4 w-4" />
                    No Trial
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Usage Progress */}
          {subscription && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Usage Limits</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['documents', 'applications', 'recommendations'].map((usageType) => {
                  const limit = getUsageLimit(usageType);
                  const current = 0; // This would come from actual usage data
                  const percentage = limit > 0 ? (current / limit) * 100 : 0;
                  
                  return (
                    <div key={usageType} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize">{usageType}</span>
                        <span>{current} / {limit === -1 ? '∞' : limit}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Testing</CardTitle>
          <CardDescription>
            Test which features are available with your current plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => {
              const isEnabled = isFeatureEnabled(feature.id);
              const userPlan = getPlanType();
              const planHierarchy = { free: 0, basic: 1, premium: 2, enterprise: 3 };
              const userPlanLevel = planHierarchy[userPlan as keyof typeof planHierarchy] || 0;
              const requiredLevel = planHierarchy[feature.requiredPlan];
              const hasAccess = userPlanLevel >= requiredLevel;

              return (
                <Card key={feature.id} className={`${hasAccess ? 'border-green-200' : 'border-gray-200'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      {feature.icon}
                      <CardTitle className="text-lg">{feature.name}</CardTitle>
                    </div>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Required Plan</span>
                      <Badge className={getPlanColor(feature.requiredPlan)}>
                        {feature.requiredPlan.charAt(0).toUpperCase() + feature.requiredPlan.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Access</span>
                      {hasAccess ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-4 w-4" />
                          Available
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          <Lock className="h-4 w-4" />
                          Restricted
                        </Badge>
                      )}
                    </div>

                    <Button
                      onClick={() => handleFeatureTest(feature)}
                      disabled={testingFeature === feature.id}
                      variant={hasAccess ? 'default' : 'outline'}
                      className="w-full"
                    >
                      {testingFeature === feature.id ? 'Testing...' : 'Test Feature'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Trial Information */}
      {isInTrial() && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Clock className="h-5 w-5" />
              Trial Period Active
            </CardTitle>
            <CardDescription className="text-blue-700">
              You're currently in a trial period. Upgrade to continue using premium features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-blue-900">
                  {getTrialDaysRemaining()} days remaining in trial
                </div>
                <div className="text-sm text-blue-700">
                  Trial ends on {trial?.endDate.toLocaleDateString()}
                </div>
              </div>
              <Button onClick={() => window.location.href = '/pricing'}>
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}