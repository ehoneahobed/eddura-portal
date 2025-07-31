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
  purpose: z.enum(['scholarship', 'school', 'job', 'other']),
  targetProgram: z.string().max(200).optional(),
  targetScholarship: z.string().max(200).optional(),
  targetInstitution: z.string().max(200).optional(),
  wordLimit: z.string().optional(),
  characterLimit: z.string().optional(),
  additionalInfo: z.string().max(1000).optional(),
});

// Initialize AI providers
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Function to craft comprehensive prompts based on document type
function craftPrompt(
  documentType: DocumentType,
  context: string,
  purpose: string,
  targetProgram?: string,
  targetScholarship?: string,
  targetInstitution?: string,
  wordLimit?: string,
  characterLimit?: string,
  additionalInfo?: string
): string {
  const typeConfig = DOCUMENT_TYPE_CONFIG[documentType];
  
  let prompt = `You are an expert academic and professional writing assistant. Write a ${typeConfig.label.toLowerCase()} based on the following information. 

IMPORTANT: Write the document directly as if the student is writing it themselves. Do NOT add any prefixes like "I will help you write..." or "Here is your..." - start directly with the document content.

Document Type: ${typeConfig.label}
Purpose: ${purpose.charAt(0).toUpperCase() + purpose.slice(1)} Application
Guidelines: ${typeConfig.guidelines}`;

  // Handle length requirements
  let lengthRequirement = `Recommended Length: ${typeConfig.maxWords} words`;
  if (wordLimit) {
    lengthRequirement = `STRICT WORD LIMIT: ${wordLimit} words maximum`;
  } else if (characterLimit) {
    lengthRequirement = `STRICT CHARACTER LIMIT: ${characterLimit} characters maximum`;
  }
  prompt += `\n${lengthRequirement}`;

  prompt += `\n\nContext provided by the student: ${context}`;

  // Add purpose-specific information
  if (purpose === 'scholarship') {
    if (targetScholarship) {
      prompt += `\nScholarship: ${targetScholarship}`;
    }
    if (targetInstitution) {
      prompt += `\nInstitution: ${targetInstitution}`;
    }
  } else if (purpose === 'school') {
    if (targetInstitution) {
      prompt += `\nInstitution: ${targetInstitution}`;
    }
    if (targetProgram) {
      prompt += `\nProgram: ${targetProgram}`;
    }
  } else if (purpose === 'job') {
    if (targetInstitution) {
      prompt += `\nCompany/Organization: ${targetInstitution}`;
    }
    if (targetProgram) {
      prompt += `\nPosition/Role: ${targetProgram}`;
    }
  } else if (purpose === 'other') {
    if (targetInstitution) {
      prompt += `\nTarget Organization: ${targetInstitution}`;
    }
  }
  
  if (additionalInfo) {
    prompt += `\nAdditional Information: ${additionalInfo}`;
  }

  // Add purpose-specific instructions
  let purposeInstructions = '';
  if (purpose === 'scholarship') {
    purposeInstructions = 'Focus on academic achievements, financial need, and how this scholarship aligns with your goals.';
  } else if (purpose === 'school') {
    purposeInstructions = 'Focus on academic background, research interests, and how this program fits your career goals.';
  } else if (purpose === 'job') {
    purposeInstructions = 'Focus on relevant experience, skills, and how you can contribute to the organization.';
  } else {
    purposeInstructions = 'Focus on your unique story, motivations, and how your background relates to your goals.';
  }

  prompt += `\n\nPlease write a compelling, authentic, and well-structured ${typeConfig.label.toLowerCase()} that reflects the student's voice and experiences. ${purposeInstructions}`;

  // Add strict length enforcement
  if (wordLimit) {
    prompt += `\n\nCRITICAL: The document MUST NOT exceed ${wordLimit} words. Count your words carefully and ensure you stay within this limit.`;
  } else if (characterLimit) {
    prompt += `\n\nCRITICAL: The document MUST NOT exceed ${characterLimit} characters. Count your characters carefully and ensure you stay within this limit.`;
  }

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
    


    // Craft the prompt
    const prompt = craftPrompt(
      validatedData.documentType,
      validatedData.context,
      validatedData.purpose,
      validatedData.targetProgram,
      validatedData.targetScholarship,
      validatedData.targetInstitution,
      validatedData.wordLimit,
      validatedData.characterLimit,
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