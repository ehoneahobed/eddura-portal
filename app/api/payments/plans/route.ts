import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payment/payment-service';

const paymentService = new PaymentService();

export async function GET(request: NextRequest) {
  try {
    const plans = await paymentService.getAvailablePlans();
    
    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Get plans error:', error);
    return NextResponse.json(
      { error: 'Failed to get plans' },
      { status: 500 }
    );
  }
}