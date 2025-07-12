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
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#007fbd] rounded-lg flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[#00334e]">Eddura</h1>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    Based on your responses, we've identified your ideal career path and recommended programs.
                  </p>
                  {results.quizCompletedAt && (
                    <p className="text-blue-200 text-sm mt-2">
                      Completed on {new Date(results.quizCompletedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold mb-1">{results.matchScore}%</div>
                  <div className="text-blue-100">Match Score</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Insights Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {/* Personality Traits */}
          {results.insights.personalityTraits.length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-blue-600" />
                  Personality Traits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {results.insights.personalityTraits.map((trait, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Work Style */}
          {results.insights.workStyle.length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-green-600" />
                  Work Style
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {results.insights.workStyle.map((style, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-50 text-green-700">
                      {style}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Academic Strengths */}
          {results.insights.academicStrengths.length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-purple-600" />
                  Academic Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {results.insights.academicStrengths.map((strength, index) => (
                    <Badge key={index} variant="secondary" className="bg-purple-50 text-purple-700">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Recommended Programs */}
        {results.recommendedPrograms.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
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
                <div className="space-y-4">
                  {results.recommendedPrograms.slice(0, 5).map((program, index) => (
                    <div key={program.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{program.name}</h3>
                        <p className="text-blue-600 font-medium mb-1">{program.school.name}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{program.fieldOfStudy}</span>
                          <span>•</span>
                          <span>{program.degreeType}</span>
                          <span>•</span>
                          <span>{program.duration}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-800 mb-2">
                          {results.matchScore}% Match
                        </Badge>
                        <div className="text-sm text-gray-500">
                          #{program.school.globalRanking} Global
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button onClick={handleRetakeQuiz} variant="outline" className="flex-1 sm:flex-none">
            <Brain className="w-4 h-4 mr-2" />
            Retake Quiz
          </Button>
          <Button onClick={() => router.push('/dashboard')} className="flex-1 sm:flex-none bg-[#007fbd] hover:bg-[#005a8b]">
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