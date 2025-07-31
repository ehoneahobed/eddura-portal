import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Recipient from '@/models/Recipient';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

/**
 * POST /api/recommendations/generate-draft
 * Generate AI-powered recommendation letter draft
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Get user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { 
      recipientId, 
      purpose, 
      highlights, 
      relationship, 
      templateType = 'academic',
      customInstructions 
    } = body;

    // Validate required fields
    if (!recipientId || !purpose) {
      return NextResponse.json(
        { error: 'Missing required fields: recipientId, purpose' },
        { status: 400 }
      );
    }

    // Get recipient
    const recipient = await Recipient.findById(recipientId);
    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    // Prepare student information
    const studentInfo = {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      achievements: highlights || [],
      relationship: relationship || 'student',
      purpose: purpose,
    };

    // Generate draft using AI
    const draft = await generateRecommendationDraft(studentInfo, recipient, templateType, customInstructions);

    return NextResponse.json({ draft });
  } catch (error) {
    console.error('Error generating draft:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generate recommendation letter draft using AI
 */
async function generateRecommendationDraft(
  studentInfo: any,
  recipient: any,
  templateType: string,
  customInstructions?: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  // Create prompt based on template type
  let prompt = createPrompt(studentInfo, recipient, templateType, customInstructions);

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('AI generation error:', error);
    throw new Error('Failed to generate draft');
  }
}

/**
 * Create prompt for AI generation
 */
function createPrompt(
  studentInfo: any,
  recipient: any,
  templateType: string,
  customInstructions?: string
): string {
  const basePrompt = `You are a professional writing a recommendation letter. Write a formal, professional recommendation letter with the following details:

Student Information:
- Name: ${studentInfo.name}
- Email: ${studentInfo.email}
- Relationship: ${studentInfo.relationship}
- Purpose: ${studentInfo.purpose}
${studentInfo.achievements.length > 0 ? `- Key Achievements: ${studentInfo.achievements.join(', ')}` : ''}

Recipient Information:
- Name: ${recipient.name}
- Title: ${recipient.title}
- Institution: ${recipient.institution}
${recipient.department ? `- Department: ${recipient.department}` : ''}

Template Type: ${templateType}

Requirements:
1. Use formal, professional language
2. Keep the letter concise but comprehensive (300-500 words)
3. Focus on the student's strengths and achievements
4. Explain the relationship and context
5. End with a strong recommendation
6. Use the recipient's name and title appropriately
7. Format as a proper business letter

${customInstructions ? `Additional Instructions: ${customInstructions}` : ''}

Please write the recommendation letter:`;

  return basePrompt;
}

/**
 * GET /api/recommendations/generate-draft/templates
 * Get available draft templates
 */
export async function GET(request: NextRequest) {
  try {
    const templates = [
      {
        id: 'academic',
        name: 'Academic Recommendation',
        description: 'For academic programs, research positions, or educational opportunities',
        fields: ['purpose', 'highlights', 'relationship', 'academicPerformance']
      },
      {
        id: 'professional',
        name: 'Professional Recommendation',
        description: 'For job applications, internships, or professional development',
        fields: ['purpose', 'highlights', 'relationship', 'workExperience']
      },
      {
        id: 'scholarship',
        name: 'Scholarship Recommendation',
        description: 'For scholarship applications and financial aid',
        fields: ['purpose', 'highlights', 'relationship', 'financialNeed']
      },
      {
        id: 'research',
        name: 'Research Recommendation',
        description: 'For research positions, grants, or academic research opportunities',
        fields: ['purpose', 'highlights', 'relationship', 'researchInterests']
      },
      {
        id: 'leadership',
        name: 'Leadership Recommendation',
        description: 'For leadership positions, student government, or organizational roles',
        fields: ['purpose', 'highlights', 'relationship', 'leadershipExperience']
      }
    ];

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}