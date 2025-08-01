import React from 'react';
import { Metadata } from 'next';
import SubscriptionCard from '@/components/payment/SubscriptionCard';

export const metadata: Metadata = {
  title: 'Subscription Management | Eddura',
  description: 'Manage your subscription, billing, and usage limits',
};

export default function SubscriptionPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your subscription, view usage, and update billing information
          </p>
        </div>
        
        <SubscriptionCard />
      </div>
    </div>
  );
}