import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Program from '@/models/Program';
import Scholarship from '@/models/Scholarship';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { aiConfig } from '@/lib/ai-config';
import { z } from 'zod';

const QuizAnalysisRequestSchema = z.object({
  userId: z.string(),
  analysisType: z.enum(['comprehensive', 'career-focused', 'program-focused']).default('comprehensive'),
  customInstructions: z.string().optional(),
  forceRegenerate: z.boolean().optional().default(false)
});

// Initialize AI provider
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

/**
 * Generate AI response using Google Generative AI with retry logic
 */
async function generateAIResponse(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ 
    model: aiConfig.providers.google.model,
    generationConfig: {
      temperature: 0.3,
      topK: 40,
      topP: 0.8,
      maxOutputTokens: 6000,
    }
  });
  
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error(`AI generation attempt ${attempt} failed:`, error);
      
      // Check if it's a retryable error (503, 429, etc.)
      const isRetryable = error.status === 503 || 
                         error.status === 429 || 
                         error.status === 500 ||
                         error.message?.includes('overloaded') ||
                         error.message?.includes('rate limit') ||
                         error.message?.includes('service unavailable');
      
      if (attempt === maxRetries || !isRetryable) {
        // If it's the last attempt or not retryable, throw the error
        throw new Error(`AI service error after ${attempt} attempts: ${error.message || 'Unknown error'}`);
      }
      
      // Wait before retrying with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Retrying AI generation in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('AI generation failed after all retry attempts');
}

/**
 * Craft a detailed prompt for AI analysis based on quiz responses
 */
function craftAnalysisPrompt(quizResponses: any, analysisType: string, customInstructions?: string): string {
  const basePrompt = `You are an expert career counselor and educational advisor with deep knowledge of academic programs, career paths, and scholarship opportunities. Your task is to analyze a student's quiz responses and provide comprehensive recommendations.

IMPORTANT GUIDELINES:
1. Focus on practical, actionable advice
2. Consider the student's education level and program interests
3. Provide specific program recommendations with clear reasoning
4. Include scholarship opportunities that match their profile
5. Create a structured action plan with timelines
6. Be encouraging but realistic about challenges and opportunities
7. Consider global opportunities and diverse career paths
8. Provide specific skill development recommendations
9. Suggest a MINIMUM of 5 and MAXIMUM of 10 career paths to provide variety and choice
10. Ensure career suggestions are diverse and aligned with the student's quiz responses

STUDENT QUIZ RESPONSES: ${JSON.stringify(quizResponses, null, 2)}

ANALYSIS TYPE: ${analysisType}
${customInstructions ? `CUSTOM INSTRUCTIONS: ${customInstructions}` : ''}

CAREER PATH REQUIREMENTS:
- Provide a MINIMUM of 5 and MAXIMUM of 10 total career paths
- Split between primaryCareerPaths (3-5) and alternativeCareerPaths (2-5)
- Ensure variety and diversity in career suggestions
- All career paths should be directly relevant to the student's quiz responses

Please provide your analysis in the following JSON format:
{
  "careerInsights": {
    "primaryCareerPaths": [
      {
        "title": "Career title",
        "description": "Detailed description",
        "educationRequirements": ["requirement1", "requirement2"],
        "skillsNeeded": ["skill1", "skill2"],
        "growthPotential": "High/Medium/Low",
        "salaryRange": "Salary range",
        "workEnvironment": "Work environment description"
      }
    ],
    "alternativeCareerPaths": [
      {
        "title": "Alternative career title",
        "description": "Detailed description",
        "educationRequirements": ["requirement1", "requirement2"],
        "skillsNeeded": ["skill1", "skill2"],
        "growthPotential": "High/Medium/Low",
        "salaryRange": "Salary range",
        "workEnvironment": "Work environment description"
      }
    ],
    // NOTE: Provide 5-10 total career paths between primaryCareerPaths and alternativeCareerPaths
    // Aim for variety and ensure they align with the student's quiz responses
    "skillGaps": [
      {
        "skill": "Skill name",
        "importance": "High/Medium/Low",
        "howToDevelop": "How to develop this skill"
      }
    ],
    "personalityTraits": ["trait1", "trait2"],
    "workStyle": ["style1", "style2"]
  },
  "programRecommendations": {
    "undergraduatePrograms": [
      {
        "fieldOfStudy": "Field name",
        "programType": "Program type",
        "duration": "Duration",
        "whyRecommended": "Why this program is recommended",
        "careerOutcomes": ["outcome1", "outcome2"],
        "prerequisites": ["prerequisite1", "prerequisite2"],
        "costRange": "Cost range"
      }
    ],
    "postgraduatePrograms": [
      {
        "fieldOfStudy": "Field name",
        "programType": "Program type",
        "duration": "Duration",
        "whyRecommended": "Why this program is recommended",
        "careerOutcomes": ["outcome1", "outcome2"],
        "prerequisites": ["prerequisite1", "prerequisite2"],
        "costRange": "Cost range"
      }
    ],
    "specializations": [
      {
        "area": "Specialization area",
        "description": "Description",
        "careerRelevance": "Career relevance"
      }
    ]
  },
  "scholarshipRecommendations": {
    "scholarshipTypes": [
      {
        "type": "Scholarship type",
        "description": "Description",
        "eligibilityCriteria": ["criteria1", "criteria2"],
        "applicationTips": ["tip1", "tip2"]
      }
    ],
    "targetFields": ["field1", "field2"],
    "applicationStrategy": {
      "timeline": "Application timeline",
      "keyDocuments": ["document1", "document2"],
      "strengthsToHighlight": ["strength1", "strength2"]
    }
  },
  "actionPlan": {
    "immediateSteps": [
      {
        "action": "Action description",
        "timeline": "Timeline",
        "priority": "High/Medium/Low",
        "resources": ["resource1", "resource2"]
      }
    ],
    "shortTermGoals": ["goal1", "goal2"],
    "longTermGoals": ["goal1", "goal2"]
  },
  "summary": {
    "keyStrengths": ["strength1", "strength2"],
    "areasForDevelopment": ["area1", "area2"],
    "overallAssessment": "Overall assessment",
    "confidenceLevel": "High/Medium/Low"
  }
}`;

  return basePrompt;
}

