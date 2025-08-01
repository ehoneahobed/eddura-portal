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
  CreditCard, 
  Calendar, 
  Settings, 
  Crown,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import { usePaywall } from '@/hooks/usePaywall';
import { getClientPaymentConfig } from '@/lib/payment/payment-config';
import { toast } from 'sonner';

export default function SubscriptionCard() {
  const paymentConfig = getClientPaymentConfig();
  const {
    subscription,
    loading,
    trial,
    getUsageLimit,
    isInTrial,
    getTrialDaysRemaining,
    hasActiveSubscription,
    getPlanType,
    getPlanName
  } = usePaywall();

  const [canceling, setCanceling] = useState(false);

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    setCanceling(true);
    try {
      const response = await fetch(`/api/payments/subscriptions?subscriptionId=${subscription._id}&cancelAtPeriodEnd=true`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Subscription will be canceled at the end of the current period');
        // Refresh subscription data
        window.location.reload();
      } else {
        toast.error('Failed to cancel subscription');
      }
    } catch (error) {
      toast.error('Error canceling subscription');
    } finally {
      setCanceling(false);
    }
  };

  const handleUpgrade = () => {
    window.location.href = '/pricing';
  };

  const handleManageBilling = () => {
    if (subscription?.paymentGateway === 'stripe') {
      // Redirect to Stripe customer portal
      window.open('/api/payments/stripe/portal', '_blank');
    } else {
      // For other gateways, redirect to subscription management
      window.location.href = '/subscription';
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
      case 'premium': return <Crown className="h-4 w-4" />;
      case 'enterprise': return <Crown className="h-4 w-4" />;
      default: return <XCircle className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Assuming amount is in cents
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  // If payments are disabled, show a message
  if (!paymentConfig.enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Management
          </CardTitle>
          <CardDescription>
            Payment features are currently disabled
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mb-4">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-900">Payments Disabled</h3>
              <p className="text-gray-600 mt-1">
                Subscription management is not available in this environment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Status
          </CardTitle>
          <CardDescription>
            Manage your current subscription and billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription ? (
            <div className="space-y-4">
              {/* Plan Information */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPlanColor(getPlanType())}>
                      {getPlanIcon(getPlanType())}
                      {getPlanName()}
                    </Badge>
                    {subscription.status === 'active' && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-4 w-4" />
                        Active
                      </Badge>
                    )}
                    {subscription.status === 'trialing' && (
                      <Badge className="bg-blue-100 text-blue-800">
                        <Clock className="h-4 w-4" />
                        Trial
                      </Badge>
                    )}
                    {subscription.willCancelAtPeriodEnd && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <AlertTriangle className="h-4 w-4" />
                        Canceling
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatCurrency(subscription.amount, subscription.currency)} / {subscription.billingCycle}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Next billing</p>
                  <p className="text-sm font-medium">
                    {formatDate(subscription.nextBillingDate)}
                  </p>
                </div>
              </div>

              {/* Trial Information */}
              {isInTrial() && trial && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Trial Period Active</span>
                  </div>
                  <p className="text-sm text-blue-700 mb-2">
                    {getTrialDaysRemaining()} days remaining in your trial
                  </p>
                  <p className="text-sm text-blue-600">
                    Trial ends on {formatDate(trial.endDate.toISOString())}
                  </p>
                </div>
              )}

              {/* Usage Limits */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Usage This Period</h4>
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

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleManageBilling}
                  variant="outline"
                  className="flex-1"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Billing
                </Button>
                
                {!subscription.willCancelAtPeriodEnd ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Subscription
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                        <AlertDialogDescription>
                          Your subscription will remain active until the end of the current billing period. 
                          You can reactivate your subscription at any time.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleCancelSubscription}
                          disabled={canceling}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {canceling ? 'Canceling...' : 'Cancel Subscription'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <Button
                    onClick={() => window.location.href = '/pricing'}
                    variant="outline"
                    className="flex-1"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Reactivate
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mb-4">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-gray-900">No Active Subscription</h3>
                <p className="text-gray-600 mt-1">
                  {isInTrial() 
                    ? `You're currently in a ${getTrialDaysRemaining()}-day trial`
                    : 'Upgrade to access premium features'
                  }
                </p>
              </div>
              
              <div className="space-y-2">
                <Button onClick={handleUpgrade} className="w-full">
                  <Crown className="h-4 w-4 mr-2" />
                  View Plans
                </Button>
                
                {isInTrial() && (
                  <p className="text-sm text-gray-500">
                    Trial ends on {trial?.endDate.toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => window.location.href = '/pricing'}
              variant="outline"
              className="h-auto p-4 flex-col items-start"
            >
              <Crown className="h-5 w-5 mb-2" />
              <span className="font-medium">View All Plans</span>
              <span className="text-sm text-gray-600">Compare features and pricing</span>
            </Button>
            
            <Button
              onClick={() => window.location.href = '/subscription/usage'}
              variant="outline"
              className="h-auto p-4 flex-col items-start"
            >
              <BarChart3 className="h-5 w-5 mb-2" />
              <span className="font-medium">Usage Analytics</span>
              <span className="text-sm text-gray-600">View detailed usage statistics</span>
            </Button>
            
            <Button
              onClick={() => window.location.href = '/subscription/billing'}
              variant="outline"
              className="h-auto p-4 flex-col items-start"
            >
              <CreditCard className="h-5 w-5 mb-2" />
              <span className="font-medium">Billing History</span>
              <span className="text-sm text-gray-600">View past invoices and payments</span>
            </Button>
            
            <Button
              onClick={() => window.location.href = '/support'}
              variant="outline"
              className="h-auto p-4 flex-col items-start"
            >
              <MessageSquare className="h-5 w-5 mb-2" />
              <span className="font-medium">Get Support</span>
              <span className="text-sm text-gray-600">Contact customer support</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}