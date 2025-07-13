/**
 * Document types enum for frontend use
 */
export enum DocumentType {
  // Personal Documents
  PERSONAL_STATEMENT = 'personal_statement',
  MOTIVATION_LETTER = 'motivation_letter',
  STATEMENT_OF_PURPOSE = 'statement_of_purpose',
  RESEARCH_PROPOSAL = 'research_proposal',
  
  // Professional Documents
  CV = 'cv',
  RESUME = 'resume',
  COVER_LETTER = 'cover_letter',
  PORTFOLIO = 'portfolio',
  
  // Academic Documents
  ACADEMIC_ESSAY = 'academic_essay',
  RESEARCH_PAPER = 'research_paper',
  THESIS_PROPOSAL = 'thesis_proposal',
  DISSERTATION_PROPOSAL = 'dissertation_proposal',
  
  // Experience Documents
  WORK_EXPERIENCE = 'work_experience',
  VOLUNTEERING_EXPERIENCE = 'volunteering_experience',
  INTERNSHIP_EXPERIENCE = 'internship_experience',
  RESEARCH_EXPERIENCE = 'research_experience',
  
  // Reference Documents
  REFERENCE_LETTER = 'reference_letter',
  RECOMMENDATION_LETTER = 'recommendation_letter',
  
  // Coming Soon (Upload-based)
  SCHOOL_CERTIFICATE = 'school_certificate',
  TRANSCRIPT = 'transcript',
  DEGREE_CERTIFICATE = 'degree_certificate',
  LANGUAGE_CERTIFICATE = 'language_certificate',
  OTHER_CERTIFICATE = 'other_certificate'
}

/**
 * Document type configuration interface
 */
export interface DocumentTypeConfig {
  label: string;
  description: string;
  maxWords: number;
  placeholder: string;
  category: string;
  comingSoon?: boolean;
}

/**
 * Document type configuration for UI display and validation
 */