/**
 * Parse AI response and validate structure
 */
function parseAIResponse(aiResponse: string): any {
  try {
    // Extract JSON from the response (in case AI includes extra text)
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate required structure
    if (!parsed.careerInsights || !parsed.programRecommendations || !parsed.actionPlan) {
      throw new Error('AI response missing required sections');
    }
    
    return parsed;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    throw new Error('Failed to parse AI response');
  }
}

/**
 * Get relevant programs from database based on AI recommendations
 */
async function getMatchingPrograms(recommendations: any, programInterest?: string[]): Promise<any[]> {
  const programFields = [
    ...(recommendations?.undergraduatePrograms || []).map((p: any) => p.fieldOfStudy),
    ...(recommendations?.postgraduatePrograms || []).map((p: any) => p.fieldOfStudy),
    ...(recommendations?.specializations || []).map((s: any) => s.area)
  ].filter(Boolean);

  if (programFields.length === 0) return [];

  const fieldQueries = programFields.map((field: string) => ({
    $or: [
      { fieldOfStudy: { $regex: field, $options: 'i' } },
      { name: { $regex: field, $options: 'i' } },
      { programOverview: { $regex: field, $options: 'i' } }
    ]
  }));

  const programs = await Program.find({
    $or: fieldQueries
  })
  .populate('schoolId', 'name country globalRanking')
  .limit(15)
  .lean();

  // Filter programs based on user's program interest if provided
  if (programInterest && programInterest.length > 0) {
    return programs.filter(program =>
      programInterest.some(interest =>
        program.fieldOfStudy.toLowerCase().includes(interest.toLowerCase()) ||
        program.name.toLowerCase().includes(interest.toLowerCase()) ||
        (program.programOverview && program.programOverview.toLowerCase().includes(interest.toLowerCase()))
      )
    );
  }

  return programs;
}

