import { NextRequest, NextResponse } from 'next/server';
import { withPaywallPOST, PaywallConfigs } from '@/lib/payment/with-paywall';

async function handleAIRefinement(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { content, refinementType } = body;

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Simulate AI content refinement
    const refinedContent = `[AI Refined] ${content}`;
    
    return NextResponse.json({
      success: true,
      originalContent: content,
      refinedContent,
      refinementType,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI refinement error:', error);
    return NextResponse.json(
      { error: 'Failed to refine content' },
      { status: 500 }
    );
  }
}

// Apply paywall with AI content refinement configuration
export const POST = withPaywallPOST(handleAIRefinement, PaywallConfigs.AI_CONTENT_REFINEMENT);