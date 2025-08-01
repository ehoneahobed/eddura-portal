import Stripe from 'stripe';
import {
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
  PaymentGatewayError,
  PaymentValidationError
} from '../types';

export class StripeGateway implements PaymentGatewayInterface {
  public readonly gateway: PaymentGateway = 'stripe';
  public config: PaymentGatewayConfig;
  private stripe: Stripe;

  constructor() {
    this.stripe = null as any;
  }

  async initialize(config: PaymentGatewayConfig): Promise<void> {
    if (config.gateway !== 'stripe') {
      throw new Error('Invalid gateway type for StripeGateway');
    }

    this.config = config;
    this.stripe = new Stripe(config.apiKey, {
      apiVersion: '2024-12-18.acacia',
    });
  }

  async createCustomer(customerInfo: CustomerInfo): Promise<string> {
    try {
      const customer = await this.stripe.customers.create({
        email: customerInfo.email,
        name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        phone: customerInfo.phone,
        address: customerInfo.address ? {
          country: customerInfo.address.country,
          state: customerInfo.address.state,
          city: customerInfo.address.city,
          postal_code: customerInfo.address.postalCode,
          line1: customerInfo.address.line1,
          line2: customerInfo.address.line2,
        } : undefined,
        metadata: customerInfo.metadata,
      });

      return customer.id;
    } catch (error) {
      throw new PaymentGatewayError(
        `Failed to create Stripe customer: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'stripe',
        { customerInfo, error }
      );
    }
  }

  async createSubscription(request: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> {
    try {
      // Create or get customer
      let customerId = request.customerInfo.id;
      if (!customerId) {
        customerId = await this.createCustomer(request.customerInfo);
      }

      // Create product and price if they don't exist
      const product = await this.stripe.products.create({
        name: request.planInfo.name,
        description: request.planInfo.description,
        metadata: {
          planId: request.planInfo.planId,
          ...request.planInfo.metadata,
        },
      });

      const price = await this.stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(request.planInfo.amount * 100), // Convert to cents
        currency: request.planInfo.currency.toLowerCase(),
        recurring: {
          interval: this.mapBillingCycleToStripeInterval(request.planInfo.billingCycle),
        },
        metadata: {
          planId: request.planInfo.planId,
          billingCycle: request.planInfo.billingCycle,
        },
      });

      // Create subscription
      const subscriptionData: Stripe.SubscriptionCreateParams = {
        customer: customerId,
        items: [{ price: price.id }],
        metadata: {
          planId: request.planInfo.planId,
          ...request.metadata,
        },
      };

      // Add trial if specified
      if (request.trialDays && request.trialDays > 0) {
        subscriptionData.trial_period_days = request.trialDays;
      }

      const subscription = await this.stripe.subscriptions.create(subscriptionData);

      return {
        success: true,
        subscriptionId: subscription.id,
        gatewaySubscriptionId: subscription.id,
        gatewayCustomerId: customerId,
        status: this.mapStripeStatusToPaymentStatus(subscription.status),
        amount: request.planInfo.amount,
        currency: request.planInfo.currency,
        nextBillingDate: new Date(subscription.current_period_end * 1000),
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        metadata: {
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: customerId,
          stripeProductId: product.id,
          stripePriceId: price.id,
        },
      };
    } catch (error) {
      throw new PaymentGatewayError(
        `Failed to create Stripe subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'stripe',
        { request, error }
      );
    }
  }

  async processPayment(request: ProcessPaymentRequest): Promise<ProcessPaymentResponse> {
    try {
      // Create or get customer
      let customerId = request.customerInfo.id;
      if (!customerId) {
        customerId = await this.createCustomer(request.customerInfo);
      }

      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(request.amount * 100), // Convert to cents
        currency: request.currency.toLowerCase(),
        customer: customerId,
        description: request.description,
        metadata: request.metadata,
      });

