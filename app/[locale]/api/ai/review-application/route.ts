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

/**
 * Craft AI review prompt based on requirement and document content
 */
function craftReviewPrompt(
  requirement: any,
  document: any,
  application: any,
  reviewType: string,
  scholarship?: any | null,
  program?: any | null,
  customInstructions?: string
): string {
  let prompt = `You are an expert scholarship and academic application reviewer. You will evaluate a document against specific requirements and provide detailed feedback with scores.

IMPORTANT GUIDELINES:
- Provide objective, constructive feedback
- Score each category from 0-100 (0 = poor, 100 = excellent)
- Be specific about strengths and areas for improvement
- Provide actionable suggestions
- Consider the scholarship/program context
- Maintain a professional, encouraging tone

REVIEW CATEGORIES TO EVALUATE:
1. Content Quality (0-100): Relevance, depth, and substance of the content
2. Completeness (0-100): How well the document meets all requirements
3. Relevance (0-100): How well the content aligns with the scholarship/program
4. Formatting (0-100): Structure, organization, and presentation
5. Clarity (0-100): How clear and understandable the content is
6. Strength (0-100): Overall impact and persuasiveness
7. Overall (0-100): Comprehensive assessment

REQUIREMENT DETAILS:
- Name: ${requirement.name}
- Description: ${requirement.description || 'No description provided'}
- Category: ${requirement.category}
- Type: ${requirement.requirementType}
- Required: ${requirement.isRequired ? 'Yes' : 'No'}`;

  if (requirement.documentType) {
    prompt += `\n- Document Type: ${requirement.documentType}`;
  }
  if (requirement.wordLimit) {
    prompt += `\n- Word Limit: ${requirement.wordLimit}`;
  }
  if (requirement.characterLimit) {
    prompt += `\n- Character Limit: ${requirement.characterLimit}`;
  }

  prompt += `\n\nAPPLICATION CONTEXT:
- Application Name: ${application.name}
- Application Type: ${application.applicationType}`;

  if (scholarship) {
    prompt += `\n\nSCHOLARSHIP DETAILS:
- Name: ${scholarship.name}
- Description: ${scholarship.description || 'No description provided'}
- Amount: ${scholarship.amount} ${scholarship.currency}
- Field of Study: ${scholarship.fieldOfStudy || 'Not specified'}
- Eligibility: ${scholarship.eligibility || 'Not specified'}`;
  }

  if (program) {
    prompt += `\n\nPROGRAM DETAILS:
- Name: ${program.name}
- Degree Type: ${program.degreeType}
- Field of Study: ${program.fieldOfStudy}
- Duration: ${program.duration}
- School: ${program.school?.name || 'Not specified'}`;
  }

  prompt += `\n\nDOCUMENT CONTENT TO REVIEW:
${document.content}

REVIEW TYPE: ${reviewType}`;

  if (customInstructions) {
    prompt += `\n\nCUSTOM INSTRUCTIONS: ${customInstructions}`;
  }

  prompt += `\n\nCRITICAL: You must respond with ONLY valid JSON in the exact format below. Do not include any text before or after the JSON.

{
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
}

IMPORTANT RULES:
1. Return ONLY the JSON object, no other text
2. All scores must be numbers between 0-100
3. All feedback items must have: type, category, title, description, severity
4. Type must be one of: "positive", "negative", "suggestion", "warning", "improvement"
5. Category must be one of: "content_quality", "completeness", "relevance", "formatting", "clarity", "strength", "overall"
6. Severity must be one of: "low", "medium", "high"
7. Summary must have: strengths (array), weaknesses (array), recommendations (array), overallAssessment (string)`;

  return prompt;
}

/**
 * Parse AI response and validate structure
 */
