# Payment System Implementation

## Overview

This document outlines the comprehensive subscription and payment service implementation for the SaaS product. The system is designed to support multiple payment gateways and serve users worldwide, with particular focus on African markets.

## Architecture

### Core Components

1. **Database Models** (`models/Subscription.ts`)
   - `Subscription`: User subscription data
   - `SubscriptionPlan`: Available subscription plans
   - `PaymentTransaction`: Payment transaction records

2. **Payment Gateway Abstraction** (`lib/payment/`)
   - `types.ts`: Type definitions and interfaces
   - `gateway-factory.ts`: Factory for creating payment gateways
   - `payment-service.ts`: Main payment orchestration service

3. **Payment Gateway Implementations**
   - `gateways/stripe.ts`: Stripe payment gateway
   - `gateways/paystack.ts`: Paystack payment gateway (African markets)

4. **API Routes** (`app/api/payments/`)
   - `/subscriptions`: Subscription management
   - `/plans`: Available plans
   - `/transactions`: Payment processing
   - `/webhook/stripe`: Stripe webhooks
   - `/webhook/paystack`: Paystack webhooks

5. **Frontend Components** (`components/payment/`)
   - `SubscriptionPlans.tsx`: Plan selection interface
   - `SubscriptionManagement.tsx`: Subscription management

## Supported Payment Gateways

### 1. Stripe
- **Regions**: Global (US, Europe, Canada, Australia, etc.)
- **Currencies**: USD, EUR, GBP, CAD, AUD
- **Payment Methods**: Credit cards, bank transfers
- **Features**: Subscriptions, one-time payments, webhooks

### 2. Paystack
- **Regions**: Africa (Nigeria, Ghana, South Africa, Kenya)
- **Currencies**: NGN, USD, GHS, ZAR, KES
- **Payment Methods**: Cards, bank transfers, mobile money
- **Features**: Subscriptions, one-time payments, webhooks

### Future Gateways
- Flutterwave (African markets)
- PayPal (Global)
- Razorpay (India)

## Subscription Plans

### Free Plan
- **Price**: $0/month
- **Features**: 3 applications, 5 documents, 2 recommendations
- **Limits**: 1GB storage, 100 API calls/month

### Basic Plan
- **Price**: $9.99/month (USD) / ₦5,000/month (NGN) / ₵120/month (GHS)
- **Features**: 10 applications, 20 documents, 5 recommendations, AI features
- **Limits**: 5GB storage, 500 API calls/month

### Premium Plan
- **Price**: $19.99/month (USD) / ₦10,000/month (NGN) / ₵240/month (GHS)
- **Features**: 50 applications, 100 documents, 15 recommendations, AI features, priority support, analytics
- **Limits**: 20GB storage, 2000 API calls/month, 3 team members

### Enterprise Plan
- **Price**: $49.99/month (USD)
- **Features**: Unlimited applications, documents, recommendations, AI features, priority support, analytics, API access, custom branding
- **Limits**: 100GB storage, 10000 API calls/month, 10 team members

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_WEBHOOK_SECRET=...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install stripe
```

### 2. Seed Subscription Plans

```bash
npm run seed:subscription-plans
```

### 3. Configure Payment Gateways

#### Stripe Setup
1. Create a Stripe account
2. Get your API keys from the Stripe dashboard
3. Set up webhook endpoints in Stripe dashboard:
   - URL: `https://yourdomain.com/api/payments/webhook/stripe`
   - Events: `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.deleted`

#### Paystack Setup
1. Create a Paystack account
2. Get your API keys from the Paystack dashboard
3. Set up webhook endpoints in Paystack dashboard:
   - URL: `https://yourdomain.com/api/payments/webhook/paystack`
   - Events: `charge.success`, `subscription.payment_successful`

### 4. Database Migration

The subscription models will be automatically created when the application starts. No manual migration is required.

## API Endpoints

### Subscriptions

#### GET `/api/payments/subscriptions`
Get current user's active subscription.