      return {
        success: true,
        transactionId: paymentIntent.id,
        gatewayTransactionId: paymentIntent.id,
        status: this.mapStripeStatusToPaymentStatus(paymentIntent.status),
        amount: request.amount,
        currency: request.currency,
        metadata: {
          stripePaymentIntentId: paymentIntent.id,
          stripeCustomerId: customerId,
          clientSecret: paymentIntent.client_secret,
        },
      };
    } catch (error) {
      throw new PaymentGatewayError(
        `Failed to process Stripe payment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'stripe',
        { request, error }
      );
    }
  }

  async cancelSubscription(request: CancelSubscriptionRequest): Promise<CancelSubscriptionResponse> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(request.subscriptionId);
      
      if (request.cancelAtPeriodEnd) {
        // Cancel at period end
        await this.stripe.subscriptions.update(request.subscriptionId, {
          cancel_at_period_end: true,
        });
      } else {
        // Cancel immediately
        await this.stripe.subscriptions.cancel(request.subscriptionId);
      }

      return {
        success: true,
        canceledAt: new Date(),
        willCancelAtPeriodEnd: request.cancelAtPeriodEnd || false,
      };
    } catch (error) {
      throw new PaymentGatewayError(
        `Failed to cancel Stripe subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'stripe',
        { request, error }
      );
    }
  }

  async updateSubscription(request: UpdateSubscriptionRequest): Promise<UpdateSubscriptionResponse> {
    try {
      const updates: Stripe.SubscriptionUpdateParams = {};
      const updatedFields: string[] = [];

      if (request.amount !== undefined) {
        // Create new price for the updated amount
        const subscription = await this.stripe.subscriptions.retrieve(request.subscriptionId);
        const currentPrice = subscription.items.data[0].price;
        
        const newPrice = await this.stripe.prices.create({
          product: currentPrice.product as string,
          unit_amount: Math.round(request.amount * 100),
          currency: currentPrice.currency,
          recurring: currentPrice.recurring,
        });

        updates.items = [{
          id: subscription.items.data[0].id,
          price: newPrice.id,
        }];
        updatedFields.push('amount');
      }

      if (request.metadata) {
        updates.metadata = request.metadata;
        updatedFields.push('metadata');
      }

      if (Object.keys(updates).length > 0) {
        await this.stripe.subscriptions.update(request.subscriptionId, updates);
      }

      return {
        success: true,
        subscriptionId: request.subscriptionId,
        updatedFields,
      };
    } catch (error) {
      throw new PaymentGatewayError(
        `Failed to update Stripe subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'stripe',
        { request, error }
      );
    }
  }

  async verifyWebhook(payload: string, signature: string): Promise<WebhookEvent> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.config.webhookSecret || ''
      );

      return {
        id: event.id,
        type: event.type,
        data: event.data.object,
        timestamp: new Date(event.created * 1000),
        gateway: 'stripe',
        metadata: {
          stripeEventId: event.id,
          stripeEventType: event.type,
        },
      };
    } catch (error) {
      throw new PaymentValidationError(
        `Failed to verify Stripe webhook: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { error }
      );
    }
  }

  async processWebhook(event: WebhookEvent): Promise<void> {
    // This method will be implemented by the payment service
    // to handle webhook events and update the database
    console.log('Processing Stripe webhook:', event);
  }

  getSupportedCurrencies(): Currency[] {
    return ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
  }

  getSupportedPaymentMethods(): PaymentMethod[] {
    return ['card', 'bank_transfer'];
  }

  isSupported(currency: Currency, paymentMethod: PaymentMethod): boolean {
    return this.getSupportedCurrencies().includes(currency) &&
           this.getSupportedPaymentMethods().includes(paymentMethod);
  }

  private mapBillingCycleToStripeInterval(billingCycle: string): 'day' | 'week' | 'month' | 'year' {
    switch (billingCycle) {
      case 'monthly':
        return 'month';
      case 'quarterly':
        return 'month'; // Stripe doesn't have quarterly, we'll handle this in the service
      case 'yearly':
        return 'year';
      default:
        return 'month';
    }
  }

  private mapStripeStatusToPaymentStatus(stripeStatus: string): PaymentStatus {
    switch (stripeStatus) {
      case 'active':
      case 'trialing':
        return 'completed';
      case 'canceled':
        return 'failed';
      case 'past_due':
      case 'unpaid':
        return 'pending';
      case 'incomplete':
      case 'incomplete_expired':
        return 'failed';
      default:
        return 'pending';
    }
  }
}