function parseAIResponse(response: string): any {
  try {
    // Clean the response - remove any markdown formatting
    let cleanedResponse = response.trim();
    
    // Remove markdown code blocks if present
    cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Extract JSON from response (handle cases where AI adds extra text)
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', response);
      throw new Error('No valid JSON found in response');
    }
    
    const jsonString = jsonMatch[0];
    console.log('Extracted JSON string:', jsonString);
    
    const parsed = JSON.parse(jsonString);
    
    // Validate required fields
    if (!parsed.scores || !parsed.feedback || !parsed.summary) {
      console.error('Missing required fields:', { scores: !!parsed.scores, feedback: !!parsed.feedback, summary: !!parsed.summary });
      throw new Error('Missing required fields in AI response');
    }
    
    // Validate scores
    const requiredScores = ['overall', 'contentQuality', 'completeness', 'relevance', 'formatting', 'clarity', 'strength'];
    for (const score of requiredScores) {
      if (typeof parsed.scores[score] !== 'number' || parsed.scores[score] < 0 || parsed.scores[score] > 100) {
        console.error(`Invalid score for ${score}:`, parsed.scores[score]);
        throw new Error(`Invalid score for ${score}`);
      }
    }
    
    // Validate feedback structure
    if (!Array.isArray(parsed.feedback)) {
      console.error('Feedback is not an array:', typeof parsed.feedback);
      throw new Error('Feedback must be an array');
    }
    
    for (const item of parsed.feedback) {
      if (!item.type || !item.category || !item.title || !item.description || !item.severity) {
        console.error('Invalid feedback item:', item);
        throw new Error('Invalid feedback item structure');
      }
    }
    
    // Validate summary structure
    if (!Array.isArray(parsed.summary.strengths) || !Array.isArray(parsed.summary.weaknesses) || 
        !Array.isArray(parsed.summary.recommendations) || !parsed.summary.overallAssessment) {
      console.error('Invalid summary structure:', parsed.summary);
      throw new Error('Invalid summary structure');
    }
    
    return parsed;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    console.error('Raw response:', response);
    throw new Error('Failed to parse AI response');
  }
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
      return NextResponse.json(
        { error: 'Application not found or access denied' },
        { status: 404 }
      );
    }

    // Fetch requirement
    const requirement = await ApplicationRequirement.findOne({
      _id: validatedData.requirementId,
      applicationId: validatedData.applicationId
    }).lean();

    if (!requirement) {
      return NextResponse.json(
        { error: 'Requirement not found' },
        { status: 404 }
      );
    }

    // Fetch linked document if applicable
    let document = null;
    if (requirement.linkedDocumentId) {
      document = await Document.findOne({
        _id: requirement.linkedDocumentId,
        userId: session.user.id
      }).lean();

      if (!document) {
        return NextResponse.json(
          { error: 'Linked document not found or access denied' },
          { status: 404 }
        );
      }
      
      // Check if document has sufficient content for review
      if (!document.content || document.content.trim().length < 50) {
        return NextResponse.json(
          { error: 'Document content is too short for meaningful review. Please add more content to your document.' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'No document linked to this requirement for review' },
        { status: 400 }
      );
    }

    // Fetch scholarship/program context if available
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
      status: 'completed'
    }).sort({ createdAt: -1 });

    if (existingReview) {
      return NextResponse.json({
        message: 'Review already exists',
        reviewId: existingReview._id,
        review: existingReview
      });
    }

    // Create pending review record with default values
    const review = new AIReview({
      applicationId: validatedData.applicationId,
      requirementId: validatedData.requirementId,
      documentId: document._id,
      userId: session.user.id,
      reviewType: validatedData.reviewType,
      status: 'in_progress',
      aiModel: activeProvider.model,
      aiProvider: aiConfig.defaultProvider,
      // Initialize with default values to satisfy schema requirements
      scores: {
        overall: 0,
        contentQuality: 0,
        completeness: 0,
        relevance: 0,
        formatting: 0,
        clarity: 0,
        strength: 0
      },
      feedback: [],
      summary: {
        strengths: [],
        weaknesses: [],
        recommendations: [],
        overallAssessment: 'Review in progress...'
      }
    });

    await review.save();

    // Craft the review prompt
    const prompt = craftReviewPrompt(
      requirement,
      document,
      application,
      validatedData.reviewType,
      scholarship,
      program,
      validatedData.customInstructions
    );

    const startTime = Date.now();

    // Generate review using AI with retry mechanism
    let aiResponse = '';
    const maxRetries = aiConfig.retrySettings.maxRetries;
    let lastError: any = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempting AI generation (attempt ${attempt}/${maxRetries})`);
        aiResponse = await generateAIResponse(prompt);
        break; // Success, exit retry loop
        
      } catch (aiError: any) {
        lastError = aiError;
        console.error(`AI generation error (attempt ${attempt}/${maxRetries}):`, aiError);
        
        // Check if it's a retryable error
        if (isRetryableError(aiError) && attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          const waitTime = calculateBackoffDelay(attempt);
          console.log(`Service error detected, waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        // If it's not a retryable error or we've exhausted retries, break
        break;
      }
    }
    
    // If we still don't have a response after all retries
    if (!aiResponse) {
      console.error('Failed to generate AI response after all retries:', lastError);
      
      // Create a user-friendly error message based on the error type
      const errorMessage = createUserFriendlyErrorMessage(lastError);
      
      // Check if fallback is enabled
      if (!aiConfig.retrySettings.enableFallback) {
        review.status = 'failed';
        await review.save();
        return NextResponse.json(
          { error: errorMessage },
          { status: 503 }
        );
      }
      
      // Instead of failing completely, provide a basic fallback review
      console.log('Providing fallback review due to AI service unavailability');
      
      const fallbackResponse = createFallbackReview(document.title || 'Document');
      
      // Update review with fallback results
      review.status = 'completed';
      review.scores = fallbackResponse.scores;
      review.feedback = fallbackResponse.feedback;
      review.summary = fallbackResponse.summary;
      review.processingTime = Date.now() - startTime;
      review.reviewedAt = new Date();
      
      await review.save();
      
      return NextResponse.json(
        { 
          message: 'Fallback review provided due to AI service unavailability',
          review: review 
        },
        { status: 200 }
      );
    }

    const processingTime = Date.now() - startTime;

    if (!aiResponse) {
      review.status = 'failed';
      await review.save();
      return NextResponse.json(
        { error: 'Failed to generate review' },
        { status: 500 }
      );
    }

    // Parse and validate AI response
    let parsedResponse;
    try {
      parsedResponse = parseAIResponse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.log('Raw AI response:', aiResponse);
      
      // Create a fallback response with default values
      parsedResponse = {
        scores: {
          overall: 50,
          contentQuality: 50,
          completeness: 50,
          relevance: 50,
          formatting: 50,
          clarity: 50,
          strength: 50
        },
        feedback: [
          {
            type: 'warning',
            category: 'overall',
            title: 'AI Response Parsing Failed',
            description: 'The AI response could not be properly parsed. Please try regenerating the review.',
            severity: 'medium',
            suggestions: ['Try regenerating the review', 'Check if the document content is substantial enough'],
            examples: []
          }
        ],
        summary: {
          strengths: ['Document submitted for review'],
          weaknesses: ['AI response parsing failed'],
          recommendations: ['Try regenerating the review with different content'],
          overallAssessment: 'Unable to complete AI review due to parsing error. Please try again.'
        }
      };
    }

    // Validate that we have the required fields before updating the review
    if (!parsedResponse.scores || !parsedResponse.summary) {
      console.error('Parsed response missing required fields:', parsedResponse);
      review.status = 'failed';
      await review.save();
      return NextResponse.json(
        { error: 'Failed to generate valid review data' },
        { status: 500 }
      );
    }

    // Update review with results
    review.status = 'completed';
    review.scores = parsedResponse.scores;
    review.feedback = parsedResponse.feedback || [];
    review.summary = parsedResponse.summary;
    review.processingTime = processingTime;
    review.reviewedAt = new Date();

    await review.save();

    return NextResponse.json({
      message: 'Review completed successfully',
      reviewId: review._id,
      review: review
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error generating AI review:', error);
    
    // If we have a review object and fallback is enabled, provide fallback
    // This block is now redundant as fallback is handled within the retry loop
    // if (review && aiConfig.retrySettings.enableFallback) {
    //   console.log('Providing fallback review due to unexpected error');
      
    //   const fallbackResponse = createFallbackReview(document?.name || 'Document');
      
    //   review.status = 'completed';
    //   review.scores = fallbackResponse.scores;
    //   review.feedback = fallbackResponse.feedback;
    //   review.summary = fallbackResponse.summary;
    //   review.processingTime = Date.now() - startTime;
    //   review.reviewedAt = new Date();
      
    //   await review.save();
      
    //   return NextResponse.json(
    //     { 
    //       message: 'Fallback review provided due to unexpected error',
    //       review: review 
    //     },
    //     { status: 200 }
    //   );
    // }
    
    // If fallback is disabled or no review object, return error
    // This block is now redundant as fallback is handled within the retry loop
    // if (review) {
    //   review.status = 'failed';
    //   await review.save();
    // }
    
    return NextResponse.json(
      { error: 'Failed to generate review' },
      { status: 500 }
    );
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

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Build query
    const query: any = {
      applicationId,
      userId: session.user.id
    };

    if (requirementId) {
      query.requirementId = requirementId;
    }

    // Fetch reviews
    const reviews = await AIReview.find(query)
      .populate('requirement', 'name description category requirementType')
      .populate('document', 'title type')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      reviews
    });

  } catch (error) {
    console.error('Error fetching AI reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
} 