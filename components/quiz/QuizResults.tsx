'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
import { QUIZ_SECTIONS } from '@/lib/quiz-config';
import { generateAllRecommendations, CareerInsight, ProgramRecommendation, PersonalityProfile, CareerPath } from '@/lib/ai-recommendations';
import { QuizResponses } from '@/types/quiz';
import Link from 'next/link';

export default function QuizResults() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [quizResponses, setQuizResponses] = useState<QuizResponses>({});
  const [careerInsights, setCareerInsights] = useState<CareerInsight[]>([]);
  const [programRecommendations, setProgramRecommendations] = useState<ProgramRecommendation[]>([]);
  const [personalityProfile, setPersonalityProfile] = useState<PersonalityProfile | null>(null);
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [showFullResults, setShowFullResults] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Example: check for auth token in localStorage
    setIsAuthenticated(!!localStorage.getItem('auth_token'));
  }, []);

  const generateResults = useCallback(() => {
    if (!isAuthenticated) return;
    const results = generateAllRecommendations(quizResponses);
    setCareerInsights(results.careerInsights);
    setProgramRecommendations(results.programRecommendations);
    setPersonalityProfile(results.personalityProfile);
    setCareerPaths(results.careerPaths);
  }, [quizResponses, isAuthenticated]);

  useEffect(() => {
    // Load quiz responses from localStorage
    const loadQuizResponses = () => {
      const responses: QuizResponses = {};
      
      // Load responses from all quiz sections
      QUIZ_SECTIONS.forEach(section => {
        const saved = localStorage.getItem(`quiz_${section.id}`);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            // Merge the parsed responses into the main responses object
            Object.assign(responses, parsed);
          } catch (error) {
            console.error('Error parsing quiz response:', error);
          }
        }
      });
      
      setQuizResponses(responses);
    };
    
    loadQuizResponses();
    setTimeout(() => {
      setIsLoading(false);
      generateResults();
    }, 1000);
  }, [generateResults]);

  const handleRegister = () => {
    router.push('/auth/register?from=quiz-results');
  };

  const handleSignIn = () => {
    router.push('/auth/login?from=quiz-results');
  };

  const handleDownloadResults = () => {
    // Generate PDF or export results
    console.log('Downloading results...');
  };

  const handleShareResults = () => {
    // Share results on social media
    console.log('Sharing results...');
  };

  // Icon mapping for dynamic icons
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, any> = {
      'Brain': Brain,
      'Target': Target,
      'Users': Users,
      'Lightbulb': Lightbulb,
      'GraduationCap': GraduationCap,
      'TrendingUp': TrendingUp
    };
    return iconMap[iconName] || Brain;
  };

  // Helper to summarize answers for preview, grouped by section
  const summarizeAnswersBySection = () => {
    return QUIZ_SECTIONS.map(section => {
      // Get all responses for this section
      const sectionResponses = quizResponses;
      if (!sectionResponses) return null;
      
      // Get questions that were actually shown to the user (filtered)
      const answered = section.questions
        .map(q => {
          const answer = sectionResponses[q.id as keyof QuizResponses];
          if (!answer || (Array.isArray(answer) && answer.length === 0) || (!Array.isArray(answer) && String(answer).trim() === '')) return null;
          
          let value: string[] = [];
          if (Array.isArray(answer)) {
            if (q.options) {
              value = answer.map(val => {
                const opt = q.options?.find(o => o.value === val);
                return opt ? opt.label : val;
              });
            } else {
              value = answer;
            }
          } else {
            value = [String(answer)];
          }
          return { question: q.title, value };
        })
        .filter(Boolean);
      
      if (answered.length === 0) return null;
      
      return {
        sectionTitle: section.title,
        sectionIcon: section.icon,
        answers: answered
      };
    }).filter(Boolean);
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Responses</h2>
          <p className="text-gray-600 mb-6">Our AI is processing your quiz data to generate personalized insights...</p>
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

      {/* Results Section Wrapper */}
      <main className="w-full flex flex-col items-center mt-8 px-2">
        <div className="w-full max-w-3xl flex flex-col items-center gap-6 bg-white/80 rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* CTA Card - Top, full width */}
          <div className="w-full flex flex-col items-center gap-2 bg-gradient-to-br from-[#00334e] to-[#004d73] text-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-5 h-5 text-white" />
              <span className="font-semibold text-base">Unlock Your Full Results</span>
            </div>
            <p className="text-xs text-blue-100 mb-2 text-center">
              Create a free account to access:
            </p>
            <div className="grid grid-cols-2 gap-2 w-full text-left text-xs mb-2">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-400 mr-1" />
                Complete program recommendations
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-400 mr-1" />
                Detailed career path analysis
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-400 mr-1" />
                Application guidance & tips
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-400 mr-1" />
                Save & track your progress
              </div>
            </div>
            <Button 
              onClick={handleRegister}
              className="w-full bg-white text-[#00334e] hover:bg-gray-100 font-semibold text-sm"
            >
              <Users className="mr-2 h-4 w-4" />
              Create Free Account
            </Button>
            <Button 
              variant="outline"
              onClick={handleSignIn}
              className="w-full border-[#00334e] text-[#00334e] bg-white hover:bg-gray-100 hover:text-[#00334e] text-sm mt-1"
            >
              <Mail className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          </div>
          {/* Main Content: Summary */}
          <div className="w-full flex flex-col gap-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-base font-semibold text-[#00334e]">Quiz Complete!</span>
            </div>

            {/* If not authenticated, show answers preview instead of AI results */}
            {!isAuthenticated ? (
              <div className="w-full flex flex-col gap-6">
                {summarizeAnswersBySection().length === 0 && (
                  <Card className="w-full border-0 shadow-none bg-transparent p-0">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl flex items-center">
                        <Target className="w-5 h-5 mr-2 text-[#007fbd]" />
                        Your Answers Preview
                      </CardTitle>
                      <CardDescription>
                        Here&apos;s a summary of your responses. Sign up to unlock personalized recommendations!
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <span className="text-gray-500 text-sm">No answers found. Please complete the quiz.</span>
                    </CardContent>
                  </Card>
                )}
                {summarizeAnswersBySection().map((section, idx) => (
                  section && (
                    <Card key={idx} className="w-full border border-gray-200 shadow-sm bg-white/90 rounded-xl">
                      <CardHeader className="flex flex-row items-center gap-3 pb-2">
                        <span className="text-2xl">{section.sectionIcon}</span>
                        <CardTitle className="text-lg font-semibold text-[#00334e]">{section.sectionTitle}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-col gap-4">
                          {section.answers.filter(Boolean).map((item, qidx) => item && (
                            <div key={qidx} className="flex flex-col md:flex-row md:items-center md:gap-4">
                              <span className="text-gray-700 font-medium md:w-1/2">{item.question}</span>
                              <div className="flex flex-wrap gap-2 mt-1 md:mt-0">
                                {item.value.map((val, vIdx) => (
                                  <span key={vIdx} className="inline-block bg-blue-50 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full border border-blue-100">
                                    {val}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                ))}
              </div>
            ) : (
              <>
                {/* Quick Summary Card */}
                <Card className="w-full border-0 shadow-none bg-transparent p-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl flex items-center">
                      <Target className="w-5 h-5 mr-2 text-[#007fbd]" />
                      Your Quick Summary
                    </CardTitle>
                    <CardDescription>
                      Here&apos;s a preview of what we discovered about you
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid md:grid-cols-2 gap-4">
                      {careerInsights.slice(0, 2).map((insight, index) => {
                        const IconComponent = getIconComponent(insight.icon);
                        return (
                          <div key={index} className="p-3 border border-gray-200 rounded-lg bg-white flex flex-col gap-2">
                            <div className="flex items-center mb-1">
                              <div className={`w-7 h-7 ${insight.color} rounded-lg flex items-center justify-center mr-2`}>
                                <IconComponent className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 text-sm">{insight.title}</h3>
                                <p className="text-xs text-gray-500">{insight.category}</p>
                              </div>
                            </div>
                            <p className="text-gray-600 text-xs mb-1">{insight.description}</p>
                            <div className="flex justify-between items-center text-xs">
                              <span>Strength</span>
                              <span>{insight.strength}%</span>
                            </div>
                            <Progress value={isNaN(insight.strength) || !isFinite(insight.strength) ? 0 : Math.max(0, Math.min(100, insight.strength))} className="h-1" />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Locked Top Recommendation Preview (Blurred) */}
                {programRecommendations.length > 0 && (
                  <div className="w-full relative rounded-xl overflow-hidden border border-gray-200 bg-gradient-to-br from-gray-100 to-gray-200 my-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-200/80 to-gray-400/80 z-10 flex flex-col items-center justify-center">
                      <Lock className="w-8 h-8 text-[#007fbd] mb-1" />
                      <p className="text-sm font-semibold text-[#00334e] mb-1">Create an account to unlock your top recommendation</p>
                      <Button 
                        onClick={handleRegister}
                        className="bg-[#007fbd] hover:bg-[#004d73] text-white text-sm px-4 py-1"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Unlock Now
                      </Button>
                    </div>
                    <div className="p-4 opacity-40 blur-sm select-none pointer-events-none">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900 mb-1">
                            {programRecommendations[0].name}
                          </h3>
                          <p className="text-[#007fbd] font-medium mb-1">{programRecommendations[0].university}</p>
                          <p className="text-gray-600 text-xs">{programRecommendations[0].description}</p>
                        </div>
                        <div className="text-right ml-2">
                          <Badge className="bg-green-100 text-green-800 mb-1 text-xs">
                            {programRecommendations[0].matchScore}% Match
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {programRecommendations[0].highlights.slice(0, 2).map((highlight, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {highlight}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Profile Preview Card */}
                {personalityProfile && (
                  <Card className="w-full border-0 shadow-none bg-transparent p-0">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Your Profile Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1 text-sm">Personality Type</h4>
                          <Badge className="bg-purple-100 text-purple-800 mb-2 text-xs">
                            {personalityProfile.personalityType}
                          </Badge>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1 text-sm">Work Style</h4>
                          <p className="text-xs text-gray-600">{personalityProfile.workStyle}</p>
                        </div>
                        <Separator />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1 text-sm">Top Values</h4>
                          <div className="space-y-1">
                            {personalityProfile.careerValues.slice(0, 3).map((value, index) => (
                              <div key={index} className="flex items-center">
                                <Star className="w-3 h-3 text-yellow-500 mr-2" />
                                <span className="text-xs text-gray-600">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 