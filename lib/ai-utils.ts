import { aiConfig } from './ai-config';

/**
 * Utility functions for AI operations
 */

export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export const defaultRetryOptions: RetryOptions = {
  maxRetries: aiConfig.retrySettings.maxRetries,
  baseDelay: aiConfig.retrySettings.baseDelay,
  maxDelay: aiConfig.retrySettings.maxDelay,
  backoffMultiplier: aiConfig.retrySettings.backoffMultiplier
};

/**
 * Calculates delay for exponential backoff
 */
export function calculateBackoffDelay(attempt: number, options: RetryOptions = defaultRetryOptions): number {
  const delay = options.baseDelay * Math.pow(options.backoffMultiplier, attempt - 1);
  return Math.min(delay, options.maxDelay);
}

/**
 * Determines if an error is retryable
 */
export function isRetryableError(error: any): boolean {
  const errorMessage = error?.message || '';
  const status = error?.status || error?.statusCode || 0;
  
  // Service overload/rate limit errors
  if (errorMessage.includes('overloaded') || 
      errorMessage.includes('503') ||
      errorMessage.includes('Service Unavailable') ||
      errorMessage.includes('rate limit') ||
      errorMessage.includes('quota exceeded') ||
      status === 503 ||
      status === 429) {
    return true;
  }
  
  // Network errors
  if (errorMessage.includes('network') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('ECONNRESET') ||
      errorMessage.includes('ENOTFOUND') ||
      errorMessage.includes('ECONNREFUSED')) {
    return true;
  }
  
  // Google AI specific errors
  if (errorMessage.includes('GoogleGenerativeAI Error') ||
      errorMessage.includes('generativelanguage.googleapis.com')) {
    return true;
  }
  
  return false;
}

/**
 * Creates a user-friendly error message based on the error type
 */
export function createUserFriendlyErrorMessage(error: any): string {
  const errorMessage = error?.message || '';
  const status = error?.status || error?.statusCode || 0;
  
  if (errorMessage.includes('overloaded') || errorMessage.includes('503') || status === 503) {
    return 'AI service is currently experiencing high demand. Please try again in a few minutes.';
  }
  
  if (errorMessage.includes('quota') || status === 429) {
    return 'AI service quota exceeded. Please try again later or contact support.';
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
    return 'Network connection issue. Please check your connection and try again.';
  }
  
  if (errorMessage.includes('authentication') || errorMessage.includes('API key')) {
    return 'AI service configuration error. Please contact support.';
  }
  
  return 'Failed to generate AI review. Please try again in a few moments.';
}

/**
 * Creates a fallback review response when AI service is unavailable
 */
export function createFallbackReview(documentName: string): any {
  return {
    scores: aiConfig.retrySettings.fallbackScores,
    feedback: [
      {
        type: 'warning' as const,
        category: 'overall' as const,
        title: 'AI Service Unavailable',
        description: `The AI review service is currently unavailable. This is a basic assessment of "${documentName}".`,
        severity: 'medium' as const,
        suggestions: [
          'Try again in a few minutes for a detailed AI review',
          'Review your document manually against the requirements'
        ],
        examples: []
      },
      {
        type: 'suggestion' as const,
        category: 'content_quality' as const,
        title: 'Manual Review Recommended',
        description: 'Consider having someone review your document for clarity, completeness, and relevance to the requirements.',
        severity: 'low' as const,
        suggestions: [
          'Ask a mentor or advisor to review',
          'Check against the scholarship requirements',
          'Use spell-check and grammar tools'
        ],
        examples: []
      }
    ],
    summary: {
      strengths: ['Document submitted for review'],
      weaknesses: ['Unable to perform detailed AI analysis'],
      recommendations: [
        'Try the AI review again in a few minutes',
        'Consider manual review by an advisor',
        'Check document length and formatting'
      ],
      overallAssessment: 'AI service temporarily unavailable. Please try again later for a detailed analysis.'
    }
  };
}

/**
 * Validates AI response structure
 */
export function validateAIResponse(response: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!response) {
    errors.push('Response is empty');
    return { isValid: false, errors };
  }
  
  if (!response.scores) {
    errors.push('Missing scores object');
  } else {
    const requiredScores = ['overall', 'contentQuality', 'completeness', 'relevance', 'formatting', 'clarity', 'strength'];
    for (const score of requiredScores) {
      if (typeof response.scores[score] !== 'number' || response.scores[score] < 0 || response.scores[score] > 100) {
        errors.push(`Invalid score for ${score}: must be a number between 0-100`);
      }
    }
  }
  
  if (!response.summary) {
    errors.push('Missing summary object');
  } else {
    const requiredSummaryFields = ['strengths', 'weaknesses', 'recommendations', 'overallAssessment'];
    for (const field of requiredSummaryFields) {
      if (!response.summary[field]) {
        errors.push(`Missing summary field: ${field}`);
      }
    }
  }
  
  if (!Array.isArray(response.feedback)) {
    errors.push('Feedback must be an array');
  } else {
    response.feedback.forEach((item: any, index: number) => {
      const requiredFeedbackFields = ['type', 'category', 'title', 'description', 'severity'];
      for (const field of requiredFeedbackFields) {
        if (!item[field]) {
          errors.push(`Feedback item ${index} missing required field: ${field}`);
        }
      }
    });
  }
  
  return { isValid: errors.length === 0, errors };
} 