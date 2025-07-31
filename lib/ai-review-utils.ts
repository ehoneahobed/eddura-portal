/**
 * AI Review Utility Functions
 * Functions for crafting prompts and parsing AI responses for document reviews
 */

/**
 * Craft AI review prompt based on requirement and document content
 */
export function craftReviewPrompt(
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
    },
    {
      "type": "suggestion",
      "category": "clarity",
      "title": "Improve Clarity",
      "description": "Some sentences could be clearer and more concise",
      "severity": "low",
      "suggestions": ["Use shorter sentences", "Avoid jargon"],
      "examples": ["Instead of 'utilize' use 'use'"]
    }
  ],
  "summary": {
    "strengths": ["Clear personal motivation", "Good structure"],
    "weaknesses": ["Could use more specific examples"],
    "recommendations": ["Add more concrete examples of programming experience"],
    "overallAssessment": "A solid personal statement with room for improvement in specificity"
  }
}`;

  return prompt;
}

/**
 * Parse AI response and validate structure
 */
export function parseAIResponse(response: string): any {
  try {
    // Clean the response - remove any markdown formatting
    let cleanedResponse = response.trim();
    
    // Remove markdown code blocks if present
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Try to find JSON in the response
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!parsed.scores || !parsed.feedback || !parsed.summary) {
      throw new Error('Missing required fields in AI response');
    }

    // Validate scores
    const requiredScores = ['overall', 'contentQuality', 'completeness', 'relevance', 'formatting', 'clarity', 'strength'];
    for (const score of requiredScores) {
      if (typeof parsed.scores[score] !== 'number' || parsed.scores[score] < 0 || parsed.scores[score] > 100) {
        throw new Error(`Invalid score for ${score}`);
      }
    }

    // Validate feedback
    if (!Array.isArray(parsed.feedback)) {
      throw new Error('Feedback must be an array');
    }

    for (let i = 0; i < parsed.feedback.length; i++) {
      const item = parsed.feedback[i];
      if (!item.type || !item.category || !item.title || !item.description || !item.severity) {
        throw new Error(`Invalid feedback item structure at index ${i}`);
      }
    }

    // Validate summary
    if (!parsed.summary.strengths || !parsed.summary.weaknesses || !parsed.summary.recommendations || !parsed.summary.overallAssessment) {
      throw new Error('Missing required summary fields');
    }

    return parsed;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to parse AI response');
  }
} 