export const DOCUMENT_TYPE_CONFIG: Record<DocumentType, DocumentTypeConfig> = {
  [DocumentType.PERSONAL_STATEMENT]: {
    label: 'Personal Statement',
    description: 'A personal statement about your background, interests, and goals',
    maxWords: 1000,
    placeholder: 'Write your personal statement here...',
    category: 'personal'
  },
  [DocumentType.MOTIVATION_LETTER]: {
    label: 'Motivation Letter',
    description: 'A letter explaining your motivation for applying to a specific program',
    maxWords: 800,
    placeholder: 'Write your motivation letter here...',
    category: 'personal'
  },
  [DocumentType.STATEMENT_OF_PURPOSE]: {
    label: 'Statement of Purpose',
    description: 'A detailed statement explaining your academic and career objectives',
    maxWords: 1200,
    placeholder: 'Write your statement of purpose here...',
    category: 'academic'
  },
  [DocumentType.RESEARCH_PROPOSAL]: {
    label: 'Research Proposal',
    description: 'A proposal outlining your intended research project',
    maxWords: 2000,
    placeholder: 'Write your research proposal here...',
    category: 'academic'
  },
  [DocumentType.CV]: {
    label: 'CV',
    description: 'A comprehensive curriculum vitae',
    maxWords: 1500,
    placeholder: 'Write your CV here...',
    category: 'professional'
  },
  [DocumentType.RESUME]: {
    label: 'Resume',
    description: 'A concise summary of your qualifications and experience',
    maxWords: 800,
    placeholder: 'Write your resume here...',
    category: 'professional'
  },
  [DocumentType.COVER_LETTER]: {
    label: 'Cover Letter',
    description: 'A letter introducing yourself to potential employers or institutions',
    maxWords: 600,
    placeholder: 'Write your cover letter here...',
    category: 'professional'
  },
  [DocumentType.PORTFOLIO]: {
    label: 'Portfolio',
    description: 'A collection of your work samples and achievements',
    maxWords: 3000,
    placeholder: 'Write your portfolio here...',
    category: 'professional'
  },
  [DocumentType.ACADEMIC_ESSAY]: {
    label: 'Academic Essay',
    description: 'An academic essay on a specific topic',
    maxWords: 1500,
    placeholder: 'Write your academic essay here...',
    category: 'academic'
  },
  [DocumentType.RESEARCH_PAPER]: {
    label: 'Research Paper',
    description: 'A detailed research paper on a specific topic',
    maxWords: 3000,
    placeholder: 'Write your research paper here...',
    category: 'academic'
  },
  [DocumentType.THESIS_PROPOSAL]: {
    label: 'Thesis Proposal',
    description: 'A proposal for your master\'s thesis',
    maxWords: 2500,
    placeholder: 'Write your thesis proposal here...',
    category: 'academic'
  },
  [DocumentType.DISSERTATION_PROPOSAL]: {
    label: 'Dissertation Proposal',
    description: 'A proposal for your doctoral dissertation',
    maxWords: 3000,
    placeholder: 'Write your dissertation proposal here...',
    category: 'academic'
  },
  [DocumentType.WORK_EXPERIENCE]: {
    label: 'Work Experience',
    description: 'Detailed description of your work experience',
    maxWords: 1000,
    placeholder: 'Describe your work experience here...',
    category: 'experience'
  },
  [DocumentType.VOLUNTEERING_EXPERIENCE]: {
    label: 'Volunteering Experience',
    description: 'Description of your volunteering work and impact',
    maxWords: 800,
    placeholder: 'Describe your volunteering experience here...',
    category: 'experience'
  },
  [DocumentType.INTERNSHIP_EXPERIENCE]: {
    label: 'Internship Experience',
    description: 'Description of your internship experiences',
    maxWords: 800,
    placeholder: 'Describe your internship experience here...',
    category: 'experience'
  },
  [DocumentType.RESEARCH_EXPERIENCE]: {
    label: 'Research Experience',
    description: 'Description of your research projects and findings',
    maxWords: 1200,
    placeholder: 'Describe your research experience here...',
    category: 'experience'
  },
  [DocumentType.REFERENCE_LETTER]: {
    label: 'Reference Letter',
    description: 'A reference letter from a professional contact',
    maxWords: 600,
    placeholder: 'Write your reference letter here...',
    category: 'reference'
  },
  [DocumentType.RECOMMENDATION_LETTER]: {
    label: 'Recommendation Letter',
    description: 'A recommendation letter from an academic or professional contact',
    maxWords: 600,
    placeholder: 'Write your recommendation letter here...',
    category: 'reference'
  },
  [DocumentType.SCHOOL_CERTIFICATE]: {
    label: 'School Certificate',
    description: 'Upload your school certificates (Coming Soon)',
    maxWords: 0,
    placeholder: 'Document upload feature coming soon...',
    category: 'upload',
    comingSoon: true
  },
  [DocumentType.TRANSCRIPT]: {
    label: 'Transcript',
    description: 'Upload your academic transcripts (Coming Soon)',
    maxWords: 0,
    placeholder: 'Document upload feature coming soon...',
    category: 'upload',
    comingSoon: true
  },
  [DocumentType.DEGREE_CERTIFICATE]: {
    label: 'Degree Certificate',
    description: 'Upload your degree certificates (Coming Soon)',
    maxWords: 0,
    placeholder: 'Document upload feature coming soon...',
    category: 'upload',
    comingSoon: true
  },
  [DocumentType.LANGUAGE_CERTIFICATE]: {
    label: 'Language Certificate',
    description: 'Upload your language proficiency certificates (Coming Soon)',
    maxWords: 0,
    placeholder: 'Document upload feature coming soon...',
    category: 'upload',
    comingSoon: true
  },
  [DocumentType.OTHER_CERTIFICATE]: {
    label: 'Other Certificate',
    description: 'Upload other relevant certificates (Coming Soon)',
    maxWords: 0,
    placeholder: 'Document upload feature coming soon...',
    category: 'upload',
    comingSoon: true
  }
};

/**
 * Document interface for frontend use
 */
export interface Document {
  _id: string;
  title: string;
  type: DocumentType;
  content: string;
  version: number;
  isActive: boolean;
  description?: string;
  tags?: string[];
  targetProgram?: string;
  targetScholarship?: string;
  targetInstitution?: string;
  wordCount?: number;
  characterCount?: number;
  lastEditedAt: string;
  createdAt: string;
  updatedAt: string;
}