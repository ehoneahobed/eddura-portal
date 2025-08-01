import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { Subscription, SubscriptionPlan, PaymentTransaction } from '@/models/Subscription';
import { PaymentGatewayFactory } from './gateway-factory';
import {
  PaymentServiceInterface,
  PaymentGatewayInterface,
  PaymentGatewayConfig,
  CustomerInfo,
  PaymentMethodInfo,
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  ProcessPaymentRequest,
  ProcessPaymentResponse,
  CancelSubscriptionRequest,
  CancelSubscriptionResponse,
  UpdateSubscriptionRequest,
  UpdateSubscriptionResponse,
  WebhookEvent,
  PaymentGateway,
  PaymentStatus,
  PaymentMethod,
  Currency,
  PaymentError,
  PaymentGatewayError,
  PaymentValidationError
} from './types';

export class PaymentService implements PaymentServiceInterface {
  private gatewayFactory: PaymentGatewayFactory;
  private gateways: Map<PaymentGateway, PaymentGatewayInterface> = new Map();

  constructor() {
    this.gatewayFactory = new PaymentGatewayFactory();
    this.initializeGateways();
  }

  private async initializeGateways(): Promise<void> {
    const supportedGateways = this.gatewayFactory.getSupportedGateways();
    
    for (const gateway of supportedGateways) {
      const gatewayInstance = this.gatewayFactory.createGateway(gateway);
      const config = this.getGatewayConfig(gateway);
      
      if (config) {
        await gatewayInstance.initialize(config);
        this.gateways.set(gateway, gatewayInstance);
      }
    }
  }

  private getGatewayConfig(gateway: PaymentGateway): PaymentGatewayConfig | null {
    const env = process.env.NODE_ENV === 'production' ? 'live' : 'test';
    
    switch (gateway) {
      case 'stripe':
        return {
          gateway: 'stripe',
          apiKey: process.env.STRIPE_SECRET_KEY || '',
          webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
          environment: env,
          supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
          supportedPaymentMethods: ['card', 'bank_transfer'],
        };
      case 'paystack':
        return {
          gateway: 'paystack',
          apiKey: process.env.PAYSTACK_SECRET_KEY || '',
          webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET || '',
          environment: env,
          supportedCurrencies: ['NGN', 'USD', 'GHS', 'ZAR', 'KES'],
          supportedPaymentMethods: ['card', 'bank_transfer', 'mobile_money'],
        };
      default:
        return null;
    }
  }

