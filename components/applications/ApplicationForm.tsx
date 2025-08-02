'use client';

import { useState, useEffect, useCallback } from 'react';
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
  AlertCircle,
  CalendarIcon,
  Upload,
  Trash2,
  GraduationCap,
  Briefcase,
  User,
  MapPin,
  Calculator,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ExpandableTextarea } from '@/components/ui/expandable-textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';
import ApplicationStatusBanner from './ApplicationStatusBanner';
import dynamic from 'next/dynamic';
import countries from 'world-countries';
import { MarkdownEditor } from '@/components/ui/markdown-editor';

interface Question {
  id: string;
  type: 'text' | 'textarea' | 'email' | 'phone' | 'number' | 'date' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'file' | 'url' | 'address' | 'education' | 'experience' | 'reference' | 'essay' | 'statement' | 'gpa' | 'test_score' | 'country';
  title: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  order: number;
  options?: { value: string; label: string; description?: string }[];
  helpText?: string;
  maxLength?: number;
  minLength?: number;
  maxWords?: number;
  minWords?: number;
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
  status: 'draft' | 'in_progress' | 'ready_for_submission' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'waitlisted' | 'withdrawn';
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

  const updateApplicationStatus = useCallback(async (status: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        console.log(`Application status updated to ${status}`);
      } else {
        console.error('Failed to update application status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  }, [applicationId]);

  const fetchApplication = useCallback(async () => {
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

        // Update status to 'in_progress' if it's still 'draft'
        if (data.application.status === 'draft') {
          await updateApplicationStatus('in_progress');
        }
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
  }, [applicationId, router, updateApplicationStatus]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchApplication();
    }
  }, [session?.user?.id, applicationId, fetchApplication]);



  const downloadApplication = () => {
    if (!application) return;

    // Create a formatted document with all responses
    let content = `Application Form: ${application.applicationTemplateId.title}\n`;
    content += `Scholarship: ${application.scholarshipId.title}\n`;
    content += `Date: ${new Date().toLocaleDateString()}\n\n`;

    application.applicationTemplateId.sections.forEach((section: FormSection) => {
      content += `## ${section.title}\n`;
      if (section.description) {
        content += `${section.description}\n\n`;
      }

      section.questions.forEach((question: Question) => {
        const response = responses[question.id];
        content += `**${question.title}**`;
        if (question.required) {
          content += ` (Required)`;
        }
        content += `\n`;

        if (response) {
          if (Array.isArray(response)) {
            content += response.join(', ');
          } else {
            content += String(response);
          }
        } else {
          content += '[Not answered]';
        }
        content += `\n\n`;
      });
    });

    // Create and download the file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${application.scholarshipId.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_application.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast.success('Application downloaded successfully!');
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
          <p className="text-gray-600 mb-4">The application you&apos;re looking for doesn&apos;t exist.</p>
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

      // Update progress based on current section completion
      const totalQuestions = currentSection.questions.length;
      const answeredQuestions = currentSection.questions.filter((q: Question) => {
        const response = newResponses[q.id];
        if (!response) return false;
        if (Array.isArray(response)) return response.length > 0;
        if (typeof response === 'string') return response.trim().length > 0;
        return true;
      }).length;

      const sectionProgress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
      
      // Calculate overall progress (simplified - you might want to make this more sophisticated)
      const overallProgress = Math.round(sectionProgress);
      
      // Update application progress
      await updateApplicationStatus('in_progress');
      await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          progress: overallProgress,
          currentSectionId: currentSection.id
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
        // Mark application as ready for submission
        await fetch(`/api/applications/${applicationId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            status: 'ready_for_submission',
            progress: 100
          }),
        });
        toast.success('Application form completed! Your application is ready for submission to the scholarship provider.', {
          description: 'You can now download your responses and submit them to the official scholarship portal.',
          duration: 5000,
        });
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

  const isQuestionAnswered = (question: Question) => {
    // Handle GPA and test_score questions that have separate value and scale/type fields
    if (question.type === 'gpa') {
      const gpaValue = responses[`${question.id}_value`];
      const gpaScale = responses[`${question.id}_scale`];
      return !!(gpaValue && gpaScale);
    }
    
    if (question.type === 'test_score') {
      const testValue = responses[`${question.id}_value`];
      const testType = responses[`${question.id}_type`];
      return !!(testValue && testType);
    }
    
    const response = responses[question.id];
    if (!response) return false;
    
    if (Array.isArray(response)) {
      return response.length > 0;
    }
    
    if (typeof response === 'string') {
      return response.trim().length > 0;
    }
    
    return true;
  };

  const getMissingRequiredFields = () => {
    if (!currentSection) return [];
    
    const missingFields: string[] = [];
    const requiredQuestions = currentSection.questions.filter((q: Question) => q.required);
    
    requiredQuestions.forEach((question: Question) => {
      if (!isQuestionAnswered(question)) {
        missingFields.push(question.title);
      }
    });
    
    return missingFields;
  };

  const canProceed = () => {
    if (!currentSection) return false;
    
    // Check if all required questions in the section are answered
    const requiredQuestions = currentSection.questions.filter((q: Question) => q.required);
    return requiredQuestions.every((question: Question) => {
      // Handle GPA and test_score questions that have separate value and scale/type fields
      if (question.type === 'gpa') {
        const gpaValue = responses[`${question.id}_value`];
        const gpaScale = responses[`${question.id}_scale`];
        return gpaValue && gpaScale;
      }
      
      if (question.type === 'test_score') {
        const testValue = responses[`${question.id}_value`];
        const testType = responses[`${question.id}_type`];
        return testValue && testType;
      }
      
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
            <ExpandableTextarea
              placeholder={question.placeholder}
              value={(responses[question.id] as string) || ''}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              className="min-h-[200px] resize-none text-base leading-relaxed p-4"
              maxLength={question.maxLength}
              minLength={question.minLength}
              maxWords={question.maxWords}
              minWords={question.minWords}
              showCharacterCount={true}
              showWordCount={true}
              expandable={true}
              defaultExpanded={false}
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
      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !responses[question.id] && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {responses[question.id] ? format(responses[question.id] as Date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={responses[question.id] as Date}
                onSelect={(date) => handleResponseChange(question.id, date ?? '')}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
      case 'radio':
        return (
          <RadioGroup onValueChange={(value) => handleResponseChange(question.id, value)} value={responses[question.id] as string}>
            <div className="grid grid-cols-2 gap-4">
              {question.options?.map((option) => (
                <div key={option.value} className="flex items-center">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="ml-3 text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );
      case 'checkbox':
        return (
          <div className="space-y-4">
            {question.options?.map((option) => (
              <div key={option.value} className="flex items-center">
                <Checkbox
                  id={option.value}
                  checked={(responses[question.id] as string[])?.includes(option.value) || false}
                  onCheckedChange={(checked) => 
                    handleMultiSelectChange(question.id, option.value, checked as boolean)
                  }
                />
                <Label htmlFor={option.value} className="ml-3 text-base font-medium leading-none">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );
      case 'file':
        return (
          <div className="space-y-4">
            <Input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    handleResponseChange(question.id, reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {question.helpText && (
              <p className="text-sm text-gray-500">{question.helpText}</p>
            )}
          </div>
        );
      case 'address':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                value={(responses[question.id] as string) || ''}
                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                placeholder="Enter street address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={(responses[question.id] as string) || ''}
                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                placeholder="Enter city"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={(responses[question.id] as string) || ''}
                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                placeholder="Enter state"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">Zip Code</Label>
              <Input
                id="zip"
                value={(responses[question.id] as string) || ''}
                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                placeholder="Enter zip code"
              />
            </div>
          </div>
        );
      case 'education':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="school">School Name</Label>
              <Input
                id="school"
                value={(responses[question.id] as string) || ''}
                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                placeholder="Enter school name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="degree">Degree</Label>
              <Input
                id="degree"
                value={(responses[question.id] as string) || ''}
                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                placeholder="Enter degree"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="field">Field of Study</Label>
              <Input
                id="field"
                value={(responses[question.id] as string) || ''}
                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                placeholder="Enter field of study"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="graduation">Graduation Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !responses[question.id] && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {responses[question.id] ? format(responses[question.id] as Date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={responses[question.id] as Date}
                    onSelect={(date) => handleResponseChange(question.id, date ?? '')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        );
      case 'experience':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                value={(responses[question.id] as string) || ''}
                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={(responses[question.id] as string) || ''}
                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                placeholder="Enter position"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={(responses[question.id] as string) || ''}
                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                placeholder="e.g., 2020-2023"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={(responses[question.id] as string) || ''}
                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                placeholder="Describe your responsibilities and achievements"
                className="min-h-[100px]"
              />
            </div>
          </div>
        );
      case 'reference':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="refName">Reference Name</Label>
              <Input
                id="refName"
                value={(responses[question.id] as string) || ''}
                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                placeholder="Enter reference name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refTitle">Reference Title</Label>
              <Input
                id="refTitle"
                value={(responses[question.id] as string) || ''}
                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                placeholder="Enter reference title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refEmail">Reference Email</Label>
              <Input
                id="refEmail"
                type="email"
                value={(responses[question.id] as string) || ''}
                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                placeholder="Enter reference email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refPhone">Reference Phone</Label>
              <Input
                id="refPhone"
                type="tel"
                value={(responses[question.id] as string) || ''}
                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                placeholder="Enter reference phone"
              />
            </div>
          </div>
        );
      case 'essay':
        return (
          <div className="space-y-4">
            <MarkdownEditor
              value={(responses[question.id] as string) || ''}
              onChange={(value) => handleResponseChange(question.id, value || '')}
              placeholder="Write your essay here... You can use markdown formatting for **bold**, *italic*, `code`, and more."
              height={300}
              wordCount={true}
              maxLength={question.maxLength}
              minLength={question.minLength}
              maxWords={question.maxWords}
              minWords={question.minWords}
            />
            {question.helpText && (
              <p className="text-sm text-gray-500">{question.helpText}</p>
            )}
          </div>
        );
      case 'country':
        return (
          <div className="space-y-4">
            <Label htmlFor="country">Country</Label>
            <Select
              value={(responses[question.id] as string) || ''}
              onValueChange={(value) => handleResponseChange(question.id, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent className="max-h-72 overflow-y-auto">
                {countries.map((country) => (
                  <SelectItem key={country.cca2} value={country.name.common}>
                    {country.flag} {country.name.common}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {question.helpText && (
              <p className="text-sm text-gray-500">{question.helpText}</p>
            )}
          </div>
        );
      case 'statement':
        return (
          <div className="space-y-4">
            <MarkdownEditor
              value={(responses[question.id] as string) || ''}
              onChange={(value) => handleResponseChange(question.id, value || '')}
              placeholder="Write your personal statement here... You can use markdown formatting for **bold**, *italic*, `code`, and more."
              height={300}
              wordCount={true}
              maxLength={question.maxLength}
              minLength={question.minLength}
              maxWords={question.maxWords}
              minWords={question.minWords}
            />
            {question.helpText && (
              <p className="text-sm text-gray-500">{question.helpText}</p>
            )}
          </div>
        );
      case 'gpa':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gpa">GPA/CWA</Label>
              <Input
                id="gpa"
                type="number"
                value={(responses[`${question.id}_value`] as number) || ''}
                onChange={(e) => handleResponseChange(`${question.id}_value`, parseFloat(e.target.value))}
                placeholder="Enter GPA/CWA (e.g., 3.5 or 85.5)"
                step="0.01"
                min="0"
                max="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gpaScale">Scale</Label>
              <Select
                value={(responses[`${question.id}_scale`] as string) || ''}
                onValueChange={(value) => handleResponseChange(`${question.id}_scale`, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select scale" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4.0">4.0 Scale</SelectItem>
                  <SelectItem value="4.3">4.3 Scale</SelectItem>
                  <SelectItem value="4.5">4.5 Scale</SelectItem>
                  <SelectItem value="5.0">5.0 Scale</SelectItem>
                  <SelectItem value="CWA">CWA (0-100)</SelectItem>
                  <SelectItem value="Percentage">Percentage (0-100)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 'test_score':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="testScore">Test Score</Label>
              <Input
                id="testScore"
                type="number"
                value={(responses[`${question.id}_value`] as number) || ''}
                onChange={(e) => handleResponseChange(`${question.id}_value`, parseFloat(e.target.value))}
                placeholder="Enter test score (e.g., 1500)"
                step="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testType">Test Type</Label>
              <Select
                value={(responses[`${question.id}_type`] as string) || ''}
                onValueChange={(value) => handleResponseChange(`${question.id}_type`, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select test type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAT">SAT</SelectItem>
                  <SelectItem value="ACT">ACT</SelectItem>
                  <SelectItem value="GRE">GRE</SelectItem>
                  <SelectItem value="GMAT">GMAT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <p className="text-gray-600">Question type &quot;{question.type}&quot; not yet implemented.</p>
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
        {/* Edit Mode Banner for Submitted Applications */}
        {application?.status === 'submitted' && (
          <div className="mb-6">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-blue-900">Application Submitted</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Your application has been submitted. You can still edit your responses, but changes will be saved as a new version.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
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
                    {currentSection?.questions.map((question, index) => {
                      const isAnswered = isQuestionAnswered(question);
                      const isRequiredAndUnanswered = question.required && !isAnswered;
                      
                      return (
                        <div 
                          key={question.id} 
                          className={cn(
                            "space-y-4 p-6 border rounded-lg bg-white transition-colors",
                            isRequiredAndUnanswered 
                              ? "border-red-300 bg-red-50/30" 
                              : "border-gray-200"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {index + 1}. {question.title}
                            </h3>
                            <div className="flex items-center space-x-2">
                              {isRequiredAndUnanswered && (
                                <Badge variant="destructive" className="text-xs">
                                  Missing
                                </Badge>
                              )}
                              {question.required && (
                                <Badge variant="destructive" className="text-xs">
                                  Required
                                </Badge>
                              )}
                            </div>
                          </div>
                          {question.description && (
                            <p className="text-gray-600">{question.description}</p>
                          )}
                          <div className="mt-4">
                            {renderQuestion(question)}
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Validation Banner */}
                    {!canProceed() && getMissingRequiredFields().length > 0 && (
                      <div className="mt-6 p-4 border border-red-200 bg-red-50 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-red-900">Required Fields Missing</h4>
                            <p className="text-sm text-red-700 mt-1">
                              Please complete the following required fields before proceeding:
                            </p>
                            <ul className="text-sm text-red-700 mt-2 space-y-1">
                              {getMissingRequiredFields().map((field, index) => (
                                <li key={index} className="flex items-center space-x-2">
                                  <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                                  <span>{field}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                    
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
                      
                      <div className="flex items-center space-x-2">
                        {application.status === 'ready_for_submission' && (
                          <Button
                            onClick={downloadApplication}
                            variant="outline"
                            className="flex items-center space-x-2"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </Button>
                        )}
                        
                        <Button
                          onClick={handleNext}
                          disabled={!canProceed() || isSubmitting}
                          className="flex items-center space-x-2 bg-[#007fbd] hover:bg-[#004d73] text-white"
                        >
                          <span>
                            {isLastSection ? 'Save & Review' : 'Next Section'}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
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