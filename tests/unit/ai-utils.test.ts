import { describe, it, expect } from 'vitest';
import { 
  isRetryableError, 
  createUserFriendlyErrorMessage, 
  createFallbackReview,
  calculateBackoffDelay,
  validateAIResponse 
} from '@/lib/ai-utils';

describe('AI Utils', () => {
  describe('isRetryableError', () => {
    it('should identify overload errors as retryable', () => {
      const overloadError = { message: 'The model is overloaded. Please try again later.' };
      expect(isRetryableError(overloadError)).toBe(true);
    });

    it('should identify 503 errors as retryable', () => {
      const serviceUnavailableError = { message: '503 Service Unavailable' };
      expect(isRetryableError(serviceUnavailableError)).toBe(true);
    });

    it('should identify rate limit errors as retryable', () => {
      const rateLimitError = { message: 'Rate limit exceeded' };
      expect(isRetryableError(rateLimitError)).toBe(true);
    });

    it('should identify network errors as retryable', () => {
      const networkError = { message: 'Network error occurred' };
      expect(isRetryableError(networkError)).toBe(true);
    });

    it('should identify timeout errors as retryable', () => {
      const timeoutError = { message: 'Request timeout' };
      expect(isRetryableError(timeoutError)).toBe(true);
    });

    it('should not identify authentication errors as retryable', () => {
      const authError = { message: 'Invalid API key' };
      expect(isRetryableError(authError)).toBe(false);
    });

    it('should not identify validation errors as retryable', () => {
      const validationError = { message: 'Invalid input format' };
      expect(isRetryableError(validationError)).toBe(false);
    });
  });

  describe('createUserFriendlyErrorMessage', () => {
    it('should create appropriate message for overload errors', () => {
      const overloadError = { message: 'The model is overloaded' };
      const message = createUserFriendlyErrorMessage(overloadError);
      expect(message).toContain('currently busy');
    });

    it('should create appropriate message for quota errors', () => {
      const quotaError = { message: 'quota exceeded' };
      const message = createUserFriendlyErrorMessage(quotaError);
      expect(message).toContain('quota exceeded');
    });

    it('should create appropriate message for network errors', () => {
      const networkError = { message: 'network timeout' };
      const message = createUserFriendlyErrorMessage(networkError);
      expect(message).toContain('Network error');
    });

    it('should create appropriate message for authentication errors', () => {
      const authError = { message: 'Invalid API key' };
      const message = createUserFriendlyErrorMessage(authError);
      expect(message).toContain('configuration error');
    });

    it('should create default message for unknown errors', () => {
      const unknownError = { message: 'Unknown error' };
      const message = createUserFriendlyErrorMessage(unknownError);
      expect(message).toBe('Failed to generate AI review. Please try again.');
    });
  });

  describe('createFallbackReview', () => {
    it('should create a valid fallback review structure', () => {
      const fallback = createFallbackReview('Test Document');
      
      expect(fallback.scores).toBeDefined();
      expect(fallback.feedback).toBeInstanceOf(Array);
      expect(fallback.summary).toBeDefined();
      
      // Check that scores are numbers between 0-100
      Object.values(fallback.scores).forEach(score => {
        expect(typeof score).toBe('number');
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
      
      // Check that feedback items have required fields
      fallback.feedback.forEach(item => {
        expect(item.type).toBeDefined();
        expect(item.category).toBeDefined();
        expect(item.title).toBeDefined();
        expect(item.description).toBeDefined();
        expect(item.severity).toBeDefined();
      });
      
      // Check that summary has required fields
      expect(fallback.summary.strengths).toBeInstanceOf(Array);
      expect(fallback.summary.weaknesses).toBeInstanceOf(Array);
      expect(fallback.summary.recommendations).toBeInstanceOf(Array);
      expect(typeof fallback.summary.overallAssessment).toBe('string');
    });

    it('should include document name in the description', () => {
      const fallback = createFallbackReview('My Personal Statement');
      const description = fallback.feedback[0].description;
      expect(description).toContain('My Personal Statement');
    });
  });

  describe('calculateBackoffDelay', () => {
    it('should calculate exponential backoff delays', () => {
      const delay1 = calculateBackoffDelay(1);
      const delay2 = calculateBackoffDelay(2);
      const delay3 = calculateBackoffDelay(3);
      
      expect(delay1).toBe(1000); // 1 second
      expect(delay2).toBe(2000); // 2 seconds
      expect(delay3).toBe(4000); // 4 seconds
    });

    it('should respect maximum delay limit', () => {
      const delay4 = calculateBackoffDelay(4);
      const delay5 = calculateBackoffDelay(5);
      
      expect(delay4).toBe(5000); // Max delay
      expect(delay5).toBe(5000); // Max delay
    });
  });

  describe('validateAIResponse', () => {
    it('should validate a correct AI response', () => {
      const validResponse = {
        scores: {
          overall: 85,
          contentQuality: 80,
          completeness: 90,
          relevance: 85,
          formatting: 75,
          clarity: 80,
          strength: 85
        },
        feedback: [
          {
            type: 'positive',
            category: 'content_quality',
            title: 'Good Content',
            description: 'The content is well written',
            severity: 'medium',
            suggestions: ['Keep it up'],
            examples: []
          }
        ],
        summary: {
          strengths: ['Good structure'],
          weaknesses: ['Could use more examples'],
          recommendations: ['Add examples'],
          overallAssessment: 'Good document'
        }
      };
      
      const result = validateAIResponse(validResponse);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing scores', () => {
      const invalidResponse = {
        feedback: [],
        summary: {
          strengths: [],
          weaknesses: [],
          recommendations: [],
          overallAssessment: 'Test'
        }
      };
      
      const result = validateAIResponse(invalidResponse);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing scores object');
    });

    it('should detect invalid score values', () => {
      const invalidResponse = {
        scores: {
          overall: 150, // Invalid: should be 0-100
          contentQuality: 80,
          completeness: 90,
          relevance: 85,
          formatting: 75,
          clarity: 80,
          strength: 85
        },
        feedback: [],
        summary: {
          strengths: [],
          weaknesses: [],
          recommendations: [],
          overallAssessment: 'Test'
        }
      };
      
      const result = validateAIResponse(invalidResponse);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('Invalid score'))).toBe(true);
    });

    it('should detect missing summary fields', () => {
      const invalidResponse = {
        scores: {
          overall: 85,
          contentQuality: 80,
          completeness: 90,
          relevance: 85,
          formatting: 75,
          clarity: 80,
          strength: 85
        },
        feedback: [],
        summary: {
          strengths: [],
          weaknesses: []
          // Missing recommendations and overallAssessment
        }
      };
      
      const result = validateAIResponse(invalidResponse);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('recommendations'))).toBe(true);
      expect(result.errors.some(error => error.includes('overallAssessment'))).toBe(true);
    });

    it('should detect invalid feedback structure', () => {
      const invalidResponse = {
        scores: {
          overall: 85,
          contentQuality: 80,
          completeness: 90,
          relevance: 85,
          formatting: 75,
          clarity: 80,
          strength: 85
        },
        feedback: [
          {
            type: 'positive',
            // Missing required fields
            title: 'Good'
          }
        ],
        summary: {
          strengths: [],
          weaknesses: [],
          recommendations: [],
          overallAssessment: 'Test'
        }
      };
      
      const result = validateAIResponse(invalidResponse);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('Feedback item 0'))).toBe(true);
    });
  });
}); 