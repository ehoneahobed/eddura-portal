/**
 * Payment Gateway Types and Interfaces
 * This file defines the core types for the payment gateway abstraction layer
 */

export type PaymentGateway = 'stripe' | 'paystack' | 'flutterwave' | 'paypal' | 'razorpay' | 'custom';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed';

export type PaymentMethod = 'card' | 'bank_transfer' | 'mobile_money' | 'crypto' | 'wallet';

export type BillingCycle = 'monthly' | 'quarterly' | 'yearly' | 'custom';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'NGN' | 'KES' | 'GHS' | 'ZAR' | 'INR' | 'CAD' | 'AUD';

/**
 * Customer information for payment processing
 */
export interface CustomerInfo {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: {
    country: string;
    state?: string;
    city?: string;
    postalCode?: string;
    line1?: string;
    line2?: string;
  };
  metadata?: Record<string, any>;
}

/**
 * Payment method information
 */
export interface PaymentMethodInfo {
  type: PaymentMethod;
  cardType?: string;
  last4?: string;
  bankName?: string;
  accountNumber?: string;
  metadata?: Record<string, any>;
}

/**
 * Subscription plan information
 */
export interface SubscriptionPlanInfo {
  planId: string;
  name: string;
  description: string;
  amount: number;
  currency: Currency;
  billingCycle: BillingCycle;
  trialDays?: number;
  features?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Create subscription request
 */
export interface CreateSubscriptionRequest {
  customerInfo: CustomerInfo;
  planInfo: SubscriptionPlanInfo;
  paymentMethod?: PaymentMethodInfo;
  trialDays?: number;
  metadata?: Record<string, any>;
}

/**
 * Create subscription response
 */
export interface CreateSubscriptionResponse {
  success: boolean;
  subscriptionId?: string;
  gatewaySubscriptionId?: string;
  gatewayCustomerId?: string;
  status: PaymentStatus;
  amount: number;
  currency: Currency;
  nextBillingDate: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Process payment request
 */
export interface ProcessPaymentRequest {
  customerInfo: CustomerInfo;
  amount: number;
  currency: Currency;
  description: string;
  paymentMethod?: PaymentMethodInfo;
  metadata?: Record<string, any>;
}

/**
 * Process payment response
 */
export interface ProcessPaymentResponse {
  success: boolean;
  transactionId: string;
  gatewayTransactionId?: string;
  status: PaymentStatus;
  amount: number;
  currency: Currency;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Webhook event data
 */
export interface WebhookEvent {
  id: string;
  type: string;
  data: Record<string, any>;
  timestamp: Date;
  gateway: PaymentGateway;
  metadata?: Record<string, any>;
}

/**
 * Cancel subscription request
 */
export interface CancelSubscriptionRequest {
  subscriptionId: string;
  cancelAtPeriodEnd?: boolean;
  reason?: string;
}

/**
 * Cancel subscription response
 */
export interface CancelSubscriptionResponse {
  success: boolean;
  canceledAt?: Date;
  willCancelAtPeriodEnd: boolean;
  error?: string;
}

/**
 * Update subscription request
 */
export interface UpdateSubscriptionRequest {
  subscriptionId: string;
  planId?: string;
  amount?: number;
  billingCycle?: BillingCycle;
  metadata?: Record<string, any>;
}

/**
 * Update subscription response
 */
export interface UpdateSubscriptionResponse {
  success: boolean;
  subscriptionId: string;
  updatedFields: string[];
  error?: string;
}

/**
 * Payment gateway configuration
 */
export interface PaymentGatewayConfig {
  gateway: PaymentGateway;
  apiKey: string;
  secretKey?: string;
  webhookSecret?: string;
  environment: 'test' | 'live';
  supportedCurrencies: Currency[];
  supportedPaymentMethods: PaymentMethod[];
  metadata?: Record<string, any>;
}

/**
 * Payment gateway interface that all payment providers must implement
 */
export interface PaymentGatewayInterface {
  // Configuration
  readonly gateway: PaymentGateway;
  readonly config: PaymentGatewayConfig;
  
  // Core methods
  initialize(config: PaymentGatewayConfig): Promise<void>;
  createCustomer(customerInfo: CustomerInfo): Promise<string>;
  createSubscription(request: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse>;
  processPayment(request: ProcessPaymentRequest): Promise<ProcessPaymentResponse>;
  cancelSubscription(request: CancelSubscriptionRequest): Promise<CancelSubscriptionResponse>;
  updateSubscription(request: UpdateSubscriptionRequest): Promise<UpdateSubscriptionResponse>;
  
  // Webhook handling
  verifyWebhook(payload: string, signature: string): Promise<WebhookEvent>;
  processWebhook(event: WebhookEvent): Promise<void>;
  
  // Utility methods
  getSupportedCurrencies(): Currency[];
  getSupportedPaymentMethods(): PaymentMethod[];
  isSupported(currency: Currency, paymentMethod: PaymentMethod): boolean;
}

/**
 * Payment gateway factory interface
 */
export interface PaymentGatewayFactory {
  createGateway(gateway: PaymentGateway): PaymentGatewayInterface;
  getSupportedGateways(): PaymentGateway[];
}

/**
 * Payment service interface for high-level payment operations
 */
export interface PaymentServiceInterface {
  // Subscription management
  createSubscription(userId: string, planId: string, paymentMethod?: PaymentMethodInfo): Promise<CreateSubscriptionResponse>;
  cancelSubscription(subscriptionId: string, cancelAtPeriodEnd?: boolean): Promise<CancelSubscriptionResponse>;
  updateSubscription(subscriptionId: string, updates: Partial<UpdateSubscriptionRequest>): Promise<UpdateSubscriptionResponse>;
  
  // Payment processing
  processPayment(userId: string, amount: number, description: string, paymentMethod?: PaymentMethodInfo): Promise<ProcessPaymentResponse>;
  
  // Webhook handling
  handleWebhook(gateway: PaymentGateway, payload: string, signature: string): Promise<void>;
  
  // Utility methods
  getActiveSubscription(userId: string): Promise<any>;
  getPaymentHistory(userId: string): Promise<any[]>;
  getAvailablePlans(): Promise<any[]>;
}

/**
 * Error types for payment operations
 */
export class PaymentError extends Error {
  constructor(
    message: string,
    public code: string,
    public gateway?: PaymentGateway,
    public metadata?: Record<string, any>
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

export class PaymentGatewayError extends PaymentError {
  constructor(message: string, gateway: PaymentGateway, metadata?: Record<string, any>) {
    super(message, 'GATEWAY_ERROR', gateway, metadata);
    this.name = 'PaymentGatewayError';
  }
}

export class PaymentValidationError extends PaymentError {
  constructor(message: string, metadata?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', undefined, metadata);
    this.name = 'PaymentValidationError';
  }
}

export class PaymentConfigurationError extends PaymentError {
  constructor(message: string, gateway: PaymentGateway) {
    super(message, 'CONFIGURATION_ERROR', gateway);
    this.name = 'PaymentConfigurationError';
  }
}