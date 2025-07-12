'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  HelpCircle,
  Save,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
  QUIZ_SECTIONS, 
  getSectionById, 
  getFilteredQuestions,
  getFilteredSections,
  getNextSection,
  getPreviousSection,
  getAdaptiveProgressPercentage,
  getAdaptiveTotalQuestions
} from '@/lib/quiz-config';
import { QuizSection as QuizSectionType } from '@/lib/quiz-config';
import Link from 'next/link';

interface QuizSectionProps {
  section: QuizSectionType;
}

export default function QuizSection({ section }: QuizSectionProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string[] | string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  // Get filtered questions based on current responses
  const filteredQuestions = getFilteredQuestions(section, responses);
  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === filteredQuestions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  
  // Find current section index in filtered sections
  const filteredSections = getFilteredSections(responses);
  const currentSectionIndex = filteredSections.findIndex(s => s.id === section.id);
  const isLastSection = currentSectionIndex === filteredSections.length - 1;
  const nextSection = getNextSection(section.id, responses);
  const prevSection = getPreviousSection(section.id, responses);

  // Calculate progress
  const rawSectionProgress = filteredQuestions.length > 0 ? ((currentQuestionIndex + 1) / filteredQuestions.length) * 100 : 0;
  // Ensure progress is a valid number between 0 and 100
  const sectionProgress = isNaN(rawSectionProgress) || !isFinite(rawSectionProgress) ? 0 : Math.max(0, Math.min(100, rawSectionProgress));
  
  // Aggregate all responses from localStorage for all sections
  const loadAllResponses = () => {
    let merged: Record<string, string[] | string> = {};
    if (typeof window !== 'undefined') {
      for (const s of QUIZ_SECTIONS) {
        const saved = localStorage.getItem(`quiz_${s.id}`);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            merged = { ...merged, ...parsed };
          } catch {}
        }
      }
    }
    return merged;
  };

  // On mount, load all responses
  useEffect(() => {
    setResponses(loadAllResponses());
  }, [section.id]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem('quiz_completed_sections');
      setCompletedSections(completed ? JSON.parse(completed) : []);
    }
  }, [section.id]);

  const rawOverallProgress = getAdaptiveProgressPercentage(completedSections, responses);
  // Ensure progress is a valid number between 0 and 100
  const overallProgress = isNaN(rawOverallProgress) || !isFinite(rawOverallProgress) ? 0 : Math.max(0, Math.min(100, rawOverallProgress));

  // Save response to database if user is authenticated
  const saveResponseToDatabase = async (questionId: string, value: string | string[]) => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionId: section.id,
          questionId,
          responses: Array.isArray(value) ? value : undefined,
          textResponse: !Array.isArray(value) ? value : undefined,
          isCompleted: false,
          timeSpent: 0
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to save response to database');
      }
    } catch (error) {
      console.error('Error saving response to database:', error);
    }
  };

  // When saving, update the merged responses object and localStorage
  const handleResponseChange = (questionId: string, value: string | string[]) => {
    // Load all responses, update this question, and save
    const allResponses = loadAllResponses();
    const newResponses = { ...allResponses, [questionId]: value };
    setResponses(newResponses);
    localStorage.setItem(`quiz_${section.id}`, JSON.stringify({ ...responses, [questionId]: value }));
    
    // Save to database if authenticated
    saveResponseToDatabase(questionId, value);
    
    // Update completed sections if this is the last question
    if (isLastQuestion) {
      let updatedCompletedSections = [...completedSections];
      if (!updatedCompletedSections.includes(section.id)) {
        updatedCompletedSections.push(section.id);
        localStorage.setItem('quiz_completed_sections', JSON.stringify(updatedCompletedSections));
        setCompletedSections(updatedCompletedSections);
      }
    }
  };

  const handleMultiSelectChange = (questionId: string, value: string, checked: boolean) => {
    const currentResponses = (responses[questionId] as string[]) || [];
    let newResponses: string[];
    
    if (checked) {
      newResponses = [...currentResponses, value];
    } else {
      newResponses = currentResponses.filter(v => v !== value);
    }
    
    handleResponseChange(questionId, newResponses);
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      // Save section responses
      handleResponseChange(currentQuestion.id, responses[currentQuestion.id]);

      // Use the latest responses to determine the next section
      const updatedResponses = { ...responses };
      const filteredSectionsDebug = getFilteredSections(updatedResponses);
      const next = getNextSection(section.id, updatedResponses);

      // Debug logging
      console.log('handleNext Debug:', {
        currentSectionId: section.id,
        filteredSections: filteredSectionsDebug.map(s => s.id),
        updatedResponses,
        nextSection: next ? next.id : null
      });

      if (isLastSection) {
        // Mark quiz as completed in database if authenticated
        if (session?.user?.id) {
          try {
            await fetch('/api/quiz/submit', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                sectionId: section.id,
                questionId: 'quiz_completion',
                isCompleted: true,
                timeSpent: 0
              }),
            });
          } catch (error) {
            console.error('Error marking quiz as completed:', error);
          }
        }
        
        router.push('/quiz/results');
      } else if (next) {
        router.push(`/quiz/sections/${next.id}`);
      }
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (isFirstQuestion) {
      if (currentSectionIndex === 0) {
        router.push('/quiz');
      } else if (prevSection) {
        router.push(`/quiz/sections/${prevSection.id}`);
      }
    } else {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const canProceed = () => {
    if (!currentQuestion?.required) return true;
    
    const response = responses[currentQuestion.id];
    if (!response) return false;
    
    if (Array.isArray(response)) {
      return response.length > 0;
    }
    
    return response.trim().length > 0;
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;
    
    switch (currentQuestion.type) {
      case 'multiselect':
        return (
          <div className="space-y-4">
            {currentQuestion.options?.map((option) => (
              <div key={option.value} className="flex items-start space-x-4 p-5 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer group">
                <Checkbox
                  id={option.value}
                  checked={(responses[currentQuestion.id] as string[])?.includes(option.value) || false}
                  onCheckedChange={(checked) => 
                    handleMultiSelectChange(currentQuestion.id, option.value, checked as boolean)
                  }
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <label 
                    htmlFor={option.value}
                    className="text-base font-medium text-gray-900 cursor-pointer block group-hover:text-blue-900 transition-colors"
                  >
                    {option.label}
                  </label>
                  {option.description && (
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{option.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      case 'singleselect':
        return (
          <div className="space-y-4">
            {currentQuestion.options?.map((option) => (
              <div key={option.value} className="flex items-start space-x-4 p-5 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer group">
                <input
                  type="radio"
                  id={option.value}
                  name={currentQuestion.id}
                  checked={responses[currentQuestion.id] === option.value}
                  onChange={() => handleResponseChange(currentQuestion.id, option.value)}
                  className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="flex-1 min-w-0">
                  <label 
                    htmlFor={option.value}
                    className="text-base font-medium text-gray-900 cursor-pointer block group-hover:text-blue-900 transition-colors"
                  >
                    {option.label}
                  </label>
                  {option.description && (
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{option.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      case 'textarea':
        return (
          <div className="space-y-4">
            <Textarea
              placeholder={currentQuestion.placeholder}
              value={(responses[currentQuestion.id] as string) || ''}
              onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
              className="min-h-[200px] resize-none text-base leading-relaxed p-4"
            />
            <p className="text-sm text-gray-500">
              Take your time to provide detailed and thoughtful responses.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  // Don't render if no questions are available for this section
  if (filteredQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">
              No questions available for this section based on your previous responses.
            </p>
            <Button onClick={() => router.push('/quiz')}>
              Return to Quiz Start
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="relative z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#007fbd] rounded-lg flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-[#00334e]">Eddura</h1>
              </Link>
              <div className="hidden sm:block">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Clock className="w-3 h-3 mr-1" />
                  {section.estimatedTime} min
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelp(!showHelp)}
                className="text-gray-600 hover:text-gray-900"
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                Help
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleResponseChange(currentQuestion.id, responses[currentQuestion.id])}
                className="text-gray-600 hover:text-gray-900"
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Section {currentSectionIndex + 1} of {filteredSections.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(overallProgress)}% Complete
            </span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
          {/* Left Sidebar - Section Info */}
          <div className="lg:col-span-2">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">{section.icon}</span>
                  <span>{section.title}</span>
                </CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Section Progress</span>
                      <span>{Math.round(sectionProgress)}%</span>
                    </div>
                    <Progress value={sectionProgress} className="h-2" />
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>Question {currentQuestionIndex + 1} of {filteredQuestions.length}</p>
                    <p className="mt-1">Estimated time: {section.estimatedTime} minutes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Question */}
          <div className="lg:col-span-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${section.id}-${currentQuestionIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">
                        {currentQuestion?.title}
                      </CardTitle>
                      {currentQuestion?.required && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    {currentQuestion?.description && (
                      <CardDescription className="text-base">
                        {currentQuestion.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {renderQuestion()}
                    
                    {/* Navigation */}
                    <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                      <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={isFirstQuestion && currentSectionIndex === 0}
                        className="flex items-center space-x-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </Button>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {currentQuestionIndex + 1} of {filteredQuestions.length}
                        </span>
                      </div>
                      
                      <Button
                        onClick={handleNext}
                        disabled={!canProceed() || isSubmitting}
                        className="flex items-center space-x-2 bg-[#007fbd] hover:bg-[#004d73] text-white"
                      >
                        <span>
                          {isLastQuestion 
                            ? (isLastSection ? 'Finish Quiz' : 'Next Section')
                            : 'Next Question'
                          }
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md mx-4">
            <CardHeader>
              <CardTitle>Quiz Help</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">How to complete this quiz:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Answer all required questions to proceed</li>
                  <li>• You can select multiple options where allowed</li>
                  <li>• Your progress is automatically saved</li>
                  <li>• You can go back to previous questions</li>
                </ul>
              </div>
              <Button 
                onClick={() => setShowHelp(false)}
                className="w-full"
              >
                Got it
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 