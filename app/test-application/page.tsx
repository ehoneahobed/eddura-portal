'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ExpandableTextarea } from '@/components/ui/expandable-textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, ArrowRight, FileText, Clock, Save, HelpCircle, CalendarIcon, Upload, Plus, Trash2, GraduationCap, Briefcase, User, MapPin, Calculator, Award } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
// Remove React-Quill and use a simpler solution
// const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
// import 'react-quill/dist/quill.snow.css';
import countries from 'world-countries';

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
            minLength: 500,
            helpText: "Be specific about your achievements and future goals. Show how this scholarship will help you achieve them."
          }
        ]
      },
      {
        id: "essay-section",
        title: "Essay Questions",
        description: "Answer the following essay questions",
        order: 4,
        questions: [
          {
            id: "essay-question",
            type: "essay",
            title: "Why do you deserve this scholarship?",
            description: "Write a detailed essay explaining why you deserve this scholarship. Include specific examples of your achievements and how this scholarship will help you achieve your goals.",
            placeholder: "Write your essay here... You can use **bold**, *italic*, and `code` formatting.",
            required: true,
            order: 1,
            maxLength: 2000,
            minLength: 800,
            maxWords: 300,
            minWords: 150,
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
      case 'number':
      case 'url':
        return (
          <div className="space-y-4">
            <Input
              type={question.type === 'email' ? 'email' : question.type === 'number' ? 'number' : question.type === 'url' ? 'url' : 'text'}
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
                onSelect={(date: Date | undefined) => handleResponseChange(question.id, date || new Date())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
      case 'radio':
        return (
          <RadioGroup onValueChange={(value: string) => handleResponseChange(question.id, value)} value={responses[question.id] as string}>
            <div className="grid grid-cols-2 gap-4">
              {question.options?.map((option: any) => (
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
            {question.options?.map((option: any) => (
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
                    onSelect={(date: Date | undefined) => handleResponseChange(question.id, date || new Date())}
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
            <Label htmlFor="essay">Essay</Label>
            <div className="border rounded-md">
              <div className="flex border-b bg-gray-50 p-2 space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('essay') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '**' + selection + '**' + after;
                      handleResponseChange(question.id, newText);
                      setTimeout(() => {
                        textarea.setSelectionRange(start + 2, end + 2);
                        textarea.focus();
                      }, 0);
                    }
                  }}
                  className="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-100"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('essay') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '*' + selection + '*' + after;
                      handleResponseChange(question.id, newText);
                      setTimeout(() => {
                        textarea.setSelectionRange(start + 1, end + 1);
                        textarea.focus();
                      }, 0);
                    }
                  }}
                  className="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-100 italic"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('essay') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '`' + selection + '`' + after;
                      handleResponseChange(question.id, newText);
                      setTimeout(() => {
                        textarea.setSelectionRange(start + 1, end + 1);
                        textarea.focus();
                      }, 0);
                    }
                  }}
                  className="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-100 font-mono"
                >
                  Code
                </button>
              </div>
              <ExpandableTextarea
                id="essay"
                value={(responses[question.id] as string) || ''}
                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                placeholder="Write your essay here... You can use **bold**, *italic*, and `code` formatting."
                className="min-h-[200px] resize-none text-base leading-relaxed p-4 border-0 focus:ring-0"
                maxLength={question.maxLength}
                minLength={question.minLength}
                maxWords={question.maxWords}
                minWords={question.minWords}
                showCharacterCount={true}
                showWordCount={true}
                expandable={true}
                defaultExpanded={false}
              />
            </div>
            {question.helpText && (
              <p className="text-sm text-gray-500">{question.helpText}</p>
            )}
          </div>
        );
      case 'statement':
        return (
          <div className="space-y-4">
            <Label htmlFor="statement">Personal Statement</Label>
            <ExpandableTextarea
              id="statement"
              value={(responses[question.id] as string) || ''}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              placeholder="Write your personal statement here..."
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
      case 'gpa':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gpa">GPA/CWA</Label>
              <Input
                id="gpa"
                type="number"
                value={(responses[question.id] as number) || ''}
                onChange={(e) => handleResponseChange(question.id, parseFloat(e.target.value))}
                placeholder="Enter GPA/CWA (e.g., 3.5 or 85.5)"
                step="0.01"
                min="0"
                max="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gpaScale">Scale</Label>
              <Select
                value={(responses[question.id] as string) || ''}
                onValueChange={(value) => handleResponseChange(question.id, value)}
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
                value={(responses[question.id] as number) || ''}
                onChange={(e) => handleResponseChange(question.id, parseFloat(e.target.value))}
                placeholder="Enter test score (e.g., 1500)"
                step="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testType">Test Type</Label>
              <Select
                value={(responses[question.id] as string) || ''}
                onValueChange={(value) => handleResponseChange(question.id, value)}
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