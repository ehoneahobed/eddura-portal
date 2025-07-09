// Quiz-related types that can be safely imported in client components

export interface QuizResponses {
  [key: string]: any;
}

export interface QuizQuestion {
  id: string;
  title: string;
  type: 'multiple-choice' | 'text' | 'number' | 'select';
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
}

export interface QuizSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  questions: QuizQuestion[];
} 