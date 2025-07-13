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
  Award,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { toast } from 'sonner';
import ApplicationStatusBanner from './ApplicationStatusBanner';

interface Question {
  id: string;
  type: 'text' | 'textarea' | 'email' | 'phone' | 'number' | 'date' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'file' | 'url' | 'address' | 'education' | 'experience' | 'reference' | 'essay' | 'statement' | 'gpa' | 'test_score';
  title: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  order: number;
  options?: { value: string; label: string; description?: string }[];
  helpText?: string;
  maxLength?: number;
  minLength?: number;
  defaultValue?: string | number | boolean;
  group?: string;
}

interface FormSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  questions: Question[];
  isRepeatable?: boolean;
  maxRepeats?: number;
}

interface Application {
  _id: string;
  scholarshipId: {
    _id: string;
    title: string;
    value?: number;
    currency?: string;
    deadline: string;
  };
  applicationTemplateId: {
    _id: string;
    title: string;
    sections: FormSection[];
    estimatedTime: number;
  };
  status: 'draft' | 'in_progress' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'waitlisted' | 'withdrawn';
  sections: {
    sectionId: string;
    responses: {
      questionId: string;
      value: string | string[] | number | boolean | Date;
      files?: string[];
      timestamp: Date;
      isComplete: boolean;
    }[];
    isComplete: boolean;
    startedAt: Date;
    completedAt?: Date;
  }[];
  currentSectionId?: string;
  progress: number;
  startedAt: string;
  lastActivityAt: string;
  submittedAt?: string;
  estimatedTimeRemaining?: number;
  notes?: string;
}

interface ApplicationFormProps {
  applicationId: string;
}

