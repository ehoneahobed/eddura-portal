import { ApplicationTemplate, FormSection, Question } from '@/types';

// Mock application templates for development
export const mockApplicationTemplates: ApplicationTemplate[] = [
  {
    id: '1',
    applicationType: 'scholarship',
    scholarshipId: 'scholarship-1',
    title: 'Undergraduate Scholarship Application',
    description: 'Application form for undergraduate scholarship programs',
    version: '1.0.0',
    isActive: true,
    sections: [
      {
        id: 'section-1',
        title: 'Personal Information',
        description: 'Basic personal details',
        order: 1,
        questions: [
          {
            id: 'question-1',
            type: 'text',
            title: 'Full Name',
            description: 'Enter your full legal name',
            placeholder: 'John Doe',
            required: true,
            order: 1
          },
          {
            id: 'question-2',
            type: 'email',
            title: 'Email Address',
            description: 'Your primary email address',
            placeholder: 'john.doe@example.com',
            required: true,
            order: 2
          },
          {
            id: 'question-3',
            type: 'phone',
            title: 'Phone Number',
            description: 'Your contact phone number',
            placeholder: '+1 (555) 123-4567',
            required: false,
            order: 3
          }
        ]
      },
      {
        id: 'section-2',
        title: 'Academic Information',
        description: 'Your educational background',
        order: 2,
        questions: [
          {
            id: 'question-4',
            type: 'gpa',
            title: 'Current GPA',
            description: 'Your current grade point average',
            placeholder: '3.8',
            required: true,
            order: 1
          },
          {
            id: 'question-5',
            type: 'textarea',
            title: 'Academic Achievements',
            description: 'List your academic achievements and awards',
            placeholder: 'Describe your academic achievements...',
            required: false,
            order: 2
          }
        ]
      }
    ],
    estimatedTime: 30,
    instructions: 'Please complete all required fields accurately.',
    allowDraftSaving: true,
    requireEmailVerification: false,
    requirePhoneVerification: false,
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'doc', 'docx'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    applicationType: 'scholarship',
    scholarshipId: 'scholarship-2',
    title: 'Graduate Scholarship Application',
    description: 'Application form for graduate scholarship programs',
    version: '1.0.0',
    isActive: true,
    sections: [
      {
        id: 'section-1',
        title: 'Personal Information',
        description: 'Basic personal details',
        order: 1,
        questions: [
          {
            id: 'question-1',
            type: 'text',
            title: 'Full Name',
            description: 'Enter your full legal name',
            placeholder: 'Jane Smith',
            required: true,
            order: 1
          },
          {
            id: 'question-2',
            type: 'email',
            title: 'Email Address',
            description: 'Your primary email address',
            placeholder: 'jane.smith@example.com',
            required: true,
            order: 2
          }
        ]
      },
      {
        id: 'section-2',
        title: 'Research Proposal',
        description: 'Your research interests and proposal',
        order: 2,
        questions: [
          {
            id: 'question-3',
            type: 'essay',
            title: 'Research Proposal',
            description: 'Describe your research proposal in detail',
            placeholder: 'Please describe your research proposal...',
            required: true,
            order: 1,
            minWords: 500,
            maxWords: 2000
          }
        ]
      }
    ],
    estimatedTime: 45,
    instructions: 'Please provide detailed responses for all questions.',
    allowDraftSaving: true,
    requireEmailVerification: true,
    requirePhoneVerification: false,
    maxFileSize: 15,
    allowedFileTypes: ['pdf', 'doc', 'docx'],
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  }
];

export function getMockTemplateById(id: string): ApplicationTemplate | null {
  return mockApplicationTemplates.find(template => template.id === id) || null;
}

export function getAllMockTemplates(): ApplicationTemplate[] {
  return mockApplicationTemplates;
}

export function updateMockTemplate(id: string, data: Partial<ApplicationTemplate>): ApplicationTemplate | null {
  const index = mockApplicationTemplates.findIndex(template => template.id === id);
  if (index === -1) return null;
  
  mockApplicationTemplates[index] = {
    ...mockApplicationTemplates[index],
    ...data,
    updatedAt: new Date()
  };
  
  return mockApplicationTemplates[index];
}

export function deleteMockTemplate(id: string): boolean {
  const index = mockApplicationTemplates.findIndex(template => template.id === id);
  if (index === -1) return false;
  
  mockApplicationTemplates.splice(index, 1);
  return true;
}