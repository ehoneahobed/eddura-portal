import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { PaymentService } from '@/lib/payment/payment-service';
import { PaymentValidationError, PaymentGatewayError } from '@/lib/payment/types';

const paymentService = new PaymentService();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, description, paymentMethod } = body;

    if (!amount || !description) {
      return NextResponse.json({ error: 'Amount and description are required' }, { status: 400 });
    }

    const response = await paymentService.processPayment(
      session.user.id,
      amount,
      description,
      paymentMethod
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error('Process payment error:', error);
    
    if (error instanceof PaymentValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    if (error instanceof PaymentGatewayError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transactions = await paymentService.getPaymentHistory(session.user.id);
    
    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Get payment history error:', error);
    return NextResponse.json(
      { error: 'Failed to get payment history' },
      { status: 500 }
    );
  }
}