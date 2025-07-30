import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import AIReview from '@/models/AIReview';

// Mock MongoDB connection
beforeAll(async () => {
  // Set up test database connection
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('AIReview Model', () => {
  it('should create a valid AIReview with required fields', async () => {
    const validReviewData = {
      applicationId: new mongoose.Types.ObjectId(),
      requirementId: new mongoose.Types.ObjectId(),
      documentId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      reviewType: 'document_review' as const,
      status: 'completed' as const,
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
          type: 'positive' as const,
          category: 'content_quality' as const,
          title: 'Strong Content',
          description: 'The document has good content quality',
          severity: 'medium' as const,
          suggestions: ['Add more examples'],
          examples: ['Include specific instances']
        }
      ],
      summary: {
        strengths: ['Good structure', 'Clear writing'],
        weaknesses: ['Could use more examples'],
        recommendations: ['Add more concrete examples'],
        overallAssessment: 'A solid document with room for improvement'
      },
      aiModel: 'gemini-1.5-flash',
      aiProvider: 'google',
      processingTime: 1500,
      reviewedAt: new Date()
    };

    const review = new AIReview(validReviewData);
    const savedReview = await review.save();

    expect(savedReview._id).toBeDefined();
    expect(savedReview.scores.overall).toBe(85);
    expect(savedReview.feedback).toHaveLength(1);
    expect(savedReview.summary.strengths).toContain('Good structure');
    expect(savedReview.status).toBe('completed');

    // Clean up
    await AIReview.findByIdAndDelete(savedReview._id);
  });

  it('should fail validation when required fields are missing', async () => {
    const invalidReviewData = {
      applicationId: new mongoose.Types.ObjectId(),
      requirementId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      reviewType: 'document_review' as const,
      aiModel: 'gemini-1.5-flash',
      aiProvider: 'google'
      // Missing scores and summary
    };

    const review = new AIReview(invalidReviewData);
    
    try {
      await review.save();
      // If we get here, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeDefined();
      expect((error as any).message).toContain('validation failed');
    }
  });

  it('should validate score ranges', async () => {
    const invalidScoreData = {
      applicationId: new mongoose.Types.ObjectId(),
      requirementId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      reviewType: 'document_review' as const,
      status: 'completed' as const,
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
        strengths: ['Good content'],
        weaknesses: [],
        recommendations: [],
        overallAssessment: 'Test review'
      },
      aiModel: 'gemini-1.5-flash',
      aiProvider: 'google'
    };

    const review = new AIReview(invalidScoreData);
    
    try {
      await review.save();
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should handle feedback items correctly', async () => {
    const reviewData = {
      applicationId: new mongoose.Types.ObjectId(),
      requirementId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      reviewType: 'document_review' as const,
      status: 'completed' as const,
      scores: {
        overall: 75,
        contentQuality: 70,
        completeness: 80,
        relevance: 75,
        formatting: 70,
        clarity: 75,
        strength: 70
      },
      feedback: [
        {
          type: 'positive' as const,
          category: 'content_quality' as const,
          title: 'Good Structure',
          description: 'The document is well organized',
          severity: 'low' as const,
          suggestions: ['Keep the current structure'],
          examples: ['The introduction flows well']
        },
        {
          type: 'suggestion' as const,
          category: 'clarity' as const,
          title: 'Improve Clarity',
          description: 'Some sentences could be clearer',
          severity: 'medium' as const,
          suggestions: ['Use shorter sentences', 'Avoid jargon'],
          examples: ['Instead of "utilize" use "use"']
        }
      ],
      summary: {
        strengths: ['Well organized', 'Good topic coverage'],
        weaknesses: ['Some unclear sentences'],
        recommendations: ['Improve sentence clarity'],
        overallAssessment: 'Good document with minor improvements needed'
      },
      aiModel: 'gemini-1.5-flash',
      aiProvider: 'google'
    };

    const review = new AIReview(reviewData);
    const savedReview = await review.save();

    expect(savedReview.feedback).toHaveLength(2);
    expect(savedReview.feedback[0].type).toBe('positive');
    expect(savedReview.feedback[1].type).toBe('suggestion');
    expect(savedReview.feedback[0].severity).toBe('low');
    expect(savedReview.feedback[1].severity).toBe('medium');

    // Clean up
    await AIReview.findByIdAndDelete(savedReview._id);
  });
}); 