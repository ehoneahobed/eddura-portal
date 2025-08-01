import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { z } from 'zod';

// Validation schema for quiz submission
const quizSubmissionSchema = z.object({
  sectionId: z.string(),
  questionId: z.string(),
  responses: z.array(z.string()).optional(),
  textResponse: z.string().optional(),
  isCompleted: z.boolean().optional(),
  timeSpent: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    
    // Validate input
    const validationResult = quizSubmissionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { sectionId, questionId, responses, textResponse, isCompleted, timeSpent } = validationResult.data;

    // Get user from NextAuth session
    const session = await auth();
    const userId = session?.user?.id;

    // If user is authenticated, save to their profile
    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Initialize quizResponses if it doesn't exist
      if (!user.quizResponses) {
        user.quizResponses = {
          startedAt: new Date(),
          progress: 0,
        };
      }

      // Update the specific question response
      if (responses) {
        (user.quizResponses as any)[questionId] = responses;
      } else if (textResponse !== undefined) {
        (user.quizResponses as any)[questionId] = textResponse;
      }

      // Update progress and completion status
      if (isCompleted) {
        user.quizCompleted = true;
        user.quizCompletedAt = new Date();
        user.quizResponses!.completedAt = new Date();
      }

      if (timeSpent) {
        user.quizResponses!.timeSpent = (user.quizResponses!.timeSpent || 0) + timeSpent;
      }

      // Calculate progress (simplified - you might want to implement more sophisticated progress tracking)
      // For now, we'll just mark it as completed if isCompleted is true
      if (isCompleted) {
        user.quizResponses!.progress = 100;
      }

      await user.save();

      return NextResponse.json(
        { 
          message: 'Quiz response saved successfully',
          userId: user._id,
          quizCompleted: user.quizCompleted,
          progress: user.quizResponses!.progress
        },
        { status: 200 }
      );
    } else {
      // For anonymous users, we could store in a temporary storage
      // For now, we'll return a success response with a temporary ID
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return NextResponse.json(
        { 
          message: 'Quiz response saved temporarily',
          tempId,
          note: 'Please register to save your responses permanently'
        },
        { status: 200 }
      );
    }

  } catch (error) {
    console.error('Quiz submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve quiz responses
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get user from NextAuth session
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        quizResponses: user.quizResponses,
        quizCompleted: user.quizCompleted,
        progress: user.quizResponses?.progress || 0
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Quiz retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 