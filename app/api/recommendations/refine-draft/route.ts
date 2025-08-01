import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

/**
 * POST /api/recommendations/refine-draft
 * Refine an existing recommendation letter draft with additional feedback
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      currentDraft, 
      feedback, 
      additionalContext,
      recipientInfo,
      studentInfo,
      templateType = 'academic'
    } = body;

    // Validate required fields
    if (!currentDraft || !feedback) {
      return NextResponse.json(
        { error: 'Missing required fields: currentDraft, feedback' },
        { status: 400 }
      );
    }

    // Generate refined draft using AI
    const refinedDraft = await refineRecommendationDraft(
      currentDraft, 
      feedback, 
      additionalContext,
      recipientInfo,
      studentInfo,
      templateType
    );

    return NextResponse.json({ draft: refinedDraft });
  } catch (error) {
    console.error('Error refining draft:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Refine recommendation letter draft using AI
 */
async function refineRecommendationDraft(
  currentDraft: string,
  feedback: string,
  additionalContext?: string,
  recipientInfo?: any,
  studentInfo?: any,
  templateType?: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  // Create refinement prompt
  const prompt = createRefinementPrompt(
    currentDraft, 
    feedback, 
    additionalContext,
    recipientInfo,
    studentInfo,
    templateType
  );

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('AI refinement error:', error);
    throw new Error('Failed to refine draft');
  }
}

/**
 * Create prompt for AI refinement
 */
function createRefinementPrompt(
  currentDraft: string,
  feedback: string,
  additionalContext?: string,
  recipientInfo?: any,
  studentInfo?: any,
  templateType?: string
): string {
  const basePrompt = `You are refining a recommendation letter draft. Here is the current draft:

${currentDraft}

Feedback for improvement:
${feedback}

${additionalContext ? `Additional context to incorporate: ${additionalContext}` : ''}

${recipientInfo ? `
Recipient Information:
- Name: ${recipientInfo.name}
- Title: ${recipientInfo.title}
- Institution: ${recipientInfo.institution}
${recipientInfo.department ? `- Department: ${recipientInfo.department}` : ''}` : ''}

${studentInfo ? `
Student Information:
- Name: ${studentInfo.name}
- Email: ${studentInfo.email}
- Relationship: ${studentInfo.relationship}
- Purpose: ${studentInfo.purpose}
${studentInfo.achievements ? `- Key Achievements: ${studentInfo.achievements}` : ''}` : ''}

${templateType ? `Template Type: ${templateType}` : ''}

Instructions:
1. Keep the professional tone and formal language
2. Address the specific feedback provided
3. Maintain the same length (300-500 words)
4. Preserve any strong points from the original draft
5. Incorporate the additional context if provided
6. Ensure the letter flows naturally and is well-structured
7. End with a strong recommendation

Please provide the refined recommendation letter:`;

  return basePrompt;
}