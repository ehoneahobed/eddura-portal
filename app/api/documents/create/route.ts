import { NextRequest, NextResponse } from 'next/server';
import { withPaywallPOST, PaywallConfigs } from '@/lib/payment/with-paywall';
import { connectToDatabase } from '@/lib/mongodb';
import { Document } from '@/models/Document';
import { Subscription } from '@/models/Subscription';

async function handleDocumentCreation(request: NextRequest): Promise<NextResponse> {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { title, content, type, metadata } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Get user session (this would be handled by the paywall middleware)
    // For this example, we'll assume the user ID is available
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get current document count for the user
    const documentCount = await Document.countDocuments({ userId });
    
    // Get user's subscription to check limits
    const subscription = await Subscription.findOne({
      userId,
      isActive: true,
      status: { $in: ['active', 'trialing'] }
    });

    let documentLimit = 5; // Default free plan limit
    
    if (subscription) {
      // Get plan details to determine limit
      const plan = await SubscriptionPlan.findOne({ planId: subscription.planId });
      if (plan) {
        documentLimit = plan.features.maxDocuments || 5;
      }
    }

    // Check if user has reached their document limit
    if (documentLimit !== -1 && documentCount >= documentLimit) {
      return NextResponse.json({
        error: 'Document limit reached',
        code: 'DOCUMENT_LIMIT_EXCEEDED',
        currentCount: documentCount,
        limit: documentLimit,
        subscription: subscription ? {
          planId: subscription.planId,
          planName: subscription.planName,
          status: subscription.status
        } : null
      }, { status: 403 });
    }

    // Create the document
    const document = new Document({
      userId,
      title,
      content,
      type: type || 'general',
      metadata: metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await document.save();

    return NextResponse.json({
      success: true,
      document: {
        id: document._id,
        title: document.title,
        type: document.type,
        createdAt: document.createdAt
      },
      usage: {
        current: documentCount + 1,
        limit: documentLimit,
        percentage: documentLimit > 0 ? ((documentCount + 1) / documentLimit) * 100 : 0
      }
    });
  } catch (error) {
    console.error('Document creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}

// Apply paywall with document limit configuration
export const POST = withPaywallPOST(handleDocumentCreation, PaywallConfigs.DOCUMENTS_LIMIT);