  async createSubscription(userId: string, planId: string, paymentMethod?: PaymentMethodInfo): Promise<CreateSubscriptionResponse> {
    try {
      await connectDB();

      // Get user information
      const user = await User.findById(userId);
      if (!user) {
        throw new PaymentValidationError('User not found');
      }

      // Get plan information
      const plan = await SubscriptionPlan.findOne({ planId, isActive: true });
      if (!plan) {
        throw new PaymentValidationError('Plan not found or inactive');
      }

      // Check if user already has an active subscription
      const existingSubscription = await Subscription.findOne({
        userId,
        isActive: true,
        status: { $in: ['active', 'trialing'] }
      });

      if (existingSubscription) {
        throw new PaymentValidationError('User already has an active subscription');
      }

      // Determine the best payment gateway
      const gateway = this.gatewayFactory.getBestGateway(plan.currency, paymentMethod?.type || 'card');
      const gatewayInstance = this.gateways.get(gateway);

      if (!gatewayInstance) {
        throw new PaymentConfigurationError(`Gateway ${gateway} not configured`, gateway);
      }

      // Prepare customer information
      const customerInfo: CustomerInfo = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phoneNumber,
        address: {
          country: user.country || 'US',
          city: user.city,
        },
      };

      // Create subscription request
      const request: CreateSubscriptionRequest = {
        customerInfo,
        planInfo: {
          planId: plan.planId,
          name: plan.name,
          description: plan.description,
          amount: plan.monthlyPrice,
          currency: plan.currency as Currency,
          billingCycle: 'monthly',
          features: plan.features,
          metadata: plan.metadata,
        },
        paymentMethod,
        trialDays: 7, // 7-day free trial
        metadata: {
          userId,
          planId,
        },
      };

      // Create subscription through gateway
      const response = await gatewayInstance.createSubscription(request);

      if (response.success) {
        // Save subscription to database
        const subscription = new Subscription({
          userId,
          planId: plan.planId,
          planName: plan.name,
          planType: plan.planType,
          status: response.status,
          isActive: true,
          billingCycle: 'monthly',
          amount: response.amount,
          currency: response.currency,
          nextBillingDate: response.nextBillingDate,
          currentPeriodStart: response.currentPeriodStart,
          currentPeriodEnd: response.currentPeriodEnd,
          paymentGateway: gateway,
          gatewaySubscriptionId: response.gatewaySubscriptionId,
          gatewayCustomerId: response.gatewayCustomerId,
          trialStart: new Date(),
          trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          isTrialActive: true,
          metadata: response.metadata,
        });

        await subscription.save();
      }

      return response;
    } catch (error) {
      if (error instanceof PaymentError) {
        throw error;
      }
      throw new PaymentGatewayError(
        `Failed to create subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'unknown',
        { userId, planId, error }
      );
    }
  }

  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<CancelSubscriptionResponse> {
    try {
      await connectDB();

      const subscription = await Subscription.findById(subscriptionId);
      if (!subscription) {
        throw new PaymentValidationError('Subscription not found');
      }

      const gatewayInstance = this.gateways.get(subscription.paymentGateway);
      if (!gatewayInstance) {
        throw new PaymentConfigurationError(`Gateway ${subscription.paymentGateway} not configured`, subscription.paymentGateway);
      }

      const request: CancelSubscriptionRequest = {
        subscriptionId: subscription.gatewaySubscriptionId || subscriptionId,
        cancelAtPeriodEnd,
        reason: 'User requested cancellation',
      };

      const response = await gatewayInstance.cancelSubscription(request);

      if (response.success) {
        // Update subscription in database
        subscription.status = cancelAtPeriodEnd ? 'active' : 'canceled';
        subscription.canceledAt = response.canceledAt;
        subscription.willCancelAtPeriodEnd = response.willCancelAtPeriodEnd;
        
        if (!cancelAtPeriodEnd) {
          subscription.isActive = false;
        }

        await subscription.save();
      }

      return response;
    } catch (error) {
      if (error instanceof PaymentError) {
        throw error;
      }
      throw new PaymentGatewayError(
        `Failed to cancel subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'unknown',
        { subscriptionId, error }
      );
    }
  }

  async updateSubscription(subscriptionId: string, updates: Partial<UpdateSubscriptionRequest>): Promise<UpdateSubscriptionResponse> {
    try {
      await connectDB();

      const subscription = await Subscription.findById(subscriptionId);
      if (!subscription) {
        throw new PaymentValidationError('Subscription not found');
      }

      const gatewayInstance = this.gateways.get(subscription.paymentGateway);
      if (!gatewayInstance) {
        throw new PaymentConfigurationError(`Gateway ${subscription.paymentGateway} not configured`, subscription.paymentGateway);
      }

      const request: UpdateSubscriptionRequest = {
        subscriptionId: subscription.gatewaySubscriptionId || subscriptionId,
        ...updates,
      };

      const response = await gatewayInstance.updateSubscription(request);

      if (response.success) {
        // Update subscription in database
        if (updates.amount) {
          subscription.amount = updates.amount;
        }
        if (updates.billingCycle) {
          subscription.billingCycle = updates.billingCycle;
        }
        if (updates.metadata) {
          subscription.metadata = { ...subscription.metadata, ...updates.metadata };
        }

        await subscription.save();
      }

      return response;
    } catch (error) {
      if (error instanceof PaymentError) {
        throw error;
      }
      throw new PaymentGatewayError(
        `Failed to update subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'unknown',
        { subscriptionId, error }
      );
    }
  }

  async processPayment(userId: string, amount: number, description: string, paymentMethod?: PaymentMethodInfo): Promise<ProcessPaymentResponse> {
    try {
      await connectDB();

      const user = await User.findById(userId);
      if (!user) {
        throw new PaymentValidationError('User not found');
      }

      // Determine the best payment gateway
      const currency = 'USD' as Currency; // Default currency
      const gateway = this.gatewayFactory.getBestGateway(currency, paymentMethod?.type || 'card');
      const gatewayInstance = this.gateways.get(gateway);

      if (!gatewayInstance) {
        throw new PaymentConfigurationError(`Gateway ${gateway} not configured`, gateway);
      }

      const customerInfo: CustomerInfo = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phoneNumber,
        address: {
          country: user.country || 'US',
          city: user.city,
        },
      };

      const request: ProcessPaymentRequest = {
        customerInfo,
        amount,
        currency,
        description,
        paymentMethod,
        metadata: {
          userId,
          description,
        },
      };

      const response = await gatewayInstance.processPayment(request);

      if (response.success) {
        // Save transaction to database
        const transaction = new PaymentTransaction({
          userId,
          transactionId: response.transactionId,
          amount: response.amount,
          currency: response.currency,
          status: response.status,
          paymentGateway: gateway,
          gatewayTransactionId: response.gatewayTransactionId,
          gatewayResponse: response.metadata,
          paymentMethod: paymentMethod?.type || 'card',
          paymentMethodDetails: paymentMethod,
          description,
          metadata: response.metadata,
        });

        await transaction.save();
      }

      return response;
    } catch (error) {
      if (error instanceof PaymentError) {
        throw error;
      }
      throw new PaymentGatewayError(
        `Failed to process payment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'unknown',
        { userId, amount, error }
      );
    }
  }

  async handleWebhook(gateway: PaymentGateway, payload: string, signature: string): Promise<void> {
    try {
      const gatewayInstance = this.gateways.get(gateway);
      if (!gatewayInstance) {
        throw new PaymentConfigurationError(`Gateway ${gateway} not configured`, gateway);
      }

      const event = await gatewayInstance.verifyWebhook(payload, signature);
      await this.processWebhookEvent(event);
    } catch (error) {
      console.error('Webhook processing error:', error);
      throw error;
    }
  }

  private async processWebhookEvent(event: WebhookEvent): Promise<void> {
    try {
      await connectDB();

      switch (event.type) {
        case 'invoice.payment_succeeded':
        case 'charge.succeeded':
        case 'subscription.payment_successful':
          await this.handlePaymentSuccess(event);
          break;
        case 'invoice.payment_failed':
        case 'charge.failed':
        case 'subscription.payment_failed':
          await this.handlePaymentFailure(event);
          break;
        case 'customer.subscription.deleted':
        case 'subscription.cancelled':
          await this.handleSubscriptionCancellation(event);
          break;
        default:
          console.log(`Unhandled webhook event: ${event.type}`);
      }
    } catch (error) {
      console.error('Error processing webhook event:', error);
      throw error;
    }
  }

  private async handlePaymentSuccess(event: WebhookEvent): Promise<void> {
    // Update subscription status and create transaction record
    const subscription = await Subscription.findOne({
      gatewaySubscriptionId: event.data.id || event.data.subscription_id,
    });

    if (subscription) {
      subscription.status = 'active';
      subscription.isActive = true;
      await subscription.save();
    }

    // Create transaction record
    const transaction = new PaymentTransaction({
      userId: event.data.customer_id || event.data.user_id,
      transactionId: event.data.id || `webhook_${Date.now()}`,
      amount: event.data.amount / 100, // Convert from cents
      currency: event.data.currency?.toUpperCase() || 'USD',
      status: 'completed',
      paymentGateway: event.gateway,
      gatewayTransactionId: event.data.id,
      gatewayResponse: event.data,
      paymentMethod: 'card',
      description: `Payment for subscription`,
      metadata: event.metadata,
    });

    await transaction.save();
  }

  private async handlePaymentFailure(event: WebhookEvent): Promise<void> {
    const subscription = await Subscription.findOne({
      gatewaySubscriptionId: event.data.id || event.data.subscription_id,
    });

    if (subscription) {
      subscription.status = 'past_due';
      await subscription.save();
    }
  }

  private async handleSubscriptionCancellation(event: WebhookEvent): Promise<void> {
    const subscription = await Subscription.findOne({
      gatewaySubscriptionId: event.data.id || event.data.subscription_id,
    });

    if (subscription) {
      subscription.status = 'canceled';
      subscription.isActive = false;
      subscription.canceledAt = new Date();
      await subscription.save();
    }
  }

  async getActiveSubscription(userId: string): Promise<any> {
    await connectDB();
    return Subscription.findOne({
      userId,
      isActive: true,
      status: { $in: ['active', 'trialing'] }
    }).populate('userId', 'email firstName lastName');
  }

  async getPaymentHistory(userId: string): Promise<any[]> {
    await connectDB();
    return PaymentTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);
  }

  async getAvailablePlans(): Promise<any[]> {
    await connectDB();
    return SubscriptionPlan.find({ isActive: true })
      .sort({ monthlyPrice: 1 });
  }
}