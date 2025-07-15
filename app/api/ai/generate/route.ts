import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DocumentType, DOCUMENT_TYPE_CONFIG } from '@/types/documents';
import { aiConfig, getActiveProvider } from '@/lib/ai-config';
import { z } from 'zod';

// Validation schema for AI generation request
const GenerateRequestSchema = z.object({
  documentType: z.nativeEnum(DocumentType),
  context: z.string().min(10, 'Context must be at least 10 characters').max(2000, 'Context must be less than 2000 characters'),
  targetProgram: z.string().max(200).optional(),
  targetScholarship: z.string().max(200).optional(),
  targetInstitution: z.string().max(200).optional(),
  additionalInfo: z.string().max(1000).optional(),
});

// Initialize AI providers
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Function to craft comprehensive prompts based on document type
function craftPrompt(
  documentType: DocumentType,
  context: string,
  targetProgram?: string,
  targetScholarship?: string,
  targetInstitution?: string,
  additionalInfo?: string
): string {
  const typeConfig = DOCUMENT_TYPE_CONFIG[documentType];
  
  let prompt = `You are an expert academic and professional writing assistant. Write a ${typeConfig.label.toLowerCase()} based on the following information. 

IMPORTANT: Write the document directly as if the student is writing it themselves. Do NOT add any prefixes like "I will help you write..." or "Here is your..." - start directly with the document content.

Document Type: ${typeConfig.label}
Guidelines: ${typeConfig.guidelines}
Recommended Length: ${typeConfig.maxWords} words

Context provided by the student: ${context}`;

  if (targetProgram) {
    prompt += `\nTarget Program: ${targetProgram}`;
  }
  
  if (targetScholarship) {
    prompt += `\nTarget Scholarship: ${targetScholarship}`;
  }
  
  if (targetInstitution) {
    prompt += `\nTarget Institution: ${targetInstitution}`;
  }
  
  if (additionalInfo) {
    prompt += `\nAdditional Information: ${additionalInfo}`;
  }

  prompt += `\n\nPlease write a compelling, authentic, and well-structured ${typeConfig.label.toLowerCase()} that reflects the student's voice and experiences. Focus on their unique story, motivations, and how their background relates to their goals.`;

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
    const validatedData = GenerateRequestSchema.parse(body);
    
    // Check if document type is coming soon
    const typeConfig = DOCUMENT_TYPE_CONFIG[validatedData.documentType];
    if (typeConfig?.comingSoon) {
      return NextResponse.json(
        { error: 'This document type is not supported for AI generation' },
        { status: 400 }
      );
    }

    // Craft the prompt
    const prompt = craftPrompt(
      validatedData.documentType,
      validatedData.context,
      validatedData.targetProgram,
      validatedData.targetScholarship,
      validatedData.targetInstitution,
      validatedData.additionalInfo
    );

    // Generate content using the active AI provider
    let generatedContent = '';
    
    if (aiConfig.defaultProvider === 'google') {
      const model = genAI.getGenerativeModel({ model: activeProvider.model });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      generatedContent = response.text();
    } else {
      // TODO: Add support for other providers (OpenAI, Anthropic)
      return NextResponse.json(
        { error: 'AI provider not yet implemented' },
        { status: 500 }
      );
    }

    if (!generatedContent) {
      return NextResponse.json(
        { error: 'Failed to generate content' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      content: generatedContent,
      wordCount: generatedContent.trim().split(/\s+/).filter(word => word.length > 0).length,
      characterCount: generatedContent.length
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error generating AI content:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}