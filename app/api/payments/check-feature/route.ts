import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkFeatureAccess } from '@/lib/payment/paywall-middleware';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { feature } = body;

    if (!feature) {
      return NextResponse.json({ error: 'Feature name is required' }, { status: 400 });
    }

    const result = await checkFeatureAccess(session.user.id, feature);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Check feature access error:', error);
    return NextResponse.json(
      { error: 'Failed to check feature access' },
      { status: 500 }
    );
  }
}