import { PaymentGateway, PaymentGatewayInterface, PaymentGatewayFactory as IPaymentGatewayFactory } from './types';
import { StripeGateway } from './gateways/stripe';
import { PaystackGateway } from './gateways/paystack';

export class PaymentGatewayFactory implements IPaymentGatewayFactory {
  private gateways: Map<PaymentGateway, PaymentGatewayInterface> = new Map();

  createGateway(gateway: PaymentGateway): PaymentGatewayInterface {
    switch (gateway) {
      case 'stripe':
        return new StripeGateway();
      case 'paystack':
        return new PaystackGateway();
      case 'flutterwave':
        // TODO: Implement Flutterwave gateway
        throw new Error('Flutterwave gateway not implemented yet');
      case 'paypal':
        // TODO: Implement PayPal gateway
        throw new Error('PayPal gateway not implemented yet');
      case 'razorpay':
        // TODO: Implement Razorpay gateway
        throw new Error('Razorpay gateway not implemented yet');
      case 'custom':
        // TODO: Implement custom gateway
        throw new Error('Custom gateway not implemented yet');
      default:
        throw new Error(`Unsupported payment gateway: ${gateway}`);
    }
  }

  getSupportedGateways(): PaymentGateway[] {
    return ['stripe', 'paystack'];
  }

  /**
   * Get the best payment gateway for a given currency and payment method
   */
  getBestGateway(currency: string, paymentMethod: string): PaymentGateway {
    // Priority order for different regions
    const currencyToGateway: Record<string, PaymentGateway> = {
      'NGN': 'paystack', // Nigerian Naira - Paystack is preferred
      'GHS': 'paystack', // Ghanaian Cedi - Paystack is preferred
      'ZAR': 'paystack', // South African Rand - Paystack is preferred
      'KES': 'paystack', // Kenyan Shilling - Paystack is preferred
      'USD': 'stripe',   // US Dollar - Stripe is preferred
      'EUR': 'stripe',   // Euro - Stripe is preferred
      'GBP': 'stripe',   // British Pound - Stripe is preferred
      'CAD': 'stripe',   // Canadian Dollar - Stripe is preferred
      'AUD': 'stripe',   // Australian Dollar - Stripe is preferred
      'INR': 'stripe',   // Indian Rupee - Stripe is preferred
    };

    return currencyToGateway[currency] || 'stripe';
  }

  /**
   * Get all supported gateways for a given currency and payment method
   */
  getSupportedGatewaysForCurrency(currency: string, paymentMethod: string): PaymentGateway[] {
    const supported: PaymentGateway[] = [];

    // Check each gateway
    for (const gateway of this.getSupportedGateways()) {
      const gatewayInstance = this.createGateway(gateway);
      if (gatewayInstance.isSupported(currency as any, paymentMethod as any)) {
        supported.push(gateway);
      }
    }

    return supported;
  }
}