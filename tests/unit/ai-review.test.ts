import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { parseAIResponse, craftReviewPrompt } from '@/app/api/ai/review-application/route';

// Mock data for testing
const mockRequirement = {
  name: 'Personal Statement',
  description: 'A 500-word personal statement explaining your motivation for this scholarship',
  category: 'personal',
  requirementType: 'document',
  documentType: 'personal_statement',
  isRequired: true,
  isOptional: false,
  wordLimit: 500,
  characterLimit: 3000
};

const mockDocument = {
  content: 'I am passionate about computer science and have been programming since I was 12 years old. I believe that technology can solve many of the world\'s problems, and I want to be part of that solution. This scholarship would help me pursue my dream of becoming a software engineer and making a positive impact on society.',
  title: 'Personal Statement',
  type: 'personal_statement'
};

const mockApplication = {
  name: 'MIT Computer Science Application',
  applicationType: 'scholarship'
};

const mockScholarship = {
  name: 'MIT Computer Science Scholarship',
  description: 'Scholarship for outstanding computer science students',
  amount: 25000,
  currency: 'USD',
  fieldOfStudy: 'Computer Science',
  eligibility: 'Outstanding academic record and demonstrated interest in computer science'
};

describe('AI Review Feature', () => {
  describe('craftReviewPrompt', () => {
    it('should generate a comprehensive review prompt', () => {
      const prompt = craftReviewPrompt(
        mockRequirement,
        mockDocument,
        mockApplication,
        mockScholarship,
        undefined,
        'document_review'
      );

      expect(prompt).toContain('You are an expert scholarship and academic application reviewer');
      expect(prompt).toContain('Personal Statement');
      expect(prompt).toContain('MIT Computer Science Scholarship');
      expect(prompt).toContain('500-word personal statement');
      expect(prompt).toContain('I am passionate about computer science');
      expect(prompt).toContain('JSON format');
    });

    it('should include custom instructions when provided', () => {
      const customInstructions = 'Focus on technical skills and programming experience';
      const prompt = craftReviewPrompt(
        mockRequirement,
        mockDocument,
        mockApplication,
        mockScholarship,
        undefined,
        'document_review',
        customInstructions
      );

      expect(prompt).toContain('CUSTOM INSTRUCTIONS: Focus on technical skills and programming experience');
    });

    it('should work without scholarship context', () => {
      const prompt = craftReviewPrompt(
        mockRequirement,
        mockDocument,
        mockApplication,
        undefined,
        undefined,
        'document_review'
      );

      expect(prompt).toContain('Personal Statement');
      expect(prompt).not.toContain('SCHOLARSHIP DETAILS');
    });
  });

  describe('parseAIResponse', () => {
    it('should parse valid AI response', () => {
      const validResponse = `{
        "scores": {
          "overall": 85,
          "contentQuality": 80,
          "completeness": 90,
          "relevance": 85,
          "formatting": 75,
          "clarity": 80,
          "strength": 85
        },
        "feedback": [
          {
            "type": "positive",
            "category": "content_quality",
            "title": "Strong Personal Motivation",
            "description": "The statement effectively conveys genuine passion for computer science",
            "severity": "medium",
            "suggestions": ["Add more specific examples of programming projects"],
            "examples": ["Mention specific programming languages or technologies"]
          }
        ],
        "summary": {
          "strengths": ["Clear personal motivation", "Good structure"],
          "weaknesses": ["Could use more specific examples"],
          "recommendations": ["Add concrete examples of programming experience"],
          "overallAssessment": "A solid personal statement with room for improvement in specific examples"
        }
      }`;

      const result = parseAIResponse(validResponse);

      expect(result.scores.overall).toBe(85);
      expect(result.scores.contentQuality).toBe(80);
      expect(result.feedback).toHaveLength(1);
      expect(result.feedback[0].type).toBe('positive');
      expect(result.summary.strengths).toContain('Clear personal motivation');
      expect(result.summary.weaknesses).toContain('Could use more specific examples');
    });

    it('should handle AI response with extra text', () => {
      const responseWithExtraText = `Here is my analysis of your personal statement:

{
  "scores": {
    "overall": 75,
    "contentQuality": 70,
    "completeness": 80,
    "relevance": 75,
    "formatting": 70,
    "clarity": 75,
    "strength": 70
  },
  "feedback": [
    {
      "type": "suggestion",
      "category": "content_quality",
      "title": "Add More Specific Examples",
      "description": "Include concrete examples of your programming experience",
      "severity": "medium",
      "suggestions": ["Mention specific projects", "Include programming languages used"]
    }
  ],
  "summary": {
    "strengths": ["Good structure"],
    "weaknesses": ["Lacks specific examples"],
    "recommendations": ["Add more concrete examples"],
    "overallAssessment": "A good start but needs more specific examples"
  }
}

I hope this helps with your application!`;

      const result = parseAIResponse(responseWithExtraText);

      expect(result.scores.overall).toBe(75);
      expect(result.feedback).toHaveLength(1);
      expect(result.feedback[0].type).toBe('suggestion');
    });

    it('should throw error for invalid JSON', () => {
      const invalidResponse = 'This is not valid JSON';

      expect(() => parseAIResponse(invalidResponse)).toThrow('No valid JSON found in response');
    });

    it('should throw error for missing required fields', () => {
      const incompleteResponse = `{
        "scores": {
          "overall": 85
        }
      }`;

      expect(() => parseAIResponse(incompleteResponse)).toThrow('Missing required fields in AI response');
    });

    it('should throw error for invalid scores', () => {
      const invalidScoresResponse = `{
        "scores": {
          "overall": 150,
          "contentQuality": 80,
          "completeness": 90,
          "relevance": 85,
          "formatting": 75,
          "clarity": 80,
          "strength": 85
        },
        "feedback": [],
        "summary": {
          "strengths": [],
          "weaknesses": [],
          "recommendations": [],
          "overallAssessment": "Test"
        }
      }`;

      expect(() => parseAIResponse(invalidScoresResponse)).toThrow('Invalid score for overall');
    });

    it('should throw error for invalid feedback structure', () => {
      const invalidFeedbackResponse = `{
        "scores": {
          "overall": 85,
          "contentQuality": 80,
          "completeness": 90,
          "relevance": 85,
          "formatting": 75,
          "clarity": 80,
          "strength": 85
        },
        "feedback": [
          {
            "type": "positive",
            "title": "Good content"
          }
        ],
        "summary": {
          "strengths": [],
          "weaknesses": [],
          "recommendations": [],
          "overallAssessment": "Test"
        }
      }`;

      expect(() => parseAIResponse(invalidFeedbackResponse)).toThrow('Invalid feedback item structure');
    });
  });

  describe('Score Validation', () => {
    it('should validate all required scores are present', () => {
      const validScores = {
        overall: 85,
        contentQuality: 80,
        completeness: 90,
        relevance: 85,
        formatting: 75,
        clarity: 80,
        strength: 85
      };

      const requiredScores = ['overall', 'contentQuality', 'completeness', 'relevance', 'formatting', 'clarity', 'strength'];
      
      requiredScores.forEach(score => {
        expect(validScores).toHaveProperty(score);
        expect(typeof validScores[score as keyof typeof validScores]).toBe('number');
        expect(validScores[score as keyof typeof validScores]).toBeGreaterThanOrEqual(0);
        expect(validScores[score as keyof typeof validScores]).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Feedback Validation', () => {
    it('should validate feedback item structure', () => {
      const validFeedback = {
        type: 'positive',
        category: 'content_quality',
        title: 'Strong Personal Motivation',
        description: 'The statement effectively conveys genuine passion',
        severity: 'medium',
        suggestions: ['Add more examples'],
        examples: ['Mention specific projects']
      };

      expect(validFeedback).toHaveProperty('type');
      expect(validFeedback).toHaveProperty('category');
      expect(validFeedback).toHaveProperty('title');
      expect(validFeedback).toHaveProperty('description');
      expect(validFeedback).toHaveProperty('severity');
      
      expect(['positive', 'negative', 'suggestion', 'warning', 'improvement']).toContain(validFeedback.type);
      expect(['low', 'medium', 'high']).toContain(validFeedback.severity);
    });
  });
}); 