'use client';

import React, { useState, useEffect } from 'react';
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
  Download, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

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

interface PaymentTransaction {
  _id: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  paymentGateway: string;
  paymentMethod: string;
  description: string;
  createdAt: string;
}

export default function SubscriptionManagement() {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchSubscriptionData();
    }
  }, [session]);

  const fetchSubscriptionData = async () => {
    try {
      const [subscriptionRes, transactionsRes] = await Promise.all([
        fetch('/api/payments/subscriptions'),
        fetch('/api/payments/transactions')
      ]);

      const subscriptionData = await subscriptionRes.json();
      const transactionsData = await transactionsRes.json();

      if (subscriptionData.subscription) {
        setSubscription(subscriptionData.subscription);
      }
      if (transactionsData.transactions) {
        setTransactions(transactionsData.transactions);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (cancelAtPeriodEnd: boolean = true) => {
    if (!subscription) return;

    setProcessing(true);
    try {
      const response = await fetch(`/api/payments/subscriptions?subscriptionId=${subscription._id}&cancelAtPeriodEnd=${cancelAtPeriodEnd}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Subscription cancelled successfully');
        fetchSubscriptionData(); // Refresh data
      } else {
        toast.error(data.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'trialing':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'past_due':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'canceled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'trialing':
        return 'bg-blue-100 text-blue-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    });
    return formatter.format(amount);
  };

  const getUsagePercentage = () => {
    if (!subscription?.currentUsage || !subscription?.usageLimit) return 0;
    return Math.min((subscription.currentUsage / subscription.usageLimit) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
            <CardDescription>
              You don't have an active subscription. Choose a plan to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/pricing'}>
              View Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{subscription.planName}</CardTitle>
              <CardDescription>
                {subscription.planType.charAt(0).toUpperCase() + subscription.planType.slice(1)} Plan
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(subscription.status)}
              <Badge className={getStatusColor(subscription.status)}>
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Billing Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CreditCard className="h-4 w-4" />
                Billing Amount
              </div>
              <div className="text-lg font-semibold">
                {formatCurrency(subscription.amount, subscription.currency)} / {subscription.billingCycle}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                Next Billing Date
              </div>
              <div className="text-lg font-semibold">
                {formatDate(subscription.nextBillingDate)}
              </div>
            </div>
          </div>

          {/* Trial Information */}
          {subscription.isTrialActive && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-blue-900">Trial Period</span>
              </div>
              <p className="text-sm text-blue-700">
                Your trial ends on {formatDate(subscription.trialEnd || '')}. 
                You won't be charged until the trial period ends.
              </p>
            </div>
          )}

          {/* Cancellation Notice */}
          {subscription.willCancelAtPeriodEnd && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="font-medium text-yellow-900">Subscription Ending</span>
              </div>
              <p className="text-sm text-yellow-700">
                Your subscription will be cancelled at the end of the current billing period 
                ({formatDate(subscription.currentPeriodEnd)}).
              </p>
            </div>
          )}

          {/* Usage Tracking */}
          {subscription.usageLimit && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Usage</span>
                <span>{subscription.currentUsage || 0} / {subscription.usageLimit}</span>
              </div>
              <Progress value={getUsagePercentage()} className="h-2" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => window.location.href = '/pricing'}>
              <Settings className="h-4 w-4 mr-2" />
              Change Plan
            </Button>
            
            {subscription.status === 'active' && !subscription.willCancelAtPeriodEnd && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    Cancel Subscription
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel your subscription? You can choose to:
                      <br />
                      • Cancel at the end of the current period (recommended)
                      <br />
                      • Cancel immediately
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleCancelSubscription(true)}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      Cancel at Period End
                    </AlertDialogAction>
                    <AlertDialogAction
                      onClick={() => handleCancelSubscription(false)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Cancel Immediately
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              Recent payment transactions for your subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-gray-500">
                      {formatDate(transaction.createdAt)} • {transaction.paymentGateway}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </div>
                    <Badge 
                      variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}