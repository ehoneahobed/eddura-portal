import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { checkUsageLimit } from '@/lib/payment/paywall-middleware';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { usageType, currentUsage } = body;

    if (!usageType) {
      return NextResponse.json({ error: 'Usage type is required' }, { status: 400 });
    }

    const result = await checkUsageLimit(session.user.id, usageType, currentUsage);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Check usage limit error:', error);
    return NextResponse.json(
      { error: 'Failed to check usage limit' },
      { status: 500 }
    );
  }
}