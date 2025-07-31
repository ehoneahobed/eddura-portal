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
  
  // Reference Documents (Upload-based)
  REFERENCE_LETTER = 'reference_letter',
  RECOMMENDATION_LETTER = 'recommendation_letter',
  
  // Upload-based Documents
  SCHOOL_CERTIFICATE = 'school_certificate',
  TRANSCRIPT = 'transcript',
  DEGREE_CERTIFICATE = 'degree_certificate',
  LANGUAGE_CERTIFICATE = 'language_certificate',
  TEST_SCORES = 'test_scores',
  FINANCIAL_DOCUMENTS = 'financial_documents',
  MEDICAL_RECORDS = 'medical_records',
  LEGAL_DOCUMENTS = 'legal_documents',
  AWARDS_HONORS = 'awards_honors',
  OTHER_CERTIFICATE = 'other_certificate'
}

/**
 * Document type configuration interface
 */
export interface DocumentTypeConfig {
  label: string;
  description: string;
  maxWords: number; // Recommended word count, not a strict limit
  placeholder: string;
  category: string;
  comingSoon?: boolean;
  guidelines?: string; // Additional writing guidelines
}

/**
 * Document type configuration for UI display and validation
 */
export const DOCUMENT_TYPE_CONFIG: Record<DocumentType, DocumentTypeConfig> = {
  [DocumentType.PERSONAL_STATEMENT]: {
    label: 'Personal Statement',
    description: 'A personal statement about your background, interests, and goals',
    maxWords: 1000,
    placeholder: 'Write your personal statement here. Focus on your unique experiences, motivations, and how they relate to your academic or career goals...',
    category: 'personal',
    guidelines: 'Typically 500-1000 words. Focus on your unique story, motivations, and how your experiences have shaped your goals.'
  },
  [DocumentType.MOTIVATION_LETTER]: {
    label: 'Motivation Letter',
    description: 'A letter explaining your motivation for applying to a specific program',
    maxWords: 800,
    placeholder: 'Write your motivation letter here. Explain why you\'re interested in this specific program and how it aligns with your goals...',
    category: 'personal',
    guidelines: 'Usually 500-800 words. Be specific about the program and institution, and explain your genuine interest.'
  },
  [DocumentType.STATEMENT_OF_PURPOSE]: {
    label: 'Statement of Purpose',
    description: 'A detailed statement explaining your academic and career objectives',
    maxWords: 1200,
    placeholder: 'Write your statement of purpose here. Detail your academic background, research interests, and future career plans...',
    category: 'academic',
    guidelines: 'Typically 800-1200 words. Focus on academic achievements, research experience, and specific future plans.'
  },
  [DocumentType.RESEARCH_PROPOSAL]: {
    label: 'Research Proposal',
    description: 'A proposal outlining your intended research project',
    maxWords: 2000,
    placeholder: 'Write your research proposal here. Include your research question, methodology, expected outcomes, and timeline...',
    category: 'academic',
    guidelines: 'Usually 1500-2000 words. Include clear research questions, methodology, and expected contributions to the field.'
  },
  [DocumentType.CV]: {
    label: 'CV',
    description: 'A comprehensive curriculum vitae',
    maxWords: 1500,
    placeholder: 'Write your CV here. Include all relevant academic and professional experience, publications, presentations, and achievements...',
    category: 'professional',
    guidelines: 'Can be 2-10 pages. Include all relevant experience, publications, presentations, awards, and skills.'
  },
  [DocumentType.RESUME]: {
    label: 'Resume',
    description: 'A concise summary of your qualifications and experience',
    maxWords: 800,
    placeholder: 'Write your resume here. Focus on relevant experience, skills, and achievements in a concise format...',
    category: 'professional',
    guidelines: 'Typically 1-2 pages. Focus on relevant experience and achievements, using action verbs and quantifiable results.'
  },
  [DocumentType.COVER_LETTER]: {
    label: 'Cover Letter',
    description: 'A letter introducing yourself to potential employers or institutions',
    maxWords: 600,
    placeholder: 'Write your cover letter here. Introduce yourself, explain your interest in the position, and highlight relevant qualifications...',
    category: 'professional',
    guidelines: 'Usually 300-600 words. Tailor to the specific position and organization, highlighting relevant experience.'
  },
  [DocumentType.PORTFOLIO]: {
    label: 'Portfolio',
    description: 'A collection of your work samples and achievements',
    maxWords: 3000,
    placeholder: 'Write your portfolio here. Include descriptions of your projects, achievements, and the impact of your work...',
    category: 'professional',
    guidelines: 'Can be extensive. Include project descriptions, outcomes, and evidence of your skills and achievements.'
  },
  [DocumentType.ACADEMIC_ESSAY]: {
    label: 'Academic Essay',
    description: 'An academic essay on a specific topic',
    maxWords: 1500,
    placeholder: 'Write your academic essay here. Present a clear argument with evidence, analysis, and proper academic structure...',
    category: 'academic',
    guidelines: 'Length varies by assignment. Include a clear thesis, evidence-based arguments, and proper citations.'
  },
  [DocumentType.RESEARCH_PAPER]: {
    label: 'Research Paper',
    description: 'A detailed research paper on a specific topic',
    maxWords: 3000,
    placeholder: 'Write your research paper here. Include introduction, literature review, methodology, results, and conclusions...',
    category: 'academic',
    guidelines: 'Length varies significantly. Include thorough research, proper methodology, and comprehensive analysis.'
  },
  [DocumentType.THESIS_PROPOSAL]: {
    label: 'Thesis Proposal',
    description: 'A proposal for your master\'s thesis',
    maxWords: 2500,
    placeholder: 'Write your thesis proposal here. Include research questions, methodology, literature review, and expected outcomes...',
    category: 'academic',
    guidelines: 'Usually 2000-3000 words. Include clear research questions, methodology, and expected contributions.'
  },
  [DocumentType.DISSERTATION_PROPOSAL]: {
    label: 'Dissertation Proposal',
    description: 'A proposal for your doctoral dissertation',
    maxWords: 3000,
    placeholder: 'Write your dissertation proposal here. Include comprehensive research questions, methodology, literature review, and timeline...',
    category: 'academic',
    guidelines: 'Usually 2500-3500 words. Include comprehensive research design, methodology, and expected contributions to the field.'
  },
  [DocumentType.WORK_EXPERIENCE]: {
    label: 'Work Experience',
    description: 'Detailed description of your work experience',
    maxWords: 1000,
    placeholder: 'Describe your work experience here. Include your role, responsibilities, achievements, and the skills you developed...',
    category: 'experience',
    guidelines: 'Focus on relevant experience, achievements, and skills developed. Use specific examples and quantifiable results.'
  },
  [DocumentType.VOLUNTEERING_EXPERIENCE]: {
    label: 'Volunteering Experience',
    description: 'Description of your volunteering work and impact',
    maxWords: 800,
    placeholder: 'Describe your volunteering experience here. Include your role, the organization, impact made, and skills developed...',
    category: 'experience',
    guidelines: 'Highlight the impact of your work, skills developed, and commitment to community service.'
  },
  [DocumentType.INTERNSHIP_EXPERIENCE]: {
    label: 'Internship Experience',
    description: 'Description of your internship experiences',
    maxWords: 800,
    placeholder: 'Describe your internship experience here. Include your role, projects worked on, skills learned, and achievements...',
    category: 'experience',
    guidelines: 'Focus on projects completed, skills learned, and how the experience relates to your career goals.'
  },
  [DocumentType.RESEARCH_EXPERIENCE]: {
    label: 'Research Experience',
    description: 'Description of your research projects and findings',
    maxWords: 1200,
    placeholder: 'Describe your research experience here. Include research questions, methodology, findings, and your role in the project...',
    category: 'experience',
    guidelines: 'Include research questions, methodology, findings, and your specific contributions to the research.'
  },
  [DocumentType.REFERENCE_LETTER]: {
    label: 'Reference Letter',
    description: 'Upload reference letters from professional contacts',
    maxWords: 0,
    placeholder: 'Upload your reference letter file (PDF, DOC, DOCX, TXT)',
    category: 'upload',
    guidelines: 'Upload official reference letters from employers, supervisors, or other professional contacts who can speak to your abilities and character.'
  },
  [DocumentType.RECOMMENDATION_LETTER]: {
    label: 'Recommendation Letter',
    description: 'Upload recommendation letters from academic or professional contacts',
    maxWords: 0,
    placeholder: 'Upload your recommendation letter file (PDF, DOC, DOCX, TXT)',
    category: 'upload',
    guidelines: 'Upload official recommendation letters from teachers, professors, employers, or other qualified individuals who can recommend you.'
  },
  [DocumentType.SCHOOL_CERTIFICATE]: {
    label: 'School Certificate',
    description: 'Upload your school certificates and diplomas',
    maxWords: 0,
    placeholder: 'Upload your school certificate file (PDF, DOC, DOCX, TXT)',
    category: 'upload',
    guidelines: 'Upload official school certificates, diplomas, or other academic credentials from your educational institutions.'
  },
  [DocumentType.TRANSCRIPT]: {
    label: 'Transcript',
    description: 'Upload your academic transcripts and grade reports',
    maxWords: 0,
    placeholder: 'Upload your academic transcript file (PDF, DOC, DOCX, TXT)',
    category: 'upload',
    guidelines: 'Upload official academic transcripts, grade reports, or academic records from your educational institutions.'
  },
  [DocumentType.DEGREE_CERTIFICATE]: {
    label: 'Degree Certificate',
    description: 'Upload your degree certificates and diplomas',
    maxWords: 0,
    placeholder: 'Upload your degree certificate file (PDF, DOC, DOCX, TXT)',
    category: 'upload',
    guidelines: 'Upload official degree certificates, diplomas, or graduation certificates from universities and colleges.'
  },
  [DocumentType.LANGUAGE_CERTIFICATE]: {
    label: 'Language Certificate',
    description: 'Upload your language proficiency certificates and test scores',
    maxWords: 0,
    placeholder: 'Upload your language certificate file (PDF, DOC, DOCX, TXT)',
    category: 'upload',
    guidelines: 'Upload language proficiency certificates, test scores (IELTS, TOEFL, etc.), or other language qualification documents.'
  },
  [DocumentType.OTHER_CERTIFICATE]: {
    label: 'Other Certificate',
    description: 'Upload other relevant certificates and qualifications',
    maxWords: 0,
    placeholder: 'Upload your certificate file (PDF, DOC, DOCX, TXT)',
    category: 'upload',
    guidelines: 'Upload other relevant certificates, qualifications, awards, or professional credentials that support your applications.'
  },
  [DocumentType.TEST_SCORES]: {
    label: 'Test Scores',
    description: 'Upload standardized test scores and exam results',
    maxWords: 0,
    placeholder: 'Upload your test scores file (PDF, DOC, DOCX, TXT)',
    category: 'upload',
    guidelines: 'Upload official test scores for SAT, ACT, GRE, GMAT, TOEFL, IELTS, or other standardized tests required for your applications.'
  },
  [DocumentType.FINANCIAL_DOCUMENTS]: {
    label: 'Financial Documents',
    description: 'Upload financial statements and aid documents',
    maxWords: 0,
    placeholder: 'Upload your financial documents file (PDF, DOC, DOCX, TXT)',
    category: 'upload',
    guidelines: 'Upload bank statements, financial aid forms, scholarship award letters, or other financial documents required for your applications.'
  },
  [DocumentType.MEDICAL_RECORDS]: {
    label: 'Medical Records',
    description: 'Upload health certificates and medical documents',
    maxWords: 0,
    placeholder: 'Upload your medical records file (PDF, DOC, DOCX, TXT)',
    category: 'upload',
    guidelines: 'Upload health certificates, vaccination records, medical clearance forms, or other health-related documents required for your applications.'
  },
  [DocumentType.LEGAL_DOCUMENTS]: {
    label: 'Legal Documents',
    description: 'Upload legal identification and official documents',
    maxWords: 0,
    placeholder: 'Upload your legal documents file (PDF, DOC, DOCX, TXT)',
    category: 'upload',
    guidelines: 'Upload passports, visas, birth certificates, citizenship documents, or other legal identification required for your applications.'
  },
  [DocumentType.AWARDS_HONORS]: {
    label: 'Awards & Honors',
    description: 'Upload certificates for awards, honors, and recognition',
    maxWords: 0,
    placeholder: 'Upload your awards and honors file (PDF, DOC, DOCX, TXT)',
    category: 'upload',
    guidelines: 'Upload certificates, medals, recognition documents, or other proof of awards, honors, and achievements that support your applications.'
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
  lastEditedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Upload-based document fields
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
}