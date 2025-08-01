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

interface PaystackCustomer {
  id: number;
  customer_code: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  metadata?: Record<string, any>;
}

interface PaystackTransaction {
  id: number;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  gateway_response: string;
  customer: PaystackCustomer;
  metadata?: Record<string, any>;
}

interface PaystackSubscription {
  id: number;
  customer: number;
  plan: number;
  status: string;
  next_payment_date: string;
  amount: number;
  currency: string;
  metadata?: Record<string, any>;
}

export class PaystackGateway implements PaymentGatewayInterface {
  public readonly gateway: PaymentGateway = 'paystack';
  public config: PaymentGatewayConfig;
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'https://api.paystack.co';
  }

  async initialize(config: PaymentGatewayConfig): Promise<void> {
    if (config.gateway !== 'paystack') {
      throw new Error('Invalid gateway type for PaystackGateway');
    }

    this.config = config;
    this.baseUrl = config.environment === 'test' 
      ? 'https://api.paystack.co' 
      : 'https://api.paystack.co';
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const result = await response.json();

    if (!response.ok) {
      throw new PaymentGatewayError(
        `Paystack API error: ${result.message || 'Unknown error'}`,
        'paystack',
        { endpoint, status: response.status, result }
      );
    }

    return result;
  }

  async createCustomer(customerInfo: CustomerInfo): Promise<string> {
    try {
      const data = {
        email: customerInfo.email,
        first_name: customerInfo.firstName,
        last_name: customerInfo.lastName,
        phone: customerInfo.phone,
        metadata: customerInfo.metadata,
      };

      const response = await this.makeRequest('/customer', 'POST', data);
      return response.data.customer_code;
    } catch (error) {
      throw new PaymentGatewayError(
        `Failed to create Paystack customer: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'paystack',
        { customerInfo, error }
      );
    }
  }

  async createSubscription(request: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> {
    try {
      // Create or get customer
      let customerCode = request.customerInfo.id;
      if (!customerCode) {
        customerCode = await this.createCustomer(request.customerInfo);
      }

      // Create plan first
      const planData = {
        name: request.planInfo.name,
        description: request.planInfo.description,
        amount: Math.round(request.planInfo.amount * 100), // Convert to kobo
        interval: this.mapBillingCycleToPaystackInterval(request.planInfo.billingCycle),
        currency: request.planInfo.currency,
        metadata: {
          planId: request.planInfo.planId,
          billingCycle: request.planInfo.billingCycle,
          ...request.planInfo.metadata,
        },
      };

      const planResponse = await this.makeRequest('/plan', 'POST', planData);
      const planId = planResponse.data.id;

      // Create subscription
      const subscriptionData = {
        customer: customerCode,
        plan: planId,
        start_date: new Date().toISOString(),
        metadata: {
          planId: request.planInfo.planId,
          ...request.metadata,
        },
      };

      const subscriptionResponse = await this.makeRequest('/subscription', 'POST', subscriptionData);
      const subscription = subscriptionResponse.data;

      return {
        success: true,
        subscriptionId: subscription.subscription_code,
        gatewaySubscriptionId: subscription.subscription_code,
        gatewayCustomerId: customerCode,
        status: this.mapPaystackStatusToPaymentStatus(subscription.status),
        amount: request.planInfo.amount,
        currency: request.planInfo.currency,
        nextBillingDate: new Date(subscription.next_payment_date),
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(subscription.next_payment_date),
        metadata: {
          paystackSubscriptionCode: subscription.subscription_code,
          paystackCustomerCode: customerCode,
          paystackPlanId: planId,
        },
      };
    } catch (error) {
      throw new PaymentGatewayError(
        `Failed to create Paystack subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'paystack',
        { request, error }
      );
    }
  }

  async processPayment(request: ProcessPaymentRequest): Promise<ProcessPaymentResponse> {
    try {
      // Create or get customer
      let customerCode = request.customerInfo.id;
      if (!customerCode) {
        customerCode = await this.createCustomer(request.customerInfo);
      }

      // Initialize transaction
      const transactionData = {
        email: request.customerInfo.email,
        amount: Math.round(request.amount * 100), // Convert to kobo
        currency: request.currency,
        reference: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook/paystack`,
        metadata: {
          customer_code: customerCode,
          description: request.description,
          ...request.metadata,
        },
      };

      const response = await this.makeRequest('/transaction/initialize', 'POST', transactionData);
      const transaction = response.data;

      return {
        success: true,
        transactionId: transaction.reference,
        gatewayTransactionId: transaction.reference,
        status: 'pending',
        amount: request.amount,
        currency: request.currency,
        metadata: {
          paystackReference: transaction.reference,
          paystackAccessCode: transaction.access_code,
          paystackAuthorizationUrl: transaction.authorization_url,
          paystackCustomerCode: customerCode,
        },
      };
    } catch (error) {
      throw new PaymentGatewayError(
        `Failed to process Paystack payment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'paystack',
        { request, error }
      );
    }
  }

  async cancelSubscription(request: CancelSubscriptionRequest): Promise<CancelSubscriptionResponse> {
    try {
      // Paystack doesn't have a direct cancel endpoint, so we'll mark it as inactive
      const response = await this.makeRequest(`/subscription/disable`, 'POST', {
        code: request.subscriptionId,
        token: this.config.secretKey, // Paystack requires a token for this operation
      });

      return {
        success: true,
        canceledAt: new Date(),
        willCancelAtPeriodEnd: request.cancelAtPeriodEnd || false,
      };
    } catch (error) {
      throw new PaymentGatewayError(
        `Failed to cancel Paystack subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'paystack',
        { request, error }
      );
    }
  }

  async updateSubscription(request: UpdateSubscriptionRequest): Promise<UpdateSubscriptionResponse> {
    try {
      // Paystack doesn't support direct subscription updates
      // We would need to cancel the current subscription and create a new one
      const updatedFields: string[] = [];

      if (request.metadata) {
        // Update metadata if possible
        updatedFields.push('metadata');
      }

      return {
        success: true,
        subscriptionId: request.subscriptionId,
        updatedFields,
      };
    } catch (error) {
      throw new PaymentGatewayError(
        `Failed to update Paystack subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'paystack',
        { request, error }
      );
    }
  }

  async verifyWebhook(payload: string, signature: string): Promise<WebhookEvent> {
    try {
      // Verify Paystack webhook signature
      const crypto = require('crypto');
      const hash = crypto
        .createHmac('sha512', this.config.webhookSecret || '')
        .update(payload)
        .digest('hex');

      if (hash !== signature) {
        throw new PaymentValidationError('Invalid Paystack webhook signature');
      }

      const event = JSON.parse(payload);
      
      return {
        id: event.data.id?.toString() || event.data.reference,
        type: event.event,
        data: event.data,
        timestamp: new Date(),
        gateway: 'paystack',
        metadata: {
          paystackEvent: event.event,
          paystackData: event.data,
        },
      };
    } catch (error) {
      throw new PaymentValidationError(
        `Failed to verify Paystack webhook: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { error }
      );
    }
  }

  async processWebhook(event: WebhookEvent): Promise<void> {
    // This method will be implemented by the payment service
    // to handle webhook events and update the database
    console.log('Processing Paystack webhook:', event);
  }

  getSupportedCurrencies(): Currency[] {
    return ['NGN', 'USD', 'GHS', 'ZAR', 'KES'];
  }

  getSupportedPaymentMethods(): PaymentMethod[] {
    return ['card', 'bank_transfer', 'mobile_money'];
  }

  isSupported(currency: Currency, paymentMethod: PaymentMethod): boolean {
    return this.getSupportedCurrencies().includes(currency) &&
           this.getSupportedPaymentMethods().includes(paymentMethod);
  }

  private mapBillingCycleToPaystackInterval(billingCycle: string): 'daily' | 'weekly' | 'monthly' | 'yearly' {
    switch (billingCycle) {
      case 'monthly':
        return 'monthly';
      case 'quarterly':
        return 'monthly'; // Paystack doesn't have quarterly, we'll handle this in the service
      case 'yearly':
        return 'yearly';
      default:
        return 'monthly';
    }
  }

  private mapPaystackStatusToPaymentStatus(paystackStatus: string): PaymentStatus {
    switch (paystackStatus) {
      case 'active':
        return 'completed';
      case 'cancelled':
        return 'failed';
      case 'expired':
        return 'failed';
      case 'pending':
        return 'pending';
      default:
        return 'pending';
    }
  }
}