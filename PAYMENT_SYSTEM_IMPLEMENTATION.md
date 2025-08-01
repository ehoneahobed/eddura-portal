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
- **Features**: 
  - Core: 3 applications, 5 documents, 2 recommendations, 10 scholarships
  - Document Management: Basic library access
  - AI: Basic AI features
  - Communication: Email notifications
  - Assessment: Career quiz
- **Limits**: 1GB storage, 100 API calls/month, 10MB document size

### Basic Plan
- **Price**: $9.99/month (USD) / ₦5,000/month (NGN) / ₵120/month (GHS)
- **Features**:
  - Core: 10 applications, 20 documents, 5 recommendations, 50 scholarships
  - Document Management: Full library, templates, sharing, feedback, rating, cloning
  - AI: Content refinement, AI recommendations
  - Communication: Messaging, email notifications
  - Content: Application templates, requirements templates
  - Task Management: Progress tracking
  - Assessment: Career quiz, AI analysis, personalized insights
- **Limits**: 5GB storage, 500 API calls/month, 25MB document size

### Premium Plan
- **Price**: $19.99/month (USD) / ₦10,000/month (NGN) / ₵240/month (GHS)
- **Features**:
  - Core: 50 applications, 100 documents, 15 recommendations, 200 scholarships
  - Document Management: Full library with all features
  - AI: All AI features including AI review
  - Communication: Messaging, email, Telegram bot
  - Content: Full content management
  - Task Management: Complete task management
  - Assessment: Full assessment suite
  - Support: Priority support, advanced analytics
- **Limits**: 20GB storage, 2000 API calls/month, 3 team members, 50MB document size

### Enterprise Plan
- **Price**: $49.99/month (USD)
- **Features**:
  - Core: Unlimited applications, documents, recommendations, scholarships
  - Document Management: Unlimited with all features
  - AI: All AI features unlimited
  - Communication: All communication channels
  - Content: Full content management
  - Task Management: Complete task management
  - Assessment: Full assessment suite
  - Support: Priority support, advanced analytics, API access, custom branding
- **Limits**: 100GB storage, 10000 API calls/month, 10 team members, 100MB document size

## Environment Variables

### Payment System Control

#### Enable/Disable Payments
```env
# Enable or disable the entire payment system
NEXT_PUBLIC_PAYMENTS_ENABLED=true

# Enable/disable specific features
ENABLE_TRIALS=true
ENABLE_PAYWALL=true
NEXT_PUBLIC_ENABLE_TRIALS=true
NEXT_PUBLIC_ENABLE_PAYWALL=true

# Trial configuration
TRIAL_DURATION_DAYS=7
NEXT_PUBLIC_TRIAL_DURATION_DAYS=7
```

### Required Variables (when payments enabled)

Add the following environment variables to your `.env.local` file:

```env
# Payment System Control
NEXT_PUBLIC_PAYMENTS_ENABLED=true
ENABLE_TRIALS=true
ENABLE_PAYWALL=true
TRIAL_DURATION_DAYS=7

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_PAYSTACK_PUBLISHABLE_KEY=pk_test_...
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

### Subscription Card Component

```tsx
import SubscriptionCard from '@/components/payment/SubscriptionCard';

export default function ProfilePage() {
  return <SubscriptionCard />;
}
```

### Profile Navigation with Subscription

```tsx
import ProfileNavigation from '@/components/navigation/ProfileNavigation';

export default function ProfileLayout() {
  return (
    <div className="flex">
      <aside className="w-64 p-4">
        <ProfileNavigation />
      </aside>
      <main className="flex-1">
        {/* Your profile content */}
      </main>
    </div>
  );
}
```

## Paywall System

### Overview
The paywall system provides comprehensive access control for features and usage limits across the platform. It supports:

- **Feature-based access control**: Restrict specific features to certain subscription plans
- **Usage limit enforcement**: Track and limit usage of resources like documents, applications, etc.
- **Free trial support**: Allow users to try premium features during trial periods
- **Graceful degradation**: Show appropriate upgrade prompts when limits are reached

### Key Components

#### 1. Paywall Middleware (`lib/payment/paywall-middleware.ts`)
- `enforcePaywall()`: Main middleware function for API routes
- `checkFeatureAccess()`: Check if user has access to specific features
- `checkUsageLimit()`: Check if user is within usage limits
- `isUserInTrial()`: Check if user is in trial period
- `getTrialDaysRemaining()`: Get remaining trial days

#### 2. Higher-Order Functions (`lib/payment/with-paywall.ts`)
- `withPaywall()`: Wrap API handlers with paywall checks
- `withPaywallGET/POST/PUT/DELETE`: HTTP method-specific wrappers
- `PaywallConfigs`: Predefined configurations for common use cases

#### 3. Client-Side Hook (`hooks/usePaywall.ts`)
- `usePaywall()`: React hook for client-side paywall checking
- Feature access checking
- Usage limit tracking
- Trial status management
- Upgrade prompts

### Usage Examples

#### API Route Protection
```typescript
import { withPaywallPOST, PaywallConfigs } from '@/lib/payment/with-paywall';

async function handleAIRequest(request: NextRequest) {
  // Your API logic here
}

