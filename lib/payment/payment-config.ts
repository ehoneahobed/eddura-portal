/**
 * Payment configuration and feature flags
 */

export interface PaymentConfig {
  enabled: boolean;
  gateways: {
    stripe: boolean;
    paystack: boolean;
  };
  features: {
    subscriptions: boolean;
    oneTimePayments: boolean;
    trials: boolean;
    paywall: boolean;
  };
  trial: {
    enabled: boolean;
    duration: number; // days
  };
}

/**
 * Get payment configuration based on environment variables
 */
export function getPaymentConfig(): PaymentConfig {
  const isPaymentsEnabled = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === 'true';
  const isStripeEnabled = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY;
  const isPaystackEnabled = process.env.PAYSTACK_SECRET_KEY && process.env.PAYSTACK_PUBLISHABLE_KEY;
  
  return {
    enabled: isPaymentsEnabled,
    gateways: {
      stripe: isPaymentsEnabled && !!isStripeEnabled,
      paystack: isPaymentsEnabled && !!isPaystackEnabled,
    },
    features: {
      subscriptions: isPaymentsEnabled,
      oneTimePayments: isPaymentsEnabled,
      trials: isPaymentsEnabled && process.env.ENABLE_TRIALS !== 'false',
      paywall: isPaymentsEnabled && process.env.ENABLE_PAYWALL !== 'false',
    },
    trial: {
      enabled: isPaymentsEnabled && process.env.ENABLE_TRIALS !== 'false',
      duration: parseInt(process.env.TRIAL_DURATION_DAYS || '7'),
    },
  };
}

/**
 * Check if payments are enabled
 */
export function isPaymentsEnabled(): boolean {
  return getPaymentConfig().enabled;
}

/**
 * Check if a specific payment gateway is enabled
 */
export function isGatewayEnabled(gateway: 'stripe' | 'paystack'): boolean {
  const config = getPaymentConfig();
  return config.enabled && config.gateways[gateway];
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(feature: keyof PaymentConfig['features']): boolean {
  const config = getPaymentConfig();
  return config.enabled && config.features[feature];
}

/**
 * Check if trials are enabled
 */
export function isTrialsEnabled(): boolean {
  return getPaymentConfig().trial.enabled;
}

/**
 * Get trial duration in days
 */
export function getTrialDuration(): number {
  return getPaymentConfig().trial.duration;
}

/**
 * Get available payment gateways
 */
export function getAvailableGateways(): string[] {
  const config = getPaymentConfig();
  const gateways: string[] = [];
  
  if (config.gateways.stripe) gateways.push('stripe');
  if (config.gateways.paystack) gateways.push('paystack');
  
  return gateways;
}

/**
 * Check if paywall system is enabled
 */
export function isPaywallEnabled(): boolean {
  return getPaymentConfig().features.paywall;
}

/**
 * Get client-side payment configuration (safe for browser)
 */
export function getClientPaymentConfig() {
  return {
    enabled: process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === 'true',
    gateways: {
      stripe: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      paystack: !!process.env.NEXT_PUBLIC_PAYSTACK_PUBLISHABLE_KEY,
    },
    features: {
      subscriptions: process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === 'true',
      oneTimePayments: process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === 'true',
      trials: process.env.NEXT_PUBLIC_ENABLE_TRIALS !== 'false',
      paywall: process.env.NEXT_PUBLIC_ENABLE_PAYWALL !== 'false',
    },
    trial: {
      enabled: process.env.NEXT_PUBLIC_ENABLE_TRIALS !== 'false',
      duration: parseInt(process.env.NEXT_PUBLIC_TRIAL_DURATION_DAYS || '7'),
    },
  };
}