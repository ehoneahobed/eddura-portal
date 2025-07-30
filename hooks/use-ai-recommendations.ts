import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export interface AIAnalysis {
  careerInsights: {
    primaryCareerPaths: Array<{
      title: string;
      description: string;
      educationRequirements: string[];
      skillsNeeded: string[];
      growthPotential: string;
      salaryRange: string;
      workEnvironment: string;
    }>;
    alternativeCareerPaths: Array<{
      title: string;
      description: string;
      educationRequirements: string[];
      skillsNeeded: string[];
      growthPotential: string;
      salaryRange: string;
      workEnvironment: string;
    }>;
    skillGaps: Array<{
      skill: string;
      importance: string;
      howToDevelop: string;
    }>;
    personalityTraits: string[];
    workStyle: string[];
  };
  programRecommendations: {
    undergraduatePrograms: Array<{
      fieldOfStudy: string;
      programType: string;
      duration: string;
      whyRecommended: string;
      careerOutcomes: string[];
      prerequisites: string[];
      costRange: string;
    }>;
    postgraduatePrograms: Array<{
      fieldOfStudy: string;
      programType: string;
      duration: string;
      whyRecommended: string;
      careerOutcomes: string[];
      prerequisites: string[];
      costRange: string;
    }>;
    specializations: Array<{
      area: string;
      description: string;
      careerRelevance: string;
    }>;
  };
  scholarshipRecommendations: {
    scholarshipTypes: Array<{
      type: string;
      description: string;
      eligibilityCriteria: string[];
      applicationTips: string[];
    }>;
    targetFields: string[];
    applicationStrategy: {
      timeline: string;
      keyDocuments: string[];
      strengthsToHighlight: string[];
    };
  };
  actionPlan: {
    immediateSteps: Array<{
      action: string;
      timeline: string;
      priority: string;
      resources: string[];
    }>;
    shortTermGoals: string[];
    longTermGoals: string[];
  };
  summary: {
    keyStrengths: string[];
    areasForDevelopment: string[];
    overallAssessment: string;
    confidenceLevel: string;
  };
}

export interface MatchingProgram {
  id: string;
  name: string;
  fieldOfStudy: string;
  degreeType: string;
  duration: string;
  tuitionFees: any;
  school: {
    id: string;
    name: string;
    country: string;
    globalRanking: number;
  };
}

export interface MatchingScholarship {
  id: string;
  name: string;
  description: string;
  amount: any;
  eligibilityCriteria: string[];
  school?: {
    id: string;
    name: string;
    country: string;
  };
}

export interface AIRecommendationsResult {
  analysis: AIAnalysis;
  matchingPrograms: MatchingProgram[];
  matchingScholarships: MatchingScholarship[];
  updatedCareerPreferences: any;
}

export type AnalysisType = 'career_recommendations' | 'program_recommendations' | 'scholarship_recommendations' | 'comprehensive';

export function useAIRecommendations() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AIRecommendationsResult | null>(null);

  const generateAnalysis = useCallback(async (
    analysisType: AnalysisType = 'comprehensive',
    customInstructions?: string
  ) => {
    if (!session?.user?.id) {
      setError('Authentication required');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/quiz-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          analysisType,
          customInstructions
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate AI analysis');
      }

      const data = await response.json();
      setAnalysis(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate AI analysis';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setError(null);
  }, []);

  const retryAnalysis = useCallback(async (
    analysisType: AnalysisType = 'comprehensive',
    customInstructions?: string
  ) => {
    return generateAnalysis(analysisType, customInstructions);
  }, [generateAnalysis]);

  return {
    analysis,
    isLoading,
    error,
    generateAnalysis,
    clearAnalysis,
    retryAnalysis
  };
} 