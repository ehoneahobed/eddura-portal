'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Target, 
  Sparkles, 
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  Rocket,
  CheckCircle,
  TrendingUp,
  Lightbulb,
  Info,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QUIZ_SECTIONS, getQuestionById } from '@/lib/quiz-config';

interface QuizResults {
  quizCompleted: boolean;
  quizCompletedAt: string;
  matchScore: number;
  quizResponses: any;
}

interface AIAnalysis {
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

interface AIQuizResults extends QuizResults {
  aiAnalysis?: AIAnalysis;
  matchingPrograms?: Array<{
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
  }>;
  matchingScholarships?: Array<{
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
  }>;
}

export default function QuizResults() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [results, setResults] = useState<AIQuizResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user?.id) {
      router.push('/auth/signin?callbackUrl=/quiz/results');
      return;
    }

    fetchQuizResults();
  }, [session, status, router]);

  const fetchQuizResults = async () => {
    try {
      const response = await fetch('/api/quiz/results');
      if (!response.ok) {
        if (response.status === 400) {
          const data = await response.json();
          if (data.quizCompleted === false) {
            setError('Please complete the quiz first to view your results.');
            setIsLoading(false);
            return;
          }
        }
        throw new Error('Failed to fetch quiz results');
      }
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error fetching quiz results:', error);
      setError('Failed to load quiz results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIAnalysis = async () => {
    if (!session?.user?.id) return;

    setIsGeneratingAI(true);
    try {
      const response = await fetch('/api/ai/quiz-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          analysisType: 'comprehensive'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate AI analysis');
      }

      const aiData = await response.json();
      
      // Update results with AI analysis
      setResults(prev => prev ? {
        ...prev,
        aiAnalysis: aiData.analysis,
        matchingPrograms: aiData.matchingPrograms,
        matchingScholarships: aiData.matchingScholarships,
        careerPreferences: aiData.updatedCareerPreferences
      } : null);

    } catch (error: any) {
      console.error('Error generating AI analysis:', error);
      
      // Extract error message from the response
      let errorMessage = 'Failed to generate AI analysis. Please try again.';
      
      if (error.message) {
        if (error.message.includes('temporarily unavailable') || error.message.includes('overloaded')) {
          errorMessage = 'AI service is temporarily unavailable. Please try again in a few minutes.';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'AI service rate limit exceeded. Please try again in a few minutes.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const regenerateAIAnalysis = async () => {
    if (!session?.user?.id) return;

    setIsGeneratingAI(true);
    try {
      const response = await fetch('/api/ai/quiz-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          analysisType: 'comprehensive',
          forceRegenerate: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to regenerate AI analysis');
      }

      const aiData = await response.json();
      
      // Update results with AI analysis
      setResults(prev => prev ? {
        ...prev,
        aiAnalysis: aiData.analysis,
        matchingPrograms: aiData.matchingPrograms,
        matchingScholarships: aiData.matchingScholarships,
        careerPreferences: aiData.updatedCareerPreferences
      } : null);

    } catch (error: any) {
      console.error('Error regenerating AI analysis:', error);
      
      // Extract error message from the response
      let errorMessage = 'Failed to regenerate AI analysis. Please try again.';
      
      if (error.message) {
        if (error.message.includes('temporarily unavailable') || error.message.includes('overloaded')) {
          errorMessage = 'AI service is temporarily unavailable. Please try again in a few minutes.';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'AI service rate limit exceeded. Please try again in a few minutes.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const isPostgraduate = () => {
    return results?.quizResponses?.education_level === 'postgraduate';
  };

  const getRelevantPrograms = () => {
    if (!results?.aiAnalysis) return [];
    return isPostgraduate() 
      ? results.aiAnalysis.programRecommendations.postgraduatePrograms
      : results.aiAnalysis.programRecommendations.undergraduatePrograms;
  };

  const handleRetakeQuiz = () => {
    router.push('/quiz');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const getConfidenceColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to get question title from question ID
  const getQuestionTitle = (questionId: string): string => {
    for (const section of QUIZ_SECTIONS) {
      const question = section.questions.find(q => q.id === questionId);
      if (question) {
        return question.title;
      }
    }
    // Fallback: format the question ID if title not found
    return questionId.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No results found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Career Discovery Results
              </h1>
              <p className="text-lg text-gray-600">
                Personalized insights and recommendations based on your quiz responses
              </p>
            </motion.div>
          </div>

          {/* Main Content Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="ai-analysis" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="ai-analysis" className="flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Analysis
                    </TabsTrigger>
                    <TabsTrigger value="quiz-responses" className="flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Quiz Responses
                    </TabsTrigger>
                  </TabsList>

                  {/* AI Analysis Tab */}
                  <TabsContent value="ai-analysis" className="space-y-6">
                    {!results.aiAnalysis ? (
                      <div className="text-center py-12">
                        <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <Sparkles className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Generate AI Analysis
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          Get personalized career insights, program recommendations, and scholarship opportunities based on your quiz responses.
                        </p>
                        <Button 
                          onClick={generateAIAnalysis} 
                          disabled={isGeneratingAI}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          {isGeneratingAI ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Generating Analysis...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Generate AI Analysis
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* AI Analysis Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-2">
                              <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">AI Analysis</h3>
                              <p className="text-sm text-gray-600">Personalized insights and recommendations</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge className={getConfidenceColor(results.aiAnalysis.summary.confidenceLevel)}>
                              {results.aiAnalysis.summary.confidenceLevel} Confidence
                            </Badge>
                            <Button 
                              onClick={regenerateAIAnalysis} 
                              variant="outline" 
                              size="sm"
                              disabled={isGeneratingAI}
                            >
                              {isGeneratingAI ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-2"></div>
                                  Regenerating...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3 h-3 mr-2" />
                                  Regenerate
                                </>
                              )}
                            </Button>
                          </div>
                        </div>

                        <Tabs defaultValue="career" className="w-full">
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="career" className="flex items-center">
                              <Briefcase className="w-4 h-4 mr-2" />
                              Career Paths
                            </TabsTrigger>
                            <TabsTrigger value="programs" className="flex items-center">
                              <GraduationCap className="w-4 h-4 mr-2" />
                              Programs
                            </TabsTrigger>
                            <TabsTrigger value="scholarships" className="flex items-center">
                              <Award className="w-4 h-4 mr-2" />
                              Scholarships
                            </TabsTrigger>
                            <TabsTrigger value="action" className="flex items-center">
                              <Rocket className="w-4 h-4 mr-2" />
                              Action Plan
                            </TabsTrigger>
                          </TabsList>

                          {/* Career Paths Tab */}
                          <TabsContent value="career" className="space-y-6">
                            <div className="grid gap-6">
                              {/* Primary Career Paths */}
                              <div>
                                <h3 className="text-xl font-semibold mb-4 flex items-center">
                                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                                  Primary Career Paths
                                </h3>
                                <div className="grid gap-4">
                                  {results.aiAnalysis.careerInsights.primaryCareerPaths.map((career, index) => (
                                    <Card key={index} className="border-l-4 border-l-blue-500">
                                      <CardHeader>
                                        <div className="flex items-start justify-between">
                                          <div>
                                            <CardTitle className="text-lg">{career.title}</CardTitle>
                                            <CardDescription className="mt-2">{career.description}</CardDescription>
                                          </div>
                                          <Badge variant="outline" className="ml-2">
                                            {career.growthPotential} Growth
                                          </Badge>
                                        </div>
                                      </CardHeader>
                                      <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div>
                                            <h4 className="font-semibold text-sm text-gray-700 mb-2">Education Requirements</h4>
                                            <div className="space-y-1">
                                              {career.educationRequirements.map((req, idx) => (
                                                <div key={idx} className="flex items-center text-sm">
                                                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                                  {req}
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                          <div>
                                            <h4 className="font-semibold text-sm text-gray-700 mb-2">Key Skills</h4>
                                            <div className="flex flex-wrap gap-1">
                                              {career.skillsNeeded.map((skill, idx) => (
                                                <Badge key={idx} variant="secondary" className="text-xs">
                                                  {skill}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                          <div>
                                            <span className="font-semibold">Salary Range:</span> {career.salaryRange}
                                          </div>
                                          <div>
                                            <span className="font-semibold">Work Environment:</span> {career.workEnvironment}
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </div>

                              {/* Alternative Career Paths */}
                              {results.aiAnalysis.careerInsights.alternativeCareerPaths.length > 0 && (
                                <div>
                                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                                    <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
                                    Alternative Career Paths
                                  </h3>
                                  <div className="grid gap-4">
                                    {results.aiAnalysis.careerInsights.alternativeCareerPaths.map((career, index) => (
                                      <Card key={index} className="border-l-4 border-l-purple-500">
                                        <CardHeader>
                                          <div className="flex items-start justify-between">
                                            <div>
                                              <CardTitle className="text-lg">{career.title}</CardTitle>
                                              <CardDescription className="mt-2">{career.description}</CardDescription>
                                            </div>
                                            <Badge variant="outline" className="ml-2">
                                              {career.growthPotential} Growth
                                            </Badge>
                                          </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                              <h4 className="font-semibold text-sm text-gray-700 mb-2">Education Requirements</h4>
                                              <div className="space-y-1">
                                                {career.educationRequirements.map((req, idx) => (
                                                  <div key={idx} className="flex items-center text-sm">
                                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                                    {req}
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                            <div>
                                              <h4 className="font-semibold text-sm text-gray-700 mb-2">Key Skills</h4>
                                              <div className="flex flex-wrap gap-1">
                                                {career.skillsNeeded.map((skill, idx) => (
                                                  <Badge key={idx} variant="secondary" className="text-xs">
                                                    {skill}
                                                  </Badge>
                                                ))}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                              <span className="font-semibold">Salary Range:</span> {career.salaryRange}
                                            </div>
                                            <div>
                                              <span className="font-semibold">Work Environment:</span> {career.workEnvironment}
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Skill Gaps */}
                              {results.aiAnalysis.careerInsights.skillGaps.length > 0 && (
                                <div>
                                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                                    Skills to Develop
                                  </h3>
                                  <div className="grid gap-4">
                                    {results.aiAnalysis.careerInsights.skillGaps.map((gap, index) => (
                                      <Card key={index} className="border-l-4 border-l-orange-500">
                                        <CardHeader>
                                          <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{gap.skill}</CardTitle>
                                            <Badge className={getPriorityColor(gap.importance)}>
                                              {gap.importance} Priority
                                            </Badge>
                                          </div>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="space-y-2">
                                            <p className="text-sm text-gray-600">{gap.howToDevelop}</p>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TabsContent>

                          {/* Programs Tab */}
                          <TabsContent value="programs" className="space-y-6">
                            <div className="grid gap-6">
                              {/* Relevant Programs Based on Education Level */}
                              {getRelevantPrograms().length > 0 && (
                                <div>
                                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                                    <GraduationCap className="w-5 h-5 mr-2 text-green-600" />
                                    {isPostgraduate() ? 'Postgraduate' : 'Undergraduate'} Programs
                                  </h3>
                                  <div className="grid gap-4">
                                    {getRelevantPrograms().map((program, index) => (
                                      <Card key={index} className="border-l-4 border-l-green-500">
                                        <CardHeader>
                                          <div className="flex items-start justify-between">
                                            <div>
                                              <CardTitle className="text-lg">{program.fieldOfStudy}</CardTitle>
                                              <CardDescription className="mt-2">{program.whyRecommended}</CardDescription>
                                            </div>
                                            <Badge variant="outline">{program.programType}</Badge>
                                          </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                              <h4 className="font-semibold text-sm text-gray-700 mb-2">Career Outcomes</h4>
                                              <div className="space-y-1">
                                                {program.careerOutcomes.map((outcome, idx) => (
                                                  <div key={idx} className="flex items-center text-sm">
                                                    <TrendingUp className="w-4 h-4 text-blue-500 mr-2" />
                                                    {outcome}
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                            <div>
                                              <h4 className="font-semibold text-sm text-gray-700 mb-2">Prerequisites</h4>
                                              <div className="space-y-1">
                                                {program.prerequisites.map((prereq, idx) => (
                                                  <div key={idx} className="flex items-center text-sm">
                                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                                    {prereq}
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                              <span className="font-semibold">Duration:</span> {program.duration}
                                            </div>
                                            <div>
                                              <span className="font-semibold">Cost Range:</span> {program.costRange}
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TabsContent>

                          {/* Scholarships Tab */}
                          <TabsContent value="scholarships" className="space-y-6">
                            <div className="grid gap-6">
                              {/* Scholarship Types */}
                              <div>
                                <h3 className="text-xl font-semibold mb-4 flex items-center">
                                  <Award className="w-5 h-5 mr-2 text-yellow-600" />
                                  Recommended Scholarship Types
                                </h3>
                                <div className="grid gap-4">
                                  {results.aiAnalysis.scholarshipRecommendations.scholarshipTypes.map((type, index) => (
                                    <Card key={index} className="border-l-4 border-l-yellow-500">
                                      <CardHeader>
                                        <div className="flex items-start justify-between">
                                          <div>
                                            <CardTitle className="text-lg">{type.type}</CardTitle>
                                            <CardDescription className="mt-2">{type.description}</CardDescription>
                                          </div>
                                        </div>
                                      </CardHeader>
                                      <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div>
                                            <h4 className="font-semibold text-sm text-gray-700 mb-2">Eligibility Criteria</h4>
                                            <div className="space-y-1">
                                              {type.eligibilityCriteria.map((criteria, idx) => (
                                                <div key={idx} className="flex items-center text-sm">
                                                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                                  {criteria}
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                          <div>
                                            <h4 className="font-semibold text-sm text-gray-700 mb-2">Application Tips</h4>
                                            <div className="space-y-1">
                                              {type.applicationTips.map((tip, idx) => (
                                                <div key={idx} className="flex items-center text-sm">
                                                  <Lightbulb className="w-4 h-4 text-yellow-500 mr-2" />
                                                  {tip}
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          {/* Action Plan Tab */}
                          <TabsContent value="action" className="space-y-6">
                            <div className="grid gap-6">
                              {/* Immediate Steps */}
                              <div>
                                <h3 className="text-xl font-semibold mb-4 flex items-center">
                                  <Rocket className="w-5 h-5 mr-2 text-red-600" />
                                  Immediate Action Steps
                                </h3>
                                <div className="grid gap-4">
                                  {results.aiAnalysis.actionPlan.immediateSteps.map((step, index) => (
                                    <Card key={index} className="border-l-4 border-l-red-500">
                                      <CardHeader>
                                        <div className="flex items-start justify-between">
                                          <div>
                                            <CardTitle className="text-lg">{step.action}</CardTitle>
                                            <CardDescription className="mt-2">Timeline: {step.timeline}</CardDescription>
                                          </div>
                                          <Badge className={getPriorityColor(step.priority)}>
                                            {step.priority} Priority
                                          </Badge>
                                        </div>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="space-y-2">
                                          <h4 className="font-semibold text-sm text-gray-700">Resources:</h4>
                                          <div className="space-y-1">
                                            {step.resources.map((resource, idx) => (
                                              <div key={idx} className="flex items-center text-sm">
                                                <Info className="w-4 h-4 text-blue-500 mr-2" />
                                                <span>{resource}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </div>

                              {/* Goals */}
                              <div className="grid gap-6">
                                <div>
                                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                                    <Target className="w-5 h-5 mr-2 text-blue-600" />
                                    Short-term Goals (6-12 months)
                                  </h3>
                                  <div className="space-y-2">
                                    {results.aiAnalysis.actionPlan.shortTermGoals.map((goal, index) => (
                                      <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
                                        <CheckCircle className="w-5 h-5 text-blue-600 mr-3" />
                                        <span className="text-gray-700">{goal}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                                    <Target className="w-5 h-5 mr-2 text-green-600" />
                                    Long-term Goals (2-5 years)
                                  </h3>
                                  <div className="space-y-2">
                                    {results.aiAnalysis.actionPlan.longTermGoals.map((goal, index) => (
                                      <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
                                        <Target className="w-5 h-5 text-green-600 mr-3" />
                                        <span className="text-gray-700">{goal}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    )}
                  </TabsContent>

                  {/* Quiz Responses Tab */}
                  <TabsContent value="quiz-responses" className="space-y-6">
                    <div className="space-y-6">
                      <div className="flex items-center">
                        <FileText className="w-6 h-6 text-blue-600 mr-2" />
                        <h3 className="text-2xl font-semibold">Your Quiz Responses</h3>
                      </div>
                      
                      <div className="grid gap-4">
                        {results.quizResponses && Object.entries(results.quizResponses)
                          .filter(([key]) => !['startedAt', 'progress', 'completedAt'].includes(key))
                          .map(([key, value], index) => {
                            if (!value || (Array.isArray(value) && value.length === 0)) return null;
                            
                            return (
                              <motion.div
                                key={key}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative"
                              >
                                <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md overflow-hidden">
                                  <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                      <div className="flex items-center">
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3 text-white text-sm font-semibold">
                                          {index + 1}
                                        </div>
                                                                                 <div>
                                           <h4 className="font-semibold text-gray-900 text-lg leading-tight">
                                             {getQuestionTitle(key)}
                                           </h4>
                                         </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-xs text-gray-500 font-medium">Answered</span>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                      {Array.isArray(value) ? (
                                        <div className="flex flex-wrap gap-2">
                                          {value.map((item, idx) => {
                                            const formattedItem = item.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
                                            return (
                                              <div
                                                key={idx}
                                                className="inline-flex items-center px-3 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 text-blue-700 font-medium text-sm hover:from-blue-100 hover:to-purple-100 transition-all duration-200 cursor-default"
                                              >
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                                {formattedItem}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      ) : (
                                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 font-medium">
                                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                          {String(value).replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Subtle gradient overlay */}
                                  <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                              </motion.div>
                            );
                          })}
                      </div>
                      
                      {/* Summary footer */}
                      <div className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Sparkles className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Quiz Completed</p>
                              <p className="text-sm text-gray-600">
                                {Object.keys(results.quizResponses || {}).length} questions answered
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-600">Match Score</p>
                            <p className="text-2xl font-bold text-blue-600">{results.matchScore}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-4 justify-center mt-8"
          >
            <Button onClick={handleRetakeQuiz} variant="outline">
              <Brain className="w-4 h-4 mr-2" />
              Retake Quiz
            </Button>
            <Button onClick={handleGoToDashboard}>
              <Target className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}