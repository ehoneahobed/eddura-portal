'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Target, 
  GraduationCap, 
  MapPin, 
  Clock, 
  DollarSign,
  Star,
  CheckCircle,
  ArrowRight,
  Download,
  Share2,
  Sparkles,
  Users,
  BookOpen,
  TrendingUp,
  Lightbulb,
  Lock,
  Mail,
  FileText,
  BarChart3,
  Zap,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { QUIZ_SECTIONS, getQuestionById } from '@/lib/quiz-config';

interface QuizResults {
  quizCompleted: boolean;
  quizCompletedAt: string;
  matchScore: number;
  insights: {
    personalityTraits: string[];
    workStyle: string[];
    academicStrengths: string[];
    skillGaps: string[];
    primaryInterests: string[];
    careerGoals: string[];
  };
  careerPreferences: any;
  recommendedPrograms: Array<{
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
  recommendedSchools: Array<{
    id: string;
    name: string;
    country: string;
    globalRanking: number;
    programCount: number;
  }>;
  quizResponses: any;
}

export default function QuizResults() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<QuizResults | null>(null);
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

  const handleDownloadResults = () => {
    // Generate PDF or export results
    console.log('Downloading results...');
  };

  const handleShareResults = () => {
    // Share results on social media
    console.log('Sharing results...');
  };

  const handleRetakeQuiz = () => {
    router.push('/quiz');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const getQuestionText = (questionId: string): string => {
    for (const section of QUIZ_SECTIONS) {
      const question = section.questions.find(q => q.id === questionId);
      if (question) {
        return question.title;
      }
    }
    return questionId;
  };

  const getOptionLabel = (questionId: string, value: string): string => {
    for (const section of QUIZ_SECTIONS) {
      const question = section.questions.find(q => q.id === questionId);
      if (question && question.options) {
        const option = question.options.find(opt => opt.value === value);
        if (option) {
          return option.label;
        }
      }
    }
    return value;
  };

  // Get all questions that were actually answered, regardless of conditional logic
  const getAnsweredQuestions = () => {
    if (!results?.quizResponses) return [];
    
    const answeredQuestions: Array<{id: string, title: string, answers: string[]}> = [];
    
    Object.entries(results.quizResponses).forEach(([questionId, answers]) => {
      const questionText = getQuestionText(questionId);
      answeredQuestions.push({
        id: questionId,
        title: questionText,
        answers: Array.isArray(answers) ? answers : [answers as string]
      });
    });
    
    return answeredQuestions;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-[#007fbd] rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Your Results</h2>
          <p className="text-gray-600 mb-6">Fetching your personalized career insights...</p>
          <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto">
            <motion.div
              className="h-2 bg-[#007fbd] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Required</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button onClick={handleRetakeQuiz} className="w-full">
              <Brain className="w-4 h-4 mr-2" />
              Take Quiz
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard')} className="w-full">
              <Target className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Results Found</h2>
          <p className="text-gray-600 mb-6">Please complete the quiz to view your results.</p>
          <Button onClick={handleRetakeQuiz}>
            <Brain className="w-4 h-4 mr-2" />
            Take Quiz
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center">
      {/* Header */}
      <header className="relative z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#007fbd] rounded-lg flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[#00334e]">Eddura</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleGoToDashboard} 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Target className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#007fbd]">{results.matchScore}%</div>
                <div className="text-sm text-gray-600">Match Score</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Your Career Discovery Results</h2>
                  <p className="text-blue-100 text-lg">
                    Based on your responses, we&apos;ve identified your ideal career path and recommended programs.
                  </p>
                  {results.quizCompletedAt && (
                    <p className="text-blue-200 text-sm mt-2">
                      Completed on {new Date(results.quizCompletedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="hidden md:flex items-center space-x-4">
                  <Button onClick={handleDownloadResults} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Download className="w-4 h-4 mr-2" />
                    Download Results
                  </Button>
                  <Button onClick={handleRetakeQuiz} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Brain className="w-4 h-4 mr-2" />
                    Retake Quiz
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Questions & Answers */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Your Quiz Responses
                </CardTitle>
                <CardDescription>
                  A detailed breakdown of your answers to the career discovery questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {getAnsweredQuestions().map((question, index) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {question.title}
                        </h3>
                        <div className="space-y-2">
                          {question.answers.map((answer: string, answerIndex: number) => (
                            <div key={answerIndex} className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="text-gray-700 bg-green-50 px-3 py-1 rounded-full text-sm">
                                {getOptionLabel(question.id, answer)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Recommendations */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            {/* AI-Powered Recommendations (Coming Soon) */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  AI-Powered Recommendations
                </CardTitle>
                <CardDescription className="text-purple-100">
                  Personalized insights and career guidance powered by artificial intelligence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
                  <p className="text-purple-100 mb-4">
                    We&apos;re working on advanced AI algorithms to provide you with personalized career insights, 
                    skill recommendations, and detailed career path analysis.
                  </p>
                  <span className="inline-flex items-center rounded-full border border-white/30 bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white">
                    <Eye className="w-3 h-3 mr-1" />
                    In Development
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Current Insights */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                  Your Career Insights
                </CardTitle>
                <CardDescription>
                  Key traits and preferences identified from your responses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Personality Traits */}
                {results.insights.personalityTraits.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Brain className="w-4 h-4 mr-2 text-blue-600" />
                      Personality Traits
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {results.insights.personalityTraits.map((trait: string, index: number) => (
                        <Badge key={index} className="bg-blue-50 text-blue-700 border-blue-200">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work Style */}
                {results.insights.workStyle.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Target className="w-4 h-4 mr-2 text-green-600" />
                      Work Style
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {results.insights.workStyle.map((style: string, index: number) => (
                        <Badge key={index} className="bg-green-50 text-green-700 border-green-200">
                          {style}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Academic Strengths */}
                {results.insights.academicStrengths.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <GraduationCap className="w-4 h-4 mr-2 text-purple-600" />
                      Academic Strengths
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {results.insights.academicStrengths.map((strength: string, index: number) => (
                        <Badge key={index} className="bg-purple-50 text-purple-700 border-purple-200">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommended Programs */}
            {results.recommendedPrograms.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-orange-600" />
                    Recommended Programs
                  </CardTitle>
                  <CardDescription>
                    Programs that match your career preferences and goals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {results.recommendedPrograms.slice(0, 3).map((program: any, index: number) => (
                      <div key={program.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">{program.name}</h3>
                        <p className="text-blue-600 font-medium text-xs mb-1">{program.school.name}</p>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>{program.fieldOfStudy}</span>
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            {results.matchScore}% Match
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {results.recommendedPrograms.length > 3 && (
                      <div className="text-center pt-2">
                        <Button variant="outline" size="sm" className="text-xs">
                          View All {results.recommendedPrograms.length} Programs
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>

        {/* Mobile Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-8 md:hidden"
        >
          <Button onClick={handleRetakeQuiz} variant="outline" className="flex-1 sm:flex-none">
            <Brain className="w-4 h-4 mr-2" />
            Retake Quiz
          </Button>
          <Button onClick={handleGoToDashboard} className="flex-1 sm:flex-none bg-[#007fbd] hover:bg-[#005a8b]">
            <Target className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Button>
          <Button onClick={handleDownloadResults} variant="outline" className="flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-2" />
            Download Results
          </Button>
        </motion.div>
      </main>
    </div>
  );
} 