/**
 * Get relevant scholarships from database based on AI recommendations
 */
async function getMatchingScholarships(recommendations: any): Promise<any[]> {
  const scholarshipTypes = recommendations?.scholarshipTypes || [];
  const targetFields = recommendations?.targetFields || [];

  const queries: any[] = [];
  
  // Add queries based on scholarship types
  scholarshipTypes.forEach((type: any) => {
    if (type.type) {
      queries.push({
        $or: [
          { name: { $regex: type.type, $options: 'i' } },
          { description: { $regex: type.type, $options: 'i' } },
          { eligibilityCriteria: { $regex: type.type, $options: 'i' } }
        ]
      });
    }
  });

  // Add queries based on target fields
  targetFields.forEach((field: string) => {
    queries.push({
      $or: [
        { name: { $regex: field, $options: 'i' } },
        { description: { $regex: field, $options: 'i' } },
        { eligibilityCriteria: { $regex: field, $options: 'i' } }
      ]
    });
  });

  if (queries.length === 0) return [];

  return await Scholarship.find({
    $or: queries
  })
  .populate('schoolId', 'name country')
  .limit(10)
  .lean();
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, analysisType, customInstructions, forceRegenerate } = QuizAnalysisRequestSchema.parse(body);

    // Verify user owns this data
    if (session.user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get user with quiz responses
    const user = await User.findById(userId).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.quizCompleted) {
      return NextResponse.json({ error: 'Quiz not completed' }, { status: 400 });
    }

    // Check if AI analysis already exists and return it if not forcing regeneration
    if (user.aiAnalysis && !forceRegenerate) {
      const matchingPrograms = await getMatchingPrograms(user.aiAnalysis.programRecommendations, user.quizResponses?.programInterest);
      const matchingScholarships = await getMatchingScholarships(user.aiAnalysis.scholarshipRecommendations);

      return NextResponse.json({
        analysis: user.aiAnalysis,
        matchingPrograms,
        matchingScholarships,
        updatedCareerPreferences: user.careerPreferences,
        cached: true
      });
    }

    // Generate new AI analysis
    const aiResponse = await generateAIResponse(craftAnalysisPrompt(user.quizResponses, analysisType, customInstructions));
    const analysis = parseAIResponse(aiResponse);

    // Get matching programs and scholarships
    const matchingPrograms = await getMatchingPrograms(analysis.programRecommendations, user.quizResponses?.programInterest);
    const matchingScholarships = await getMatchingScholarships(analysis.scholarshipRecommendations);

    // Update user with AI analysis
    await User.findByIdAndUpdate(userId, {
      aiAnalysis: {
        ...analysis,
        generatedAt: new Date(),
        analysisType
      }
    });

    return NextResponse.json({
      analysis: {
        ...analysis,
        generatedAt: new Date(),
        analysisType
      },
      matchingPrograms,
      matchingScholarships,
      updatedCareerPreferences: user.careerPreferences,
      cached: false
    });

  } catch (error: any) {
    console.error('Error in quiz analysis:', error);
    
    // Provide more specific error messages based on the error type
    let errorMessage = 'Failed to generate analysis';
    let statusCode = 500;
    
    if (error.message?.includes('AI service error')) {
      errorMessage = 'AI service is temporarily unavailable. Please try again in a few minutes.';
      statusCode = 503;
    } else if (error.message?.includes('overloaded')) {
      errorMessage = 'AI service is currently overloaded. Please try again later.';
      statusCode = 503;
    } else if (error.message?.includes('rate limit')) {
      errorMessage = 'AI service rate limit exceeded. Please try again in a few minutes.';
      statusCode = 429;
    } else if (error.message?.includes('Unauthorized')) {
      errorMessage = 'Authentication required. Please log in again.';
      statusCode = 401;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: statusCode }
    );
  }
} 