export default function ApplicationForm({ applicationId }: ApplicationFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [application, setApplication] = useState<Application | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string[] | string | number | boolean | Date>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchApplication();
    }
  }, [session?.user?.id, applicationId]);

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`);
      if (response.ok) {
        const data = await response.json();
        setApplication(data.application);
        
        // Load responses from the application
        const allResponses: Record<string, string[] | string | number | boolean | Date> = {};
        data.application.sections.forEach((section: any) => {
          section.responses.forEach((response: any) => {
            allResponses[response.questionId] = response.value;
          });
        });
        setResponses(allResponses);
        
        // Set current section
        if (data.application.currentSectionId) {
          const sectionIndex = data.application.applicationTemplateId.sections.findIndex(
            (section: FormSection) => section.id === data.application.currentSectionId
          );
          setCurrentSectionIndex(sectionIndex >= 0 ? sectionIndex : 0);
        }
        
        // Set completed sections
        setCompletedSections(
          data.application.sections
            .filter((section: any) => section.isComplete)
            .map((section: any) => section.sectionId)
        );
      } else {
        toast.error('Failed to fetch application');
        router.push('/applications');
      }
    } catch (error) {
      console.error('Error fetching application:', error);
      toast.error('Failed to fetch application');
      router.push('/applications');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Application</h2>
          <p className="text-gray-600">Getting your application data...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Not Found</h2>
          <p className="text-gray-600 mb-4">The application you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/applications')}>
            Back to Applications
          </Button>
        </div>
      </div>
    );
  }

  const currentSection = application.applicationTemplateId.sections[currentSectionIndex];
  const isLastSection = currentSectionIndex === application.applicationTemplateId.sections.length - 1;
  const isFirstSection = currentSectionIndex === 0;

  // Calculate progress
  const sectionProgress = currentSection?.questions.length > 0 
    ? (currentSection.questions.filter((q: Question) => responses[q.id]).length / currentSection.questions.length) * 100 
    : 0;
  
  const overallProgress = application.progress;

  const handleResponseChange = async (questionId: string, value: string | string[] | number | boolean | Date) => {
    const newResponses = { ...responses, [questionId]: value };
    setResponses(newResponses);
    
    // Save to database
    try {
      await fetch(`/api/applications/${applicationId}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionId: currentSection.id,
          questionId,
          value,
          isComplete: true
        }),
      });
    } catch (error) {
      console.error('Error saving response:', error);
      toast.error('Failed to save response');
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
    // Mark section as complete
    try {
      await fetch(`/api/applications/${applicationId}/sections/${currentSection.id}/complete`, {
        method: 'POST',
      });
      
      if (isLastSection) {
        // Submit application
        await fetch(`/api/applications/${applicationId}/submit`, {
          method: 'POST',
        });
        toast.success('Application submitted successfully!');
        router.push('/applications');
      } else {
        // Move to next section
        setCurrentSectionIndex((prev: number) => prev + 1);
      }
    } catch (error) {
      console.error('Error completing section:', error);
      toast.error('Failed to complete section');
    }
  };

  const handlePrevious = () => {
    if (isFirstSection) {
      router.push('/applications');
    } else {
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  const canProceed = () => {
    if (!currentSection) return false;
    
    // Check if all required questions in the section are answered
    const requiredQuestions = currentSection.questions.filter((q: Question) => q.required);
    return requiredQuestions.every((question: Question) => {
      const response = responses[question.id];
      if (!response) return false;
      
      if (Array.isArray(response)) {
        return response.length > 0;
      }
      
      if (typeof response === 'string') {
        return response.trim().length > 0;
      }
      
      return true;
    });
  };

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'multiselect':
        return (
          <div className="space-y-4">
            {question.options?.map((option) => (
              <div key={option.value} className="flex items-start space-x-4 p-5 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer group">
                <Checkbox
                  id={option.value}
                  checked={(responses[question.id] as string[])?.includes(option.value) || false}
                  onCheckedChange={(checked) => 
                    handleMultiSelectChange(question.id, option.value, checked as boolean)
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
      case 'select':
        return (
          <Select 
            value={(responses[question.id] as string) || ''} 
            onValueChange={(value) => handleResponseChange(question.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={question.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'textarea':
        return (
          <div className="space-y-4">
            <Textarea
              placeholder={question.placeholder}
              value={(responses[question.id] as string) || ''}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              className="min-h-[200px] resize-none text-base leading-relaxed p-4"
              maxLength={question.maxLength}
            />
            {question.helpText && (
              <p className="text-sm text-gray-500">{question.helpText}</p>
            )}
          </div>
        );
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
        return (
          <div className="space-y-4">
            <Input
              type={question.type === 'email' ? 'email' : 'text'}
              placeholder={question.placeholder}
              value={(responses[question.id] as string) || ''}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              className="text-base p-4"
              maxLength={question.maxLength}
            />
            {question.helpText && (
              <p className="text-sm text-gray-500">{question.helpText}</p>
            )}
          </div>
        );
      default:
        return (
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <p className="text-gray-600">Question type "{question.type}" not yet implemented.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="relative z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/applications" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#007fbd] rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-[#00334e]">{application.scholarshipId.title}</h1>
              </Link>
              <div className="hidden sm:block">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Clock className="w-3 h-3 mr-1" />
                  {application.applicationTemplateId.estimatedTime} min
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
                onClick={() => {
                  // Save all responses in current section
                  currentSection?.questions.forEach(question => {
                    if (responses[question.id]) {
                      handleResponseChange(question.id, responses[question.id]);
                    }
                  });
                  toast.success('Section saved!');
                }}
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
              Section {currentSectionIndex + 1} of {application.applicationTemplateId.sections.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(overallProgress)}% Complete
            </span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      </div>

      {/* Application Status Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ApplicationStatusBanner 
          scholarship={{
            title: application.scholarshipId.title,
            deadline: application.scholarshipId.deadline,
            value: application.scholarshipId.value,
            currency: application.scholarshipId.currency
          }}
        />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
          {/* Left Sidebar - Section Info */}
          <div className="lg:col-span-2">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">📝</span>
                  <span>{currentSection?.title}</span>
                </CardTitle>
                <CardDescription>{currentSection?.description}</CardDescription>
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
                    <p>{currentSection?.questions.length} questions in this section</p>
                    <p className="mt-1">Scholarship: {application.scholarshipId.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Content - All Questions in Section */}
          <div className="lg:col-span-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSection?.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl">
                        {currentSection?.title}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {currentSection?.questions.length} questions
                      </Badge>
                    </div>
                    {currentSection?.description && (
                      <CardDescription className="text-base">
                        {currentSection.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {currentSection?.questions.map((question, index) => (
                      <div key={question.id} className="space-y-4 p-6 border border-gray-200 rounded-lg bg-white">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {index + 1}. {question.title}
                          </h3>
                          {question.required && (
                            <Badge variant="destructive" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        {question.description && (
                          <p className="text-gray-600">{question.description}</p>
                        )}
                        <div className="mt-4">
                          {renderQuestion(question)}
                        </div>
                      </div>
                    ))}
                    
                    {/* Navigation */}
                    <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                      <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={isFirstSection}
                        className="flex items-center space-x-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Previous Section</span>
                      </Button>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          Section {currentSectionIndex + 1} of {application.applicationTemplateId.sections.length}
                        </span>
                      </div>
                      
                      <Button
                        onClick={handleNext}
                        disabled={!canProceed() || isSubmitting}
                        className="flex items-center space-x-2 bg-[#007fbd] hover:bg-[#004d73] text-white"
                      >
                        <span>
                          {isLastSection ? 'Submit Application' : 'Next Section'}
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
              <CardTitle>Application Help</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">How to complete this application:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Answer all required questions to proceed</li>
                  <li>• You can select multiple options where allowed</li>
                  <li>• Your progress is automatically saved</li>
                  <li>• You can go back to previous sections</li>
                  <li>• You can pause and resume anytime</li>
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