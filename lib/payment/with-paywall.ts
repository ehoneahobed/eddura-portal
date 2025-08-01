import { NextRequest, NextResponse } from 'next/server';
import { enforcePaywall, createPaywallResponse, PaywallConfig } from './paywall-middleware';

/**
 * Higher-order function to wrap API route handlers with paywall checks
 */
export function withPaywall(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: PaywallConfig
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Apply paywall check
    const paywallResult = await enforcePaywall(request, config);
    
    if (!paywallResult.allowed) {
      return createPaywallResponse(paywallResult, config);
    }
    
    // If allowed, proceed with the original handler
    return handler(request);
  };
}

/**
 * Higher-order function for GET requests with paywall
 */
export function withPaywallGET(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: PaywallConfig
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    if (request.method !== 'GET') {
      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }
    
    return withPaywall(handler, config)(request);
  };
}

/**
 * Higher-order function for POST requests with paywall
 */
export function withPaywallPOST(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: PaywallConfig
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    if (request.method !== 'POST') {
      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }
    
    return withPaywall(handler, config)(request);
  };
}

/**
 * Higher-order function for PUT requests with paywall
 */
export function withPaywallPUT(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: PaywallConfig
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    if (request.method !== 'PUT') {
      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }
    
    return withPaywall(handler, config)(request);
  };
}

/**
 * Higher-order function for DELETE requests with paywall
 */
export function withPaywallDELETE(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: PaywallConfig
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    if (request.method !== 'DELETE') {
      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }
    
    return withPaywall(handler, config)(request);
  };
}

/**
 * Predefined paywall configurations for common use cases
 */
export const PaywallConfigs = {
  // AI Features
  AI_CONTENT_REFINEMENT: {
    requiredFeature: 'aiContentRefinement',
    allowTrial: true,
    trialDays: 7,
    errorMessage: 'AI content refinement requires a paid plan'
  } as PaywallConfig,
  
  AI_REVIEW: {
    requiredFeature: 'aiReview',
    requiredPlan: 'premium',
    allowTrial: true,
    trialDays: 7,
    errorMessage: 'AI review requires Premium plan or higher'
  } as PaywallConfig,
  
  AI_RECOMMENDATIONS: {
    requiredFeature: 'aiRecommendations',
    allowTrial: true,
    trialDays: 7,
    errorMessage: 'AI recommendations require a paid plan'
  } as PaywallConfig,
  
  // Document Management
  DOCUMENT_TEMPLATES: {
    requiredFeature: 'documentTemplates',
    allowTrial: true,
    trialDays: 7,
    errorMessage: 'Document templates require a paid plan'
  } as PaywallConfig,
  
  DOCUMENT_SHARING: {
    requiredFeature: 'documentSharing',
    allowTrial: true,
    trialDays: 7,
    errorMessage: 'Document sharing requires a paid plan'
  } as PaywallConfig,
  
  DOCUMENT_FEEDBACK: {
    requiredFeature: 'documentFeedback',
    allowTrial: true,
    trialDays: 7,
    errorMessage: 'Document feedback requires a paid plan'
  } as PaywallConfig,
  
  // Communication
  MESSAGING: {
    requiredFeature: 'messaging',
    allowTrial: true,
    trialDays: 7,
    errorMessage: 'Messaging requires a paid plan'
  } as PaywallConfig,
  
  TELEGRAM_BOT: {
    requiredFeature: 'telegramBot',
    requiredPlan: 'premium',
    allowTrial: true,
    trialDays: 7,
    errorMessage: 'Telegram bot requires Premium plan or higher'
  } as PaywallConfig,
  
  // Content Management
  CONTENT_MANAGEMENT: {
    requiredFeature: 'contentManagement',
    requiredPlan: 'premium',
    allowTrial: true,
    trialDays: 7,
    errorMessage: 'Content management requires Premium plan or higher'
  } as PaywallConfig,
  
  // Advanced Features
  PRIORITY_SUPPORT: {
    requiredFeature: 'prioritySupport',
    requiredPlan: 'premium',
    allowTrial: false,
    errorMessage: 'Priority support requires Premium plan or higher'
  } as PaywallConfig,
  
  ADVANCED_ANALYTICS: {
    requiredFeature: 'advancedAnalytics',
    requiredPlan: 'premium',
    allowTrial: true,
    trialDays: 7,
    errorMessage: 'Advanced analytics require Premium plan or higher'
  } as PaywallConfig,
  
  API_ACCESS: {
    requiredFeature: 'apiAccess',
    requiredPlan: 'enterprise',
    allowTrial: false,
    errorMessage: 'API access requires Enterprise plan'
  } as PaywallConfig,
  
  CUSTOM_BRANDING: {
    requiredFeature: 'customBranding',
    requiredPlan: 'enterprise',
    allowTrial: false,
    errorMessage: 'Custom branding requires Enterprise plan'
  } as PaywallConfig,
  
  // Usage Limits
  APPLICATIONS_LIMIT: {
    usageType: 'applications',
    allowTrial: true,
    trialDays: 7,
    errorMessage: 'Application limit reached. Upgrade your plan for more applications.'
  } as PaywallConfig,
  
  DOCUMENTS_LIMIT: {
    usageType: 'documents',
    allowTrial: true,
    trialDays: 7,
    errorMessage: 'Document limit reached. Upgrade your plan for more documents.'
  } as PaywallConfig,
  
  RECOMMENDATIONS_LIMIT: {
    usageType: 'recommendations',
    allowTrial: true,
    trialDays: 7,
    errorMessage: 'Recommendation limit reached. Upgrade your plan for more recommendations.'
  } as PaywallConfig,
  
  SCHOLARSHIPS_LIMIT: {
    usageType: 'scholarships',
    allowTrial: true,
    trialDays: 7,
    errorMessage: 'Scholarship limit reached. Upgrade your plan for more scholarships.'
  } as PaywallConfig,
  
  // Plan Requirements
  BASIC_PLAN: {
    requiredPlan: 'basic',
    allowTrial: true,
    trialDays: 7,
    errorMessage: 'This feature requires Basic plan or higher'
  } as PaywallConfig,
  
  PREMIUM_PLAN: {
    requiredPlan: 'premium',
    allowTrial: true,
    trialDays: 7,
    errorMessage: 'This feature requires Premium plan or higher'
  } as PaywallConfig,
  
  ENTERPRISE_PLAN: {
    requiredPlan: 'enterprise',
    allowTrial: false,
    errorMessage: 'This feature requires Enterprise plan'
  } as PaywallConfig,
};