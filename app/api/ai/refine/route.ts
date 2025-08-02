import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DocumentType, DOCUMENT_TYPE_CONFIG } from '@/types/documents';
import { aiConfig, getActiveProvider } from '@/lib/ai-config';
import { z } from 'zod';

// Validation schema for AI refinement request
const RefineRequestSchema = z.object({
  existingContent: z.string().min(10, 'Content must be at least 10 characters').max(50000, 'Content must be less than 50000 characters'),
  documentType: z.nativeEnum(DocumentType).optional(),
  refinementType: z.enum(['improve_clarity', 'make_more_compelling', 'adjust_tone', 'summarize', 'expand', 'fix_grammar', 'custom']),
  customInstruction: z.string().max(1000).optional(),
  targetLength: z.string().optional(),
  specificFocus: z.string().max(200).optional(),
  tone: z.enum(['professional', 'conversational', 'academic', 'persuasive']).optional(),
  additionalContext: z.string().max(500).optional(),
});

// Initialize AI providers
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Type guard for error handling
function isError(error: unknown): error is Error {
  return error instanceof Error;
}

// Function to craft refinement prompts based on refinement type
function craftRefinementPrompt(
  existingContent: string,
  refinementType: string,
  documentType?: DocumentType,
  customInstruction?: string,
  targetLength?: string,
  specificFocus?: string,
  tone?: string,
  additionalContext?: string
): string {
  const typeConfig = documentType ? DOCUMENT_TYPE_CONFIG[documentType] : null;
  
  let prompt = `You are an expert content refinement assistant. You will improve the following content based on the user's specific requirements.

IMPORTANT: 
- Preserve the original voice and intent of the author
- Maintain the same structure and key information
- Only make the requested improvements
- Do NOT add any prefixes like "Here is your refined content..." - return only the refined content
- Keep the same document type and purpose`;

  // Add document type context if available
  if (typeConfig) {
    prompt += `\n\nDocument Type: ${typeConfig.label}`;
    if (typeConfig.guidelines) {
      prompt += `\nGuidelines: ${typeConfig.guidelines}`;
    }
  }

  prompt += `\n\nOriginal Content:\n${existingContent}`;

  // Add refinement-specific instructions
  switch (refinementType) {
    case 'improve_clarity':
      prompt += `\n\nPlease improve the clarity of this content by:
- Simplifying complex sentences
- Using more precise language
- Improving flow and readability
- Making the main points more obvious
- Removing any confusing or ambiguous phrases`;
      break;

    case 'make_more_compelling':
      prompt += `\n\nPlease make this content more compelling by:
- Strengthening the opening and closing
- Adding more vivid and specific details
- Using more powerful and engaging language
- Creating stronger emotional connections
- Making arguments more persuasive
- Adding concrete examples where appropriate`;
      break;

    case 'adjust_tone':
      if (tone) {
        const toneInstructions = {
          professional: 'Use formal, business-like language with proper structure and clear communication',
          conversational: 'Use friendly, approachable language that feels natural and engaging',
          academic: 'Use scholarly language with proper citations, formal structure, and analytical approach',
          persuasive: 'Use compelling, convincing language that builds strong arguments and emotional appeal'
        };
        prompt += `\n\nPlease adjust the tone to be ${tone} by: ${toneInstructions[tone as keyof typeof toneInstructions]}`;
      }
      break;

    case 'summarize':
      if (targetLength) {
        prompt += `\n\nPlease create a concise summary of approximately ${targetLength} words that:
- Preserves all key points and main ideas
- Maintains the original structure and flow
- Keeps the most important details and examples
- Uses clear, direct language`;
      } else {
        prompt += `\n\nPlease create a concise summary that:
- Reduces the length while preserving all key points
- Maintains the original structure and flow
- Keeps the most important details and examples
- Uses clear, direct language`;
      }
      break;

    case 'expand':
      if (targetLength) {
        prompt += `\n\nPlease expand this content to approximately ${targetLength} words by:
- Adding more detail and depth to existing points
- Including additional examples and evidence
- Expanding on key concepts and ideas
- Adding relevant context and background information
- Maintaining the original structure and flow`;
      } else {
        prompt += `\n\nPlease expand this content by:
- Adding more detail and depth to existing points
- Including additional examples and evidence
- Expanding on key concepts and ideas
- Adding relevant context and background information
- Maintaining the original structure and flow`;
      }
      break;

    case 'fix_grammar':
      prompt += `\n\nPlease fix grammar, spelling, and improve writing style by:
- Correcting all grammatical errors
- Fixing spelling mistakes
- Improving sentence structure and flow
- Enhancing clarity and readability
- Maintaining the original voice and tone
- Ensuring proper punctuation and formatting`;
      break;

    case 'custom':
      if (customInstruction) {
        prompt += `\n\nCustom Refinement Instructions: ${customInstruction}`;
      }
      break;
  }

  // Add specific focus if provided
  if (specificFocus && refinementType !== 'custom') {
    prompt += `\n\nSpecific Focus: ${specificFocus}`;
  }

  // Add additional context if provided
  if (additionalContext) {
    prompt += `\n\nAdditional Context: ${additionalContext}`;
  }

  // Add final instructions
  prompt += `\n\nPlease return the refined content that addresses the requested improvements while maintaining the original voice, structure, and intent.`;

  return prompt;
}

