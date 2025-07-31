import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { aiConfig, getActiveProvider } from '@/lib/ai-config';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import AIReview, { IAIReview, IAIReviewFeedback } from '@/models/AIReview';
import Application from '@/models/Application';
import ApplicationRequirement from '@/models/ApplicationRequirement';
import Document from '@/models/Document';
import Scholarship from '@/models/Scholarship';
import Program from '@/models/Program';
import { 
  isRetryableError, 
  createUserFriendlyErrorMessage, 
  createFallbackReview,
  calculateBackoffDelay 
} from '@/lib/ai-utils';
import { craftReviewPrompt, parseAIResponse } from '@/lib/ai-review-utils';

// Validation schema for AI review request
const ReviewRequestSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  requirementId: z.string().min(1, 'Requirement ID is required'),
  reviewType: z.enum(['document_review', 'requirement_compliance', 'overall_package']),
  customInstructions: z.string().max(1000).optional(),
});

// Initialize AI providers
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

/**
 * Generate AI response using Google Generative AI with improved error handling
 */
async function generateAIResponse(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ 
    model: aiConfig.providers.google.model,
    generationConfig: {
      temperature: 0.3,
      topK: 40,
      topP: 0.8,
      maxOutputTokens: 4000,
    }
  });
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if AI service is configured
    const activeProvider = getActiveProvider();
    if (!activeProvider) {
      return NextResponse.json(
        { error: 'AI service not configured. Please set up an AI provider API key.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = ReviewRequestSchema.parse(body);
    
    // Connect to database
    await connectDB();

    // Fetch application and verify ownership
    const application = await Application.findOne({
      _id: validatedData.applicationId,
      userId: session.user.id
    }).lean();

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Fetch requirement
    const requirement = await ApplicationRequirement.findOne({
      _id: validatedData.requirementId,
      applicationId: validatedData.applicationId
    }).lean();

    if (!requirement) {
      return NextResponse.json({ error: 'Requirement not found' }, { status: 404 });
    }

    // Fetch document if this is a document review
    let document = null;
    if (validatedData.reviewType === 'document_review') {
      document = await Document.findOne({
        requirementId: validatedData.requirementId,
        applicationId: validatedData.applicationId
      }).lean();

      if (!document) {
        return NextResponse.json({ error: 'Document not found for this requirement' }, { status: 404 });
      }
    }

    // Fetch scholarship and program context
    let scholarship = null;
    let program = null;

    if (application.scholarshipId) {
      scholarship = await Scholarship.findById(application.scholarshipId).lean();
    }

    if (application.programId) {
      program = await Program.findById(application.programId).lean();
    }

    // Check if review already exists
    const existingReview = await AIReview.findOne({
      applicationId: validatedData.applicationId,
      requirementId: validatedData.requirementId,
      reviewType: validatedData.reviewType
    });

    if (existingReview) {
      return NextResponse.json({
        success: true,
        review: existingReview,
        message: 'Review already exists'
      });
    }

    // Create review record
    const review = new AIReview({
      applicationId: validatedData.applicationId,
      requirementId: validatedData.requirementId,
      documentId: document?._id,
      userId: session.user.id,
      reviewType: validatedData.reviewType,
      status: 'in_progress',
      aiModel: aiConfig.providers.google.model,
      aiProvider: 'google'
    });

    await review.save();

    try {
      // Generate prompt
      const prompt = craftReviewPrompt(
        requirement,
        document || { content: 'No document content available' },
        application,
        validatedData.reviewType,
        scholarship,
        program,
        validatedData.customInstructions
      );

      // Generate AI response with retry logic
      let aiResponse = '';
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          aiResponse = await generateAIResponse(prompt);
          break;
        } catch (error) {
          attempts++;
          console.error(`AI generation attempt ${attempts} failed:`, error);

          if (attempts >= maxAttempts) {
            throw error;
          }

          if (isRetryableError(error)) {
            const delay = calculateBackoffDelay(attempts);
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            throw error;
          }
        }
      }

      // Parse AI response
      const parsedResponse = parseAIResponse(aiResponse);

      // Update review with results
      review.scores = parsedResponse.scores;
      review.feedback = parsedResponse.feedback;
      review.summary = parsedResponse.summary;
      review.status = 'completed';
      review.reviewedAt = new Date();
      review.processingTime = Date.now() - review.createdAt.getTime();

      await review.save();

      return NextResponse.json({
        success: true,
        review,
        message: 'AI review completed successfully'
      });

    } catch (error) {
      console.error('Error during AI review:', error);

      // Create fallback review
      const fallbackReview = createFallbackReview(
        document?.title || requirement.name
      );

      // Update review with fallback data
      review.scores = fallbackReview.scores;
      review.feedback = fallbackReview.feedback;
      review.summary = fallbackReview.summary;
      review.status = 'failed';
      review.reviewedAt = new Date();
      review.processingTime = Date.now() - review.createdAt.getTime();

      await review.save();

      return NextResponse.json({
        success: false,
        review,
        error: createUserFriendlyErrorMessage(error)
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in AI review endpoint:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid request data',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');
    const requirementId = searchParams.get('requirementId');
    const reviewType = searchParams.get('reviewType');

    if (!applicationId || !requirementId) {
      return NextResponse.json({ error: 'Application ID and Requirement ID are required' }, { status: 400 });
    }

    // Connect to database
    await connectDB();

    // Build query
    const query: any = {
      applicationId,
      requirementId
    };

    if (reviewType) {
      query.reviewType = reviewType;
    }

    // Fetch reviews
    const reviews = await AIReview.find(query)
      .populate('requirement', 'name description category requirementType')
      .populate('document', 'title type')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      reviews,
      count: reviews.length
    });

  } catch (error) {
    console.error('Error fetching AI reviews:', error);
    return NextResponse.json({
      error: 'Failed to fetch reviews'
    }, { status: 500 });
  }
} 