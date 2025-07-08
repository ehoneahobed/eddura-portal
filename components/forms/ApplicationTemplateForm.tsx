'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Copy, 
  Settings, 
  HelpCircle,
  FileText,
  Calendar,
  Clock,
  Save,
  Award,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { 
  ApplicationTemplate, 
  FormSection, 
  Question, 
  QuestionType,
  QuestionOption,
  FileUploadConfig,
  ValidationRule
} from '@/types';
import { 
  createDefaultQuestion, 
  createDefaultSection, 
  generateId,
  getQuestionTypeDisplayName,
  getQuestionTypeDescription,
  reorderQuestions,
  reorderSections
} from '@/hooks/use-application-templates';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'sonner';
import SearchableScholarshipSelect from '@/components/ui/searchable-scholarship-select';

interface ApplicationTemplateFormProps {
  template?: ApplicationTemplate;
  scholarshipId?: string;
  onSubmit: (data: Partial<ApplicationTemplate>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  allowScholarshipChange?: boolean;
}

const questionTypes: { value: QuestionType; label: string; description: string }[] = [
  { value: 'text', label: 'Short Text', description: 'Single line text input' },
  { value: 'textarea', label: 'Long Text', description: 'Multi-line text input' },
  { value: 'email', label: 'Email', description: 'Email address with validation' },
  { value: 'phone', label: 'Phone Number', description: 'Phone number input' },
  { value: 'number', label: 'Number', description: 'Numeric input' },
  { value: 'date', label: 'Date', description: 'Date picker' },
  { value: 'select', label: 'Single Choice Dropdown', description: 'Dropdown for single selection' },
  { value: 'multiselect', label: 'Multiple Choice Dropdown', description: 'Dropdown for multiple selections' },
  { value: 'radio', label: 'Single Choice (Radio)', description: 'Radio buttons for single selection' },
  { value: 'checkbox', label: 'Multiple Choice (Checkbox)', description: 'Checkboxes for multiple selections' },
  { value: 'file', label: 'File Upload', description: 'File upload with restrictions' },
  { value: 'url', label: 'URL', description: 'URL input with validation' },
  { value: 'address', label: 'Address', description: 'Structured address fields' },
  { value: 'education', label: 'Education History', description: 'Education background' },
  { value: 'experience', label: 'Work Experience', description: 'Work history' },
  { value: 'reference', label: 'Reference Contact', description: 'Reference information' },
  { value: 'essay', label: 'Essay', description: 'Long-form essay response' },
  { value: 'statement', label: 'Personal Statement', description: 'Personal statement' },
  { value: 'gpa', label: 'GPA', description: 'GPA with scale validation' },
  { value: 'test_score', label: 'Test Score', description: 'Standardized test scores' }
];

const fileTypes = [
  'pdf', 'doc', 'docx', 'txt', 'rtf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff',
  'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar', '7z'
];

export default function ApplicationTemplateForm({ 
  template, 
  scholarshipId, 
  onSubmit, 
  onCancel, 
  isLoading,
  allowScholarshipChange
}: ApplicationTemplateFormProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  // Generate a unique storage key for this form
  const storageKey = `applicationTemplateForm_${template?.id || 'new'}_${scholarshipId || 'draft'}`;

  // Function to load form data from localStorage
  const loadFormData = useCallback(() => {
    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Merge with template data, giving priority to saved data for form fields
        return {
          ...template,
          ...parsedData,
          // Always preserve the original template ID and scholarship ID
          id: template?.id,
          scholarshipId: scholarshipId || template?.scholarshipId
        };
      }
    } catch (error) {
      console.error('Error loading form data from localStorage:', error);
      toast.error('Failed to load saved form data');
    }
    return null;
  }, [storageKey, template, scholarshipId]);

  // Function to save form data to localStorage
  const saveFormData = useCallback((data: ApplicationTemplate) => {
    try {
      // Don't save if we're in the middle of submitting
      if (isLoading) return;

      setSaveStatus('saving');
      localStorage.setItem(storageKey, JSON.stringify(data));
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      
      // Clear saved status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving form data to localStorage:', error);
      setSaveStatus('error');
      toast.error('Failed to save form data');
    }
  }, [storageKey, isLoading]);

  // Function to clear saved form data
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error clearing saved form data:', error);
    }
  }, [storageKey]);

  // Initialize form with saved data or default values
  const getInitialValues = useCallback(() => {
    const savedData = loadFormData();
    if (savedData) {
      return savedData;
    }
    
    return template || {
      scholarshipId,
      title: '',
      description: '',
      version: '1.0.0',
      isActive: true,
      sections: [createDefaultSection(1)],
      estimatedTime: 30,
      instructions: '',
      allowDraftSaving: true,
      requireEmailVerification: false,
      requirePhoneVerification: false,
      maxFileSize: 10,
      allowedFileTypes: ['pdf', 'doc', 'docx']
    };
  }, [loadFormData, template, scholarshipId]);

  const { register, handleSubmit, formState: { errors }, watch, setValue, control, getValues, reset } = useForm<ApplicationTemplate>({
    defaultValues: getInitialValues()
  });

  const { fields: sections, append: appendSection, remove: removeSection, move: moveSection } = useFieldArray({
    control,
    name: 'sections'
  });

  const watchedSections = useMemo(() => watch('sections') || [], [watch]);
  const allFormData = watch();

  // Auto-save functionality
  useEffect(() => {
    // Skip auto-save on initial mount to prevent saving default values
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Skip auto-save if form is being submitted
    if (isLoading) return;

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Mark as having unsaved changes
    setHasUnsavedChanges(true);

    // Set up auto-save after 2 seconds of inactivity
    autoSaveTimeoutRef.current = setTimeout(() => {
      const currentFormData = getValues();
      saveFormData(currentFormData);
    }, 2000);

    // Cleanup timeout on unmount
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [allFormData, isLoading, getValues, saveFormData]);

  // Ensure fileConfig is initialized for file type questions
  useEffect(() => {
    const updatedSections = [...watchedSections];
    let hasChanges = false;

    updatedSections.forEach((section, sectionIndex) => {
      section.questions?.forEach((question, questionIndex) => {
        if (question.type === 'file' && !question.fileConfig) {
          question.fileConfig = { allowedTypes: [], maxSize: 5, maxFiles: 1 };
          hasChanges = true;
        }
      });
    });

    if (hasChanges) {
      setValue('sections', updatedSections);
    }
  }, [watchedSections, setValue]);

  // Warn user about unsaved changes when leaving the page
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleFormSubmit = (data: ApplicationTemplate) => {
    // Validate that we have at least one section with questions
    if (!data.sections || data.sections.length === 0) {
      toast.error('Please add at least one section to the form');
      return;
    }

    for (const section of data.sections) {
      if (!section.questions || section.questions.length === 0) {
        toast.error(`Section "${section.title}" must have at least one question`);
        return;
      }
    }

    // Clear saved data before submitting
    clearSavedData();
    onSubmit(data);
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        clearSavedData();
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  const handleRestoreFromSave = () => {
    const savedData = loadFormData();
    if (savedData) {
      reset(savedData);
      toast.success('Form data restored from saved draft');
    }
  };

  const addSection = () => {
    const newOrder = sections.length + 1;
    appendSection(createDefaultSection(newOrder));
  };

  const removeSectionHandler = (index: number) => {
    if (sections.length > 1) {
      removeSection(index);
      toast.success('Section removed');
    } else {
      toast.error('Cannot remove the last section');
    }
  };

  const duplicateSection = (index: number) => {
    const sectionToDuplicate = watchedSections[index];
    const newSection = {
      ...sectionToDuplicate,
      id: generateId(),
      title: `${sectionToDuplicate.title} (Copy)`,
      order: sections.length + 1,
      questions: sectionToDuplicate.questions.map(q => ({
        ...q,
        id: generateId()
      }))
    };
    appendSection(newSection);
    toast.success('Section duplicated');
  };

  const addQuestion = (sectionIndex: number) => {
    const section = watchedSections[sectionIndex];
    const newQuestionOrder = section.questions.length + 1;
    const newQuestion = createDefaultQuestion('text', newQuestionOrder);
    
    const updatedSections = [...watchedSections];
    updatedSections[sectionIndex].questions.push(newQuestion);
    setValue('sections', updatedSections);
  };

  const removeQuestion = (sectionIndex: number, questionIndex: number) => {
    const updatedSections = [...watchedSections];
    const section = updatedSections[sectionIndex];
    
    if (section.questions.length > 1) {
      section.questions.splice(questionIndex, 1);
      // Reorder questions
      section.questions = section.questions.map((q, index) => ({
        ...q,
        order: index + 1
      }));
      setValue('sections', updatedSections);
      toast.success('Question removed');
    } else {
      toast.error('Cannot remove the last question from a section');
    }
  };

  const duplicateQuestion = (sectionIndex: number, questionIndex: number) => {
    const updatedSections = [...watchedSections];
    const section = updatedSections[sectionIndex];
    const questionToDuplicate = section.questions[questionIndex];
    
    const newQuestion = {
      ...questionToDuplicate,
      id: generateId(),
      title: `${questionToDuplicate.title} (Copy)`,
      order: section.questions.length + 1
    };
    
    section.questions.push(newQuestion);
    setValue('sections', updatedSections);
    toast.success('Question duplicated');
  };

  const updateQuestionType = (sectionIndex: number, questionIndex: number, newType: QuestionType) => {
    const updatedSections = [...watchedSections];
    const section = updatedSections[sectionIndex];
    const question = section.questions[questionIndex];
    
    // Create new question with the new type
    const newQuestion = createDefaultQuestion(newType, question.order);
    
    // Preserve existing properties that should be kept
    newQuestion.title = question.title;
    newQuestion.description = question.description;
    newQuestion.required = question.required;
    newQuestion.helpText = question.helpText;
    newQuestion.group = question.group;
    
    // Initialize fileConfig for file type questions
    if (newType === 'file' && !newQuestion.fileConfig) {
      newQuestion.fileConfig = { allowedTypes: [], maxSize: 5, maxFiles: 1 };
    }
    
    section.questions[questionIndex] = newQuestion;
    setValue('sections', updatedSections);
  };

  const addQuestionOption = (sectionIndex: number, questionIndex: number) => {
    const updatedSections = [...watchedSections];
    const section = updatedSections[sectionIndex];
    const question = section.questions[questionIndex];
    
    if (!question.options) {
      question.options = [];
    }
    
    const newOption: QuestionOption = {
      value: `option${question.options.length + 1}`,
      label: `Option ${question.options.length + 1}`,
      description: ''
    };
    
    question.options.push(newOption);
    setValue('sections', updatedSections);
  };

  const removeQuestionOption = (sectionIndex: number, questionIndex: number, optionIndex: number) => {
    const updatedSections = [...watchedSections];
    const section = updatedSections[sectionIndex];
    const question = section.questions[questionIndex];
    
    if (question.options && question.options.length > 1) {
      question.options.splice(optionIndex, 1);
      setValue('sections', updatedSections);
      toast.success('Option removed');
    } else {
      toast.error('Cannot remove the last option');
    }
  };



  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === 'section') {
      const newSections = reorderSections(
        watchedSections,
        source.index,
        destination.index
      );
      setValue('sections', newSections);
    } else if (type === 'question') {
      const [sectionIndex] = source.droppableId.split('-');
      const section = watchedSections[parseInt(sectionIndex)];
      const newSection = reorderQuestions(
        section,
        source.index,
        destination.index
      );
      
      const updatedSections = [...watchedSections];
      updatedSections[parseInt(sectionIndex)] = newSection;
      setValue('sections', updatedSections);
    }
  };

  return (
    <div className="space-y-6">
      {/* Save Status Indicator */}
      {(saveStatus !== 'idle' || hasUnsavedChanges) && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-3">
            {saveStatus === 'saving' && (
              <>
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-700">Saving draft...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700">Draft saved automatically</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">Failed to save draft</span>
              </>
            )}
            {saveStatus === 'idle' && hasUnsavedChanges && (
              <>
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-orange-700">Unsaved changes</span>
              </>
            )}
          </div>
          {localStorage.getItem(storageKey) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRestoreFromSave}
              className="text-blue-600 hover:text-blue-700"
            >
              Restore from draft
            </Button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Template Title *</Label>
              <Input
                id="title"
                {...register('title', { required: 'Title is required' })}
                placeholder="Enter template title"
                className="h-11"
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                {...register('version')}
                placeholder="1.0.0"
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe the purpose and requirements of this application form"
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="estimatedTime">Estimated Time (minutes) *</Label>
              <Input
                id="estimatedTime"
                type="number"
                min={1}
                {...register('estimatedTime', { 
                  required: 'Estimated time is required',
                  valueAsNumber: true,
                  min: { value: 1, message: 'Must be at least 1 minute' }
                })}
                className="h-11"
              />
              {errors.estimatedTime && (
                <p className="text-sm text-red-600">{errors.estimatedTime.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
              <Input
                id="maxFileSize"
                type="number"
                min={1}
                max={100}
                {...register('maxFileSize', { valueAsNumber: true })}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="submissionDeadline">Submission Deadline</Label>
              <Input
                id="submissionDeadline"
                type="datetime-local"
                {...register('submissionDeadline')}
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions for Applicants</Label>
            <Textarea
              id="instructions"
              {...register('instructions')}
              placeholder="Provide instructions for applicants on how to complete this form"
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                {...register('isActive')}
                defaultChecked={template?.isActive ?? true}
              />
              <Label htmlFor="isActive">Active Template</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="allowDraftSaving"
                {...register('allowDraftSaving')}
                defaultChecked={template?.allowDraftSaving ?? true}
              />
              <Label htmlFor="allowDraftSaving">Allow Draft Saving</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="requireEmailVerification"
                {...register('requireEmailVerification')}
                defaultChecked={template?.requireEmailVerification ?? false}
              />
              <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="requirePhoneVerification"
                {...register('requirePhoneVerification')}
                defaultChecked={template?.requirePhoneVerification ?? false}
              />
              <Label htmlFor="requirePhoneVerification">Require Phone Verification</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Sections */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Form Sections
            </div>
            <Button
              type="button"
              onClick={addSection}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Section
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="sections" type="section">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
                  {sections.map((section, sectionIndex) => (
                    <Draggable
                      key={section.id}
                      draggableId={section.id}
                      index={sectionIndex}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="border rounded-lg p-6 bg-gray-50"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div {...provided.dragHandleProps}>
                                <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                              </div>
                              <Input
                                {...register(`sections.${sectionIndex}.title` as const)}
                                placeholder="Section Title"
                                className="w-64 h-9"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                onClick={() => duplicateSection(sectionIndex)}
                                variant="outline"
                                size="sm"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                onClick={() => removeSectionHandler(sectionIndex)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <Textarea
                            {...register(`sections.${sectionIndex}.description` as const)}
                            placeholder="Section description (optional)"
                            rows={2}
                            className="mb-4 resize-none"
                          />

                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-gray-900">Questions</h4>
                            <Button
                              type="button"
                              onClick={() => addQuestion(sectionIndex)}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              Add Question
                            </Button>
                          </div>

                          <Droppable droppableId={`${sectionIndex}-questions`} type="question">
                            {(provided) => (
                              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                                {watchedSections[sectionIndex]?.questions?.map((question, questionIndex) => (
                                  <Draggable
                                    key={question.id}
                                    draggableId={question.id}
                                    index={questionIndex}
                                  >
                                    {(provided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className="border rounded-lg p-4 bg-white"
                                      >
                                        <div className="flex items-center justify-between mb-3">
                                          <div className="flex items-center gap-2">
                                            <div {...provided.dragHandleProps}>
                                              <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                                            </div>
                                            <Select
                                              value={question.type}
                                              onValueChange={(value: QuestionType) => 
                                                updateQuestionType(sectionIndex, questionIndex, value)
                                              }
                                            >
                                              <SelectTrigger className="w-48">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {questionTypes.map((type) => (
                                                  <SelectItem key={type.value} value={type.value}>
                                                    <div>
                                                      <div className="font-medium">{type.label}</div>
                                                      <div className="text-xs text-gray-500">{type.description}</div>
                                                    </div>
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Button
                                              type="button"
                                              onClick={() => duplicateQuestion(sectionIndex, questionIndex)}
                                              variant="outline"
                                              size="sm"
                                            >
                                              <Copy className="w-4 h-4" />
                                            </Button>
                                            <Button
                                              type="button"
                                              onClick={() => removeQuestion(sectionIndex, questionIndex)}
                                              variant="outline"
                                              size="sm"
                                              className="text-red-600 hover:text-red-700"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          </div>
                                        </div>

                                        <div className="space-y-3">
                                          <Input
                                            {...register(`sections.${sectionIndex}.questions.${questionIndex}.title` as const)}
                                            placeholder="Question title"
                                            className="h-9"
                                          />

                                          <Textarea
                                            {...register(`sections.${sectionIndex}.questions.${questionIndex}.description` as const)}
                                            placeholder="Question description (optional)"
                                            rows={2}
                                            className="resize-none"
                                          />

                                          <Input
                                            {...register(`sections.${sectionIndex}.questions.${questionIndex}.placeholder` as const)}
                                            placeholder="Placeholder text"
                                            className="h-9"
                                          />

                                          <div className="flex items-center space-x-2">
                                            <Switch
                                              {...register(`sections.${sectionIndex}.questions.${questionIndex}.required` as const)}
                                              defaultChecked={question.required ?? false}
                                            />
                                            <Label>Required</Label>
                                          </div>

                                          {/* Question Options for choice-based questions */}
                                          {(question.type === 'select' || question.type === 'multiselect' || 
                                            question.type === 'radio' || question.type === 'checkbox') && (
                                            <div className="space-y-3">
                                              <div className="flex items-center justify-between">
                                                <Label>Options</Label>
                                                <Button
                                                  type="button"
                                                  onClick={() => addQuestionOption(sectionIndex, questionIndex)}
                                                  variant="outline"
                                                  size="sm"
                                                >
                                                  <Plus className="w-4 h-4" />
                                                </Button>
                                              </div>
                                              <div className="space-y-2">
                                                {question.options?.map((option, optionIndex) => (
                                                  <div key={optionIndex} className="flex items-center gap-2">
                                                    <Input
                                                      {...register(`sections.${sectionIndex}.questions.${questionIndex}.options.${optionIndex}.value` as const)}
                                                      placeholder="Value"
                                                      className="h-8"
                                                    />
                                                    <Input
                                                      {...register(`sections.${sectionIndex}.questions.${questionIndex}.options.${optionIndex}.label` as const)}
                                                      placeholder="Label"
                                                      className="h-8"
                                                    />
                                                    <Button
                                                      type="button"
                                                      onClick={() => removeQuestionOption(sectionIndex, questionIndex, optionIndex)}
                                                      variant="outline"
                                                      size="sm"
                                                      className="text-red-600 hover:text-red-700"
                                                    >
                                                      <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          {/* File Upload Configuration */}
                                          {question.type === 'file' && (
                                            <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
                                              <Label>File Upload Settings</Label>
                                              <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                  <Label className="text-sm">Max Size (MB)</Label>
                                                  <Input
                                                    type="number"
                                                    min={1}
                                                    {...register(`sections.${sectionIndex}.questions.${questionIndex}.fileConfig.maxSize` as const, { 
                                                      valueAsNumber: true,
                                                      setValueAs: (value) => value || 5
                                                    })}
                                                    className="h-8"
                                                  />
                                                </div>
                                                <div>
                                                  <Label className="text-sm">Max Files</Label>
                                                  <Input
                                                    type="number"
                                                    min={1}
                                                    {...register(`sections.${sectionIndex}.questions.${questionIndex}.fileConfig.maxFiles` as const, { 
                                                      valueAsNumber: true,
                                                      setValueAs: (value) => value || 1
                                                    })}
                                                    className="h-8"
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          )}

                                          <Textarea
                                            {...register(`sections.${sectionIndex}.questions.${questionIndex}.helpText` as const)}
                                            placeholder="Help text for this question"
                                            rows={2}
                                            className="resize-none"
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>
      </Card>

      {/* Scholarship Selector */}
      {allowScholarshipChange && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Scholarship
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Scholarship *</Label>
              <SearchableScholarshipSelect
                value={scholarshipId || ''}
                onValueChange={(value: string) => {
                  setValue('scholarshipId', value);
                }}
                placeholder="Select a scholarship for this template"
              />
            </div>
          </CardContent>
        </Card>
      )}

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            onClick={handleCancel}
            variant="outline"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </form>
    </div>
  );
} 