export async function POST(request: NextRequest) {
  console.log('=== AI REFINE API CALL START ===');
  
  try {
    console.log('1. Starting authentication check...');
    const session = await auth();
    console.log('2. Session result:', { 
      hasSession: !!session, 
      userId: session?.user?.id,
      userEmail: session?.user?.email 
    });
    
    if (!session?.user?.id) {
      console.log('3. Authentication failed - no user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('4. Authentication successful, checking AI provider...');
    // Check if AI service is configured
    const activeProvider = getActiveProvider();
    console.log('5. Active provider check:', { 
      hasProvider: !!activeProvider,
      providerName: activeProvider?.name,
      providerModel: activeProvider?.model,
      defaultProvider: aiConfig.defaultProvider
    });
    
    if (!activeProvider) {
      console.log('6. No active AI provider found');
      return NextResponse.json(
        { error: 'AI service not configured. Please set up an AI provider API key in your environment variables.' },
        { status: 400 }
      );
    }

    console.log('7. Parsing request body...');
    const body = await request.json();
    console.log('8. Request body received:', {
      hasExistingContent: !!body.existingContent,
      existingContentLength: body.existingContent?.length,
      refinementType: body.refinementType,
      documentType: body.documentType,
      hasCustomInstruction: !!body.customInstruction,
      customInstructionLength: body.customInstruction?.length,
      targetLength: body.targetLength,
      specificFocus: body.specificFocus,
      tone: body.tone,
      additionalContext: body.additionalContext
    });
    
    console.log('9. Validating input with schema...');
    // Validate input
    const validatedData = RefineRequestSchema.parse(body);
    console.log('10. Validation successful:', {
      refinementType: validatedData.refinementType,
      documentType: validatedData.documentType,
      contentLength: validatedData.existingContent.length
    });

    console.log('11. Crafting refinement prompt...');
    // Craft the refinement prompt
    const prompt = craftRefinementPrompt(
      validatedData.existingContent,
      validatedData.refinementType,
      validatedData.documentType,
      validatedData.customInstruction,
      validatedData.targetLength,
      validatedData.specificFocus,
      validatedData.tone,
      validatedData.additionalContext
    );
    console.log('12. Prompt crafted, length:', prompt.length);

    console.log('13. Generating refined content...');
    // Generate refined content using the active AI provider
    let refinedContent = '';
    
    if (aiConfig.defaultProvider === 'google') {
      console.log('14. Using Google AI provider...');
      try {
        console.log('15. Creating generative model...');
        const model = genAI.getGenerativeModel({ model: activeProvider.model });
        console.log('16. Generating content...');
        const result = await model.generateContent(prompt);
        console.log('17. Getting response...');
        const response = await result.response;
        refinedContent = response.text();
        console.log('18. Content generated successfully, length:', refinedContent.length);
              } catch (aiError) {
          console.error('19. AI API error:', aiError);
          console.error('20. AI Error details:', {
            name: isError(aiError) ? aiError.name : 'Unknown',
            message: isError(aiError) ? aiError.message : String(aiError),
            stack: isError(aiError) ? aiError.stack : undefined
          });
          return NextResponse.json(
            { 
              error: 'AI service error. Please check your API key and try again.', 
              details: isError(aiError) ? aiError.message : String(aiError)
            },
            { status: 500 }
          );
        }
    } else {
      console.log('14. Unsupported AI provider:', aiConfig.defaultProvider);
      // TODO: Add support for other providers (OpenAI, Anthropic)
      return NextResponse.json(
        { error: 'AI provider not yet implemented' },
        { status: 500 }
      );
    }

    if (!refinedContent) {
      console.log('21. No refined content generated');
      return NextResponse.json(
        { error: 'Failed to refine content - no content returned from AI' },
        { status: 500 }
      );
    }

    console.log('22. Preparing response...');
    const response = {
      content: refinedContent,
      wordCount: refinedContent.trim().split(/\s+/).filter(word => word.length > 0).length,
      characterCount: refinedContent.length,
      originalWordCount: validatedData.existingContent.trim().split(/\s+/).filter(word => word.length > 0).length,
      originalCharacterCount: validatedData.existingContent.length
    };
    console.log('23. Response prepared:', {
      wordCount: response.wordCount,
      characterCount: response.characterCount,
      originalWordCount: response.originalWordCount,
      originalCharacterCount: response.originalCharacterCount
    });

    console.log('=== AI REFINE API CALL SUCCESS ===');
    return NextResponse.json(response);

  } catch (error) {
    console.error('=== AI REFINE API CALL ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error constructor:', isError(error) ? error.constructor.name : 'Unknown');
    console.error('Error message:', isError(error) ? error.message : String(error));
    console.error('Error stack:', isError(error) ? error.stack : undefined);
    
    if (error instanceof z.ZodError) {
      console.error('Zod validation error details:', {
        errors: error.errors
      });
      return NextResponse.json(
        { 
          error: 'Invalid request data', 
          details: error.errors,
          message: 'Please check your input data and try again'
        },
        { status: 400 }
      );
    }
    
    console.error('Unexpected error in AI refine:', error);
    return NextResponse.json(
      { 
        error: 'Failed to refine content',
        message: isError(error) ? error.message : 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}