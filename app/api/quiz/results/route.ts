import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
// Import models index to ensure proper registration order
import '@/models/index';
import User from '@/models/User';
import Program from '@/models/Program';
import School from '@/models/School';
import Scholarship from '@/models/Scholarship';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id)
      .select('quizResponses quizCompleted quizCompletedAt careerPreferences aiAnalysis')
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.quizCompleted) {
      return NextResponse.json(
        { error: 'Quiz not completed', quizCompleted: false },
        { status: 400 }
      );
    }

    // Get recommended programs based on career preferences
    let recommendedPrograms: any[] = [];
    if (user.careerPreferences?.recommendedFields?.length) {
      const fieldQueries = user.careerPreferences.recommendedFields.map((field: string) => ({
        $or: [
          { fieldOfStudy: { $regex: field, $options: 'i' } },
          { name: { $regex: field, $options: 'i' } }
        ]
      }));

      recommendedPrograms = await Program.find({
        $or: fieldQueries
      })
      .populate('schoolId', 'name country globalRanking')
      .limit(10)
      .lean();
    }

    // Get top schools for the user's location preference
    let recommendedSchools: any[] = [];
    if (user.careerPreferences?.locationPreference) {
      const locationQuery = user.careerPreferences.locationPreference.toLowerCase();
      recommendedSchools = await School.find({
        $or: [
          { country: { $regex: locationQuery, $options: 'i' } },
          { name: { $regex: locationQuery, $options: 'i' } }
        ]
      })
      .limit(5)
      .lean();
    }

    // Get relevant scholarships based on career preferences
    let recommendedScholarships: any[] = [];
    if (user.careerPreferences?.primaryInterests?.length) {
      const interestQueries = user.careerPreferences.primaryInterests.map((interest: string) => ({
        $or: [
          { name: { $regex: interest, $options: 'i' } },
          { description: { $regex: interest, $options: 'i' } },
          { eligibilityCriteria: { $regex: interest, $options: 'i' } }
        ]
      }));

      recommendedScholarships = await Scholarship.find({
        $or: interestQueries
      })
      .populate('schoolId', 'name country')
      .limit(8)
      .lean();
    }

    // Calculate quiz insights
    const insights = {
      personalityTraits: user.careerPreferences?.personalityTraits || [],
      workStyle: user.careerPreferences?.workStyle || [],
      academicStrengths: user.careerPreferences?.academicStrengths || [],
      skillGaps: user.careerPreferences?.skillGaps || [],
      primaryInterests: user.careerPreferences?.primaryInterests || [],
      careerGoals: user.careerPreferences?.careerGoals || []
    };

    // Calculate match score based on multiple factors
    let matchScore = 0;
    let scoreFactors = 0;
    
    if (user.careerPreferences?.recommendedFields?.length) {
      matchScore += user.careerPreferences.recommendedFields.length * 10;
      scoreFactors++;
    }
    
    if (user.careerPreferences?.primaryInterests?.length) {
      matchScore += user.careerPreferences.primaryInterests.length * 5;
      scoreFactors++;
    }
    
    if (user.careerPreferences?.academicStrengths?.length) {
      matchScore += user.careerPreferences.academicStrengths.length * 3;
      scoreFactors++;
    }
    
    if (user.careerPreferences?.workStyle?.length) {
      matchScore += user.careerPreferences.workStyle.length * 2;
      scoreFactors++;
    }

    // Normalize score to 0-100 range
    if (scoreFactors > 0) {
      matchScore = Math.min(95, Math.max(20, matchScore / scoreFactors));
    } else {
      matchScore = 50; // Default score if no preferences
    }

    const results = {
      quizCompleted: user.quizCompleted,
      quizCompletedAt: user.quizCompletedAt,
      matchScore: Math.round(matchScore),
      insights,
      careerPreferences: user.careerPreferences,
      aiAnalysis: user.aiAnalysis, // Include AI analysis if it exists
      recommendedPrograms: recommendedPrograms.map(program => ({
        id: program._id.toString(),
        name: program.name,
        fieldOfStudy: program.fieldOfStudy,
        degreeType: program.degreeType,
        duration: program.duration,
        tuitionFees: program.tuitionFees,
        school: {
          id: program.schoolId._id.toString(),
          name: program.schoolId.name,
          country: program.schoolId.country,
          globalRanking: program.schoolId.globalRanking
        }
      })),
      recommendedSchools: recommendedSchools.map(school => ({
        id: school._id.toString(),
        name: school.name,
        country: school.country,
        globalRanking: school.globalRanking,
        programCount: 0 // This would need to be calculated
      })),
      recommendedScholarships: recommendedScholarships.map(scholarship => ({
        id: scholarship._id.toString(),
        name: scholarship.name,
        description: scholarship.description,
        amount: scholarship.amount,
        eligibilityCriteria: scholarship.eligibilityCriteria,
        school: scholarship.schoolId ? {
          id: scholarship.schoolId._id.toString(),
          name: scholarship.schoolId.name,
          country: scholarship.schoolId.country
        } : null
      })),
      quizResponses: user.quizResponses
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}