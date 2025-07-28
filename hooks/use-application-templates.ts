import useSWR, { mutate } from 'swr';
import { ApplicationTemplate, FormSection, Question } from '@/types';

/**
 * Interface for application template query parameters
 */
export interface ApplicationTemplateQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  scholarshipId?: string;
  isActive?: boolean;
  sortBy?: 'title' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Interface for creating/updating application templates
 */
export interface ApplicationTemplateFormData {
  applicationType: 'scholarship' | 'school' | 'program';
  scholarshipId: string;
  title: string;
  description?: string;
  version?: string;
  isActive?: boolean;
  sections: FormSection[];
  estimatedTime: number;
  instructions?: string;
  submissionDeadline?: Date;
  allowDraftSaving?: boolean;
  requireEmailVerification?: boolean;
  requirePhoneVerification?: boolean;
  maxFileSize?: number;
  allowedFileTypes?: string[];
}

/**
 * Custom hook for fetching application templates
 */
export function useApplicationTemplates(params: ApplicationTemplateQueryParams = {}) {
  const queryString = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryString.append(key, String(value));
    }
  });

  const { data, error, isLoading, mutate: mutateData } = useSWR(
    `/api/application-templates?${queryString.toString()}`,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch application templates');
      }
      return response.json();
    }
  );

  return {
    templates: data?.templates || [],
    pagination: data?.pagination,
    error,
    isLoading,
    mutate: mutateData
  };
}

/**
 * Custom hook for fetching a single application template
 */
export function useApplicationTemplate(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/application-templates/${id}` : null,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch application template');
      }
      return response.json();
    }
  );

  return {
    template: data,
    error,
    isLoading,
    mutate
  };
}

/**
 * Create a new application template
 */
export async function createApplicationTemplate(data: ApplicationTemplateFormData): Promise<ApplicationTemplate> {
  const response = await fetch('/api/application-templates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      // If response.json() fails, create a basic error object
      errorData = { error: 'Failed to create application template' };
    }
    
    // Handle 409 conflict specifically
    if (response.status === 409) {
      const errorMessage = errorData.message || errorData.error || 'An application template already exists for this scholarship';
      const enhancedError = new Error(errorMessage);
      // Attach additional error data for the frontend to use
      (enhancedError as any).status = 409;
      (enhancedError as any).existingTemplateId = errorData.existingTemplateId;
      (enhancedError as any).existingTemplateTitle = errorData.existingTemplateTitle;
      (enhancedError as any).originalError = errorData; // Store the original error data
      throw enhancedError;
    }
    
    throw new Error(errorData.details || errorData.error || 'Failed to create application template');
  }

  return response.json();
}

/**
 * Update an existing application template
 */
export async function updateApplicationTemplate(id: string, data: Partial<ApplicationTemplateFormData>): Promise<ApplicationTemplate> {
  const response = await fetch(`/api/application-templates/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update application template');
  }

  return response.json();
}

/**
 * Delete an application template
 */
export async function deleteApplicationTemplate(id: string): Promise<void> {
  const response = await fetch(`/api/application-templates/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete application template');
  }
}

/**
 * Generate a unique ID for questions and sections
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Create a default question with common properties
 */
export function createDefaultQuestion(type: Question['type'], order: number): Question {
  return {
    id: generateId(),
    type,
    title: `Question ${order}`,
    description: '',
    placeholder: '',
    required: false,
    order,
    options: type === 'select' || type === 'multiselect' || type === 'radio' || type === 'checkbox' ? [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' }
    ] : undefined,
    fileConfig: type === 'file' ? {
      allowedTypes: ['pdf', 'doc', 'docx'],
      maxSize: 5,
      maxFiles: 1,
      description: 'Please upload your document'
    } : undefined,
    validation: [],
    helpText: '',
    group: ''
  };
}

/**
 * Create a default form section
 */
export function createDefaultSection(order: number): FormSection {
  return {
    id: generateId(),
    title: `Section ${order}`,
    description: '',
    order,
    questions: [createDefaultQuestion('text', 1)],
    isRepeatable: false,
    maxRepeats: undefined
  };
}

/**
 * Reorder questions within a section
 */
export function reorderQuestions(section: FormSection, startIndex: number, endIndex: number): FormSection {
  const result = { ...section };
  const [removed] = result.questions.splice(startIndex, 1);
  result.questions.splice(endIndex, 0, removed);
  
  // Update order numbers
  result.questions = result.questions.map((question, index) => ({
    ...question,
    order: index + 1
  }));
  
  return result;
}

/**
 * Reorder sections within a template
 */
export function reorderSections(sections: FormSection[], startIndex: number, endIndex: number): FormSection[] {
  const result = [...sections];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  
  // Update order numbers
  return result.map((section, index) => ({
    ...section,
    order: index + 1
  }));
}

/**
 * Get question type display name
 */
export function getQuestionTypeDisplayName(type: Question['type']): string {
  const typeNames: Record<Question['type'], string> = {
    text: 'Short Text',
    textarea: 'Long Text',
    email: 'Email',
    phone: 'Phone Number',
    number: 'Number',
    date: 'Date',
    select: 'Single Choice Dropdown',
    multiselect: 'Multiple Choice Dropdown',
    radio: 'Single Choice (Radio)',
    checkbox: 'Multiple Choice (Checkbox)',
    file: 'File Upload',
    url: 'URL',
    address: 'Address',
    education: 'Education History',
    experience: 'Work Experience',
    reference: 'Reference Contact',
    essay: 'Essay',
    statement: 'Personal Statement',
    gpa: 'GPA',
    test_score: 'Test Score',
    country: 'Country Selection'
  };
  
  return typeNames[type] || type;
}

/**
 * Get question type description
 */
export function getQuestionTypeDescription(type: Question['type']): string {
  const descriptions: Record<Question['type'], string> = {
    text: 'Single line text input for short answers',
    textarea: 'Multi-line text input for longer responses',
    email: 'Email address input with validation',
    phone: 'Phone number input with formatting',
    number: 'Numeric input for scores, amounts, etc.',
    date: 'Date picker for birth dates, deadlines, etc.',
    select: 'Dropdown menu for single selection',
    multiselect: 'Dropdown menu for multiple selections',
    radio: 'Radio buttons for single selection',
    checkbox: 'Checkboxes for multiple selections',
    file: 'File upload with type and size restrictions',
    url: 'URL input with validation',
    address: 'Structured address input fields',
    education: 'Education history with institution details',
    experience: 'Work experience with company details',
    reference: 'Reference contact information',
    essay: 'Long-form essay response with rich text formatting',
    statement: 'Personal statement or motivation letter',
    gpa: 'GPA/CWA input with scale validation',
    test_score: 'Standardized test scores (SAT, GRE, etc.)',
    country: 'Country selection from a comprehensive list'
  };
  
  return descriptions[type] || 'Question input field';
} 