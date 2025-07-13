'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, FileText, Clock, Save, HelpCircle } from 'lucide-react';
import Link from 'next/link';

// Mock data to simulate the application form
const mockApplication = {
  scholarshipId: {
    title: "Merit Scholarship 2024",
    value: 5000,
    currency: "USD",
    deadline: "2024-12-31"
  },
  applicationTemplateId: {
    title: "Merit Scholarship Application",
    estimatedTime: 30,
    sections: [
      {
        id: "personal-info",
        title: "Personal Information",
        description: "Please provide your basic personal details",
        order: 1,
        questions: [
          {
            id: "full-name",
            type: "text",
            title: "Full Name",
            description: "Enter your legal full name as it appears on official documents",
            placeholder: "Enter your full name",
            required: true,
            order: 1
          },
          {
            id: "email",
            type: "email",
            title: "Email Address",
            description: "We'll use this email to communicate with you about your application",
            placeholder: "your.email@example.com",
            required: true,
            order: 2
          },
          {
            id: "phone",
            type: "phone",
            title: "Phone Number",
            description: "Your primary contact number",
            placeholder: "+1 (555) 123-4567",
            required: false,
            order: 3
          }
        ]
      },
      {
        id: "academic-info",
        title: "Academic Information",
        description: "Tell us about your educational background",
        order: 2,
        questions: [
          {
            id: "gpa",
            type: "number",
            title: "Current GPA",
            description: "Your current Grade Point Average",
            placeholder: "3.8",
            required: true,
            order: 1
          },
          {
            id: "major",
            type: "select",
            title: "Field of Study",
            description: "What are you studying?",
            required: true,
            order: 2,
            options: [
              { value: "computer-science", label: "Computer Science" },
              { value: "engineering", label: "Engineering" },
              { value: "business", label: "Business" },
              { value: "arts", label: "Arts & Humanities" },
              { value: "sciences", label: "Natural Sciences" },
              { value: "other", label: "Other" }
            ]
          },
          {
            id: "interests",
            type: "multiselect",
            title: "Areas of Interest",
            description: "Select all areas that interest you",
            required: false,
            order: 3,
            options: [
              { value: "research", label: "Research", description: "Academic research and development" },
              { value: "leadership", label: "Leadership", description: "Student leadership and organizations" },
              { value: "community", label: "Community Service", description: "Volunteering and community involvement" },
              { value: "sports", label: "Athletics", description: "Sports and physical activities" },
              { value: "arts", label: "Arts & Culture", description: "Creative arts and cultural activities" }
            ]
          }
        ]
      },
      {
        id: "essay",
        title: "Personal Statement",
        description: "Tell us about yourself and why you deserve this scholarship",
        order: 3,
        questions: [
          {
            id: "personal-statement",
            type: "textarea",
            title: "Personal Statement",
            description: "Write a compelling personal statement explaining your goals, achievements, and why you deserve this scholarship. (500-1000 words)",
            placeholder: "Start writing your personal statement here...",
            required: true,
            order: 1,
            maxLength: 1000,
            helpText: "Be specific about your achievements and future goals. Show how this scholarship will help you achieve them."
          }
        ]
      }
    ]
  },
  progress: 33,
  status: "in_progress"
};

export default function TestApplicationPage() {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [showHelp, setShowHelp] = useState(false);

  const currentSection = mockApplication.applicationTemplateId.sections[currentSectionIndex];
  const isLastSection = currentSectionIndex === mockApplication.applicationTemplateId.sections.length - 1;
  const isFirstSection = currentSectionIndex === 0;

  // Calculate section progress
  const sectionProgress = currentSection?.questions.length > 0 
    ? (currentSection.questions.filter((q: any) => responses[q.id]).length / currentSection.questions.length) * 100 
    : 0;

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
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

  const canProceed = () => {
    if (!currentSection) return false;
    
    const requiredQuestions = currentSection.questions.filter((q: any) => q.required);
    return requiredQuestions.every((question: any) => {
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

  const renderQuestion = (question: any) => {
    switch (question.type) {
      case 'multiselect':
        return (
          <div className="space-y-4">
            {question.options?.map((option: any) => (
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
              {question.options?.map((option: any) => (
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
      case 'number':
        return (
          <div className="space-y-4">
            <Input
              type={question.type === 'email' ? 'email' : question.type === 'number' ? 'number' : 'text'}
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
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#007fbd] rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-[#00334e]">{mockApplication.scholarshipId.title}</h1>
              </Link>
              <div className="hidden sm:block">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Clock className="w-3 h-3 mr-1" />
                  {mockApplication.applicationTemplateId.estimatedTime} min
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
                  currentSection?.questions.forEach((question: any) => {
                    if (responses[question.id]) {
                      handleResponseChange(question.id, responses[question.id]);
                    }
                  });
                  alert('Section saved!');
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
              Section {currentSectionIndex + 1} of {mockApplication.applicationTemplateId.sections.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(mockApplication.progress)}% Complete
            </span>
          </div>
          <Progress value={mockApplication.progress} className="h-2" />
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
                    <p className="mt-1">Scholarship: {mockApplication.scholarshipId.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Content - All Questions in Section */}
          <div className="lg:col-span-4">
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
                {currentSection?.questions.map((question: any, index: number) => (
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
                    onClick={() => setCurrentSectionIndex((prev: number) => prev - 1)}
                    disabled={isFirstSection}
                    className="flex items-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous Section</span>
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      Section {currentSectionIndex + 1} of {mockApplication.applicationTemplateId.sections.length}
                    </span>
                  </div>
                  
                  <Button
                    onClick={() => {
                      if (isLastSection) {
                        alert('Application submitted successfully!');
                      } else {
                        setCurrentSectionIndex((prev: number) => prev + 1);
                      }
                    }}
                    disabled={!canProceed()}
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