#### POST `/api/payments/subscriptions`
Create a new subscription.

**Request Body:**
```json
{
  "planId": "basic",
  "billingCycle": "monthly",
  "paymentMethod": {
    "type": "card",
    "cardType": "visa",
    "last4": "4242"
  }
}
```

#### PUT `/api/payments/subscriptions`
Update subscription.

#### DELETE `/api/payments/subscriptions?subscriptionId=...&cancelAtPeriodEnd=true`
Cancel subscription.

### Plans

#### GET `/api/payments/plans`
Get available subscription plans.

### Transactions

#### GET `/api/payments/transactions`
Get payment history.

#### POST `/api/payments/transactions`
Process a one-time payment.

### Webhooks

#### POST `/api/payments/webhook/stripe`
Handle Stripe webhook events.

#### POST `/api/payments/webhook/paystack`
Handle Paystack webhook events.

## Usage Examples

### Creating a Subscription

```typescript
const response = await fetch('/api/payments/subscriptions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    planId: 'basic',
    billingCycle: 'monthly'
  })
});
```

### Getting User's Subscription

```typescript
const response = await fetch('/api/payments/subscriptions');
const { subscription } = await response.json();
```

### Canceling a Subscription

```typescript
const response = await fetch(`/api/payments/subscriptions?subscriptionId=${subscriptionId}&cancelAtPeriodEnd=true`, {
  method: 'DELETE'
});
```

## Frontend Integration

### Subscription Plans Component

```tsx
import SubscriptionPlans from '@/components/payment/SubscriptionPlans';

export default function PricingPage() {
  return <SubscriptionPlans />;
}
```

### Subscription Management Component

```tsx
import SubscriptionManagement from '@/components/payment/SubscriptionManagement';

export default function AccountPage() {
  return <SubscriptionManagement />;
}
```

## Security Considerations

1. **Webhook Verification**: All webhooks are verified using signatures
2. **Environment Variables**: Sensitive keys are stored in environment variables
3. **Input Validation**: All inputs are validated before processing
4. **Error Handling**: Comprehensive error handling and logging
5. **Rate Limiting**: Consider implementing rate limiting for payment endpoints

## Testing

### Test Cards (Stripe)

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

### Test Cards (Paystack)

- **Success**: 4084 0840 8408 4081
- **Decline**: 4084 0840 8408 4082

## Monitoring and Analytics

### Key Metrics to Track

1. **Subscription Metrics**
   - Monthly Recurring Revenue (MRR)
   - Churn rate
   - Average Revenue Per User (ARPU)
   - Trial conversion rate

2. **Payment Metrics**
   - Payment success rate
   - Failed payment rate
   - Payment method distribution
   - Geographic distribution

3. **Technical Metrics**
   - API response times
   - Webhook delivery success rate
   - Error rates by gateway

## Troubleshooting

### Common Issues

1. **Webhook Not Receiving Events**
   - Check webhook URL configuration
   - Verify webhook secret
   - Check server logs for errors

2. **Payment Processing Failures**
   - Verify API keys are correct
   - Check currency and amount formatting
   - Ensure payment method is supported

3. **Subscription Not Creating**
   - Check user authentication
   - Verify plan exists and is active
   - Check for existing active subscription

### Debug Mode

Enable debug logging by setting:

```env
DEBUG=payment:*
```

## Future Enhancements

1. **Additional Payment Gateways**
   - Flutterwave integration
   - PayPal integration
   - Razorpay integration

2. **Advanced Features**
   - Usage-based billing
   - Prorated billing
   - Coupon and discount codes
   - Affiliate program

3. **Analytics and Reporting**
   - Revenue analytics dashboard
   - Subscription analytics
   - Payment performance metrics

4. **Internationalization**
   - Multi-currency support
   - Localized pricing
   - Regional payment methods

## Support

For issues related to the payment system:

1. Check the application logs
2. Verify environment variables
3. Test with provided test cards
4. Contact the development team

## License

This payment system implementation is part of the main project and follows the same licensing terms.