// Apply paywall with AI feature configuration
export const POST = withPaywallPOST(handleAIRequest, PaywallConfigs.AI_CONTENT_REFINEMENT);
```

#### Client-Side Feature Checking
```typescript
import { usePaywall } from '@/hooks/usePaywall';

function MyComponent() {
  const { isFeatureEnabled, showUpgradePrompt } = usePaywall();
  
  const handlePremiumFeature = () => {
    if (isFeatureEnabled('aiContentRefinement')) {
      // Execute feature
    } else {
      showUpgradePrompt('AI Content Refinement');
    }
  };
}
```

### Trial System

#### Free Trial Configuration
- **Duration**: 7 days for new users
- **Features**: Access to all premium features during trial
- **Automatic**: Trial starts when user registers
- **Graceful**: Seamless transition to paid plans

#### Trial Status Tracking
```typescript
const { isInTrial, getTrialDaysRemaining } = usePaywall();

if (isInTrial()) {
  console.log(`${getTrialDaysRemaining()} days remaining in trial`);
}
```

### Usage Limits

#### Supported Limit Types
- **Applications**: Number of applications user can create
- **Documents**: Number of documents user can store
- **Recommendations**: Number of recommendation letters
- **Scholarships**: Number of scholarships user can save
- **Programs**: Number of programs user can track
- **Schools**: Number of schools user can follow

#### Limit Enforcement
```typescript
// Check usage before creating resource
const result = await checkUsageLimit(userId, 'documents');
if (!result.allowed) {
  return createPaywallResponse(result, config);
}
```

### Feature Access Control

#### Plan Hierarchy
- **Free**: Basic features only
- **Basic**: Core features + AI content refinement
- **Premium**: All Basic features + AI review, Telegram bot, analytics
- **Enterprise**: All features + API access, custom branding

#### Feature Checking
```typescript
// Server-side
const result = await checkFeatureAccess(userId, 'aiReview');
if (!result.allowed) {
  // Handle restricted access
}

// Client-side
if (isFeatureEnabled('aiReview')) {
  // Enable feature
}
```

### Error Handling

#### Paywall Error Responses
```json
{
  "error": "AI content refinement requires a paid plan",
  "code": "PAYWALL_RESTRICTED",
  "subscription": { /* subscription details */ },
  "usage": {
    "current": 5,
    "limit": 10,
    "percentage": 50
  },
  "trial": {
    "isActive": true,
    "daysRemaining": 3,
    "endDate": "2024-01-15T00:00:00.000Z"
  }
}
```

### Configuration

#### Paywall Configurations
```typescript
export const PaywallConfigs = {
  AI_CONTENT_REFINEMENT: {
    requiredFeature: 'aiContentRefinement',
    allowTrial: true,
    trialDays: 7,
    errorMessage: 'AI content refinement requires a paid plan'
  },
  
  DOCUMENTS_LIMIT: {
    usageType: 'documents',
    allowTrial: true,
    trialDays: 7,
    errorMessage: 'Document limit reached. Upgrade your plan for more documents.'
  },
  
  PREMIUM_PLAN: {
    requiredPlan: 'premium',
    allowTrial: true,
    trialDays: 7,
    errorMessage: 'This feature requires Premium plan or higher'
  }
};
```

## Environment Variable Control

### Payment System Toggle

The payment system can be completely enabled or disabled using environment variables:

#### Enable Payments
```env
NEXT_PUBLIC_PAYMENTS_ENABLED=true
ENABLE_TRIALS=true
ENABLE_PAYWALL=true
```

#### Disable Payments
```env
NEXT_PUBLIC_PAYMENTS_ENABLED=false
```

When payments are disabled:
- All features are available to all users
- No subscription checks are performed
- No upgrade prompts are shown
- Users see a "Payments Disabled" message in subscription management
- Paywall middleware allows all requests

### Feature-Specific Control

```env
# Enable/disable specific features
ENABLE_TRIALS=true          # Enable free trials
ENABLE_PAYWALL=true         # Enable paywall system
NEXT_PUBLIC_ENABLE_TRIALS=true
NEXT_PUBLIC_ENABLE_PAYWALL=true

# Trial configuration
TRIAL_DURATION_DAYS=7       # Trial duration in days
NEXT_PUBLIC_TRIAL_DURATION_DAYS=7
```

### Usage Examples

#### Development Environment
```env
# Disable payments for development
NEXT_PUBLIC_PAYMENTS_ENABLED=false
```

#### Production Environment
```env
# Enable payments for production
NEXT_PUBLIC_PAYMENTS_ENABLED=true
ENABLE_TRIALS=true
ENABLE_PAYWALL=true
```

#### Testing Environment
```env
# Enable payments but disable paywall for testing
NEXT_PUBLIC_PAYMENTS_ENABLED=true
ENABLE_TRIALS=true
ENABLE_PAYWALL=false
```

## Security Considerations

1. **Webhook Verification**: All webhooks are verified using signatures
2. **Environment Variables**: Sensitive keys are stored in environment variables
3. **Input Validation**: All inputs are validated before processing
4. **Error Handling**: Comprehensive error handling and logging
5. **Rate Limiting**: Consider implementing rate limiting for payment endpoints
6. **Paywall Security**: Server-side validation of all access controls
7. **Trial Abuse Prevention**: Track and prevent trial abuse

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