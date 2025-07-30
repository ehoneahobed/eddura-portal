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
    const validatedData = RefineRequestSchema.parse(body);
    
    // Check if document type is coming soon (if provided)
    if (validatedData.documentType) {
      const typeConfig = DOCUMENT_TYPE_CONFIG[validatedData.documentType];
      if (typeConfig?.comingSoon) {
        return NextResponse.json(
          { error: 'This document type is not supported for AI refinement' },
          { status: 400 }
        );
      }
    }

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

    // Generate refined content using the active AI provider
    let refinedContent = '';
    
    if (aiConfig.defaultProvider === 'google') {
      const model = genAI.getGenerativeModel({ model: activeProvider.model });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      refinedContent = response.text();
    } else {
      // TODO: Add support for other providers (OpenAI, Anthropic)
      return NextResponse.json(
        { error: 'AI provider not yet implemented' },
        { status: 500 }
      );
    }

    if (!refinedContent) {
      return NextResponse.json(
        { error: 'Failed to refine content' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      content: refinedContent,
      wordCount: refinedContent.trim().split(/\s+/).filter(word => word.length > 0).length,
      characterCount: refinedContent.length,
      originalWordCount: validatedData.existingContent.trim().split(/\s+/).filter(word => word.length > 0).length,
      originalCharacterCount: validatedData.existingContent.length
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error refining AI content:', error);
    return NextResponse.json(
      { error: 'Failed to refine content' },
      { status: 500 }
    );
  }
}