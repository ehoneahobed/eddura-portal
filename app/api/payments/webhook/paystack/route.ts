import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payment/payment-service';
import { PaymentValidationError } from '@/lib/payment/types';

const paymentService = new PaymentService();

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    await paymentService.handleWebhook('paystack', payload, signature);
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    
    if (error instanceof PaymentValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}