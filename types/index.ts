export interface School {
  id: string;
  name: string;
  country: string;
  city: string;
  types: string[];
  globalRanking?: number;
  yearFounded?: number;
  accreditationBodies?: string[];
  websiteUrl?: string;
  contactEmails?: string[];
  contactPhones?: string[];
  logoUrl?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  campusType?: 'Urban' | 'Suburban' | 'Rural' | 'Unknown';
  languagesOfInstruction?: string[];
  internationalStudentCount?: number;
  studentFacultyRatio?: string;
  housingOptions?: string[];
  supportServices?: string[];
  avgLivingCost?: number;
  visaSupportServices?: boolean;
  virtualTourLink?: string;
  /** Acceptance rate as a percentage (0-100) */
  acceptanceRate?: number;
  /** List of campus facilities (e.g., library, gym, labs) */
  campusFacilities?: string[];
  /** General climate description (e.g., temperate, tropical) */
  climate?: string;
  /** General safety rating (e.g., very safe, safe, moderate, unsafe) */
  safetyRating?: string;
  /** Optional description or link to safety/crime statistics */
  safetyDescription?: string;
  /** Are internships/co-ops available? */
  internshipsAvailable?: boolean;
  /** Description or list of internship/co-op opportunities */
  internshipsDescription?: string;
  /** Are career services available? */
  careerServicesAvailable?: boolean;
  /** Description of career services */
  careerServicesDescription?: string;
  /** Is language support available? */
  languageSupportAvailable?: boolean;
  /** Description of language support */
  languageSupportDescription?: string;
  /** Student diversity info (e.g., % international, gender ratio) */
  studentDiversity?: string;
  /** Accessibility for students with disabilities */
  accessibility?: string;
  /** Description of accessibility services */
  accessibilityDescription?: string;
  /** Transport/location info (e.g., near metro, airport) */
  transportLocation?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Program {
  id: string;
  schoolId: string;
  name: string;
  degreeType: 'Diploma' | 'Bachelor' | 'Master' | 'MBA' | 'PhD' | 'Certificate' | 'Short Course';
  fieldOfStudy: string;
  subfield?: string;
  mode: 'Full-time' | 'Part-time' | 'Online' | 'Hybrid';
  duration: string;
  languages: string[];
  applicationDeadlines: string[];
  intakeSessions: string[];
  /** Program level: Undergraduate or Postgraduate */
  programLevel: 'Undergraduate' | 'Postgraduate';
  admissionRequirements: {
    minGPA?: number;
    requiredDegrees?: string[];
    requiredTests?: { name: string; minScore: number; }[];
    lettersOfRecommendation?: number;
    requiresPersonalStatement?: boolean;
    requiresCV?: boolean;
    detailedRequirementNote?: string;
    /** SAT/ACT score for undergraduate */
    satScore?: string;
    /** GRE/GMAT score for postgraduate */
    greScore?: string;
    /** Work experience in years for postgraduate */
    workExperience?: number;
    /** Whether thesis/research is required for postgraduate */
    thesisRequired?: string;
  };
  tuitionFees: {
    local: number;
    international: number;
    currency: string;
  };
  availableScholarships?: string[];
  applicationFee?: number;
  teachingMethodology?: string[];
  careerOutcomes?: string[];
  employabilityRank?: number;
  alumniDetails?: string;
  programSummary?: string;
  vectorId?: string;
  brochureLink?: string;
  programOverview?: string;
  learningOutcomes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Scholarship {
  id: string;
  title: string;
  scholarshipDetails: string;
  provider: string;
  linkedSchool?: string;
  linkedProgram?: string;
  coverage: string[];
  value?: number | string;
  currency?: string;
  frequency: 'One-time' | 'Annual' | 'Full Duration';
  numberOfAwardsPerYear?: number;
  eligibility: {
    nationalities?: string[];
    genders?: string[];
    disabilityStatus?: boolean;
    degreeLevels?: string[];
    fieldsOfStudy?: string[];
    minGPA?: number;
    ageLimit?: string;
    countryResidency?: string[];
    incomeStatus?: string;
    additionalCriteria?: string;
  };
  applicationRequirements: {
    essay?: boolean;
    cv?: boolean;
    testScores?: boolean;
    recommendationLetters?: number;
    requirementsDescription?: string;
    documentsToSubmit?: string[];
  };
  deadline: string;
  applicationLink: string;
  selectionCriteria: string[];
  renewalConditions?: string;
  decisionTimeline?: string;
  tags?: string[];
  vectorId?: string;
  notes?: string;
  awardUsage?: string[];
  contactInfo?: {
    email?: string;
    phone?: string;
  };
  applicationMethod?: string;
  selectionProcess?: string;
  notificationMethod?: string;
  eligibleRegions?: string[];
  deferralPolicy?: string;
  infoPage?: string;
  faqLink?: string;
  disbursementDetails?: string;
  pastRecipients?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Application Template Types
export type QuestionType = 
  | 'text'           // Short text input
  | 'textarea'       // Long text input
  | 'email'          // Email input
  | 'phone'          // Phone number input
  | 'number'         // Numeric input
  | 'date'           // Date picker
  | 'select'         // Single choice dropdown
  | 'multiselect'    // Multiple choice dropdown
  | 'radio'          // Single choice radio buttons
  | 'checkbox'       // Multiple choice checkboxes
  | 'file'           // File upload
  | 'url'            // URL input
  | 'address'        // Address input
  | 'education'      // Education history
  | 'experience'     // Work experience
  | 'reference'      // Reference contact
  | 'essay'          // Essay/long form response
  | 'statement'      // Personal statement
  | 'gpa'            // GPA input with validation
  | 'test_score'     // Test scores (SAT, GRE, etc.)
  | 'country';       // Country selection dropdown

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
}

export interface FileUploadConfig {
  allowedTypes: string[];  // e.g., ['pdf', 'doc', 'docx']
  maxSize: number;         // in MB
  maxFiles?: number;       // number of files allowed
  description?: string;    // description of what files are expected
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'email' | 'url' | 'phone' | 'gpa' | 'test_score';
  value?: string | number;
  message: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  order: number;
  options?: QuestionOption[];
  fileConfig?: FileUploadConfig;
  validation?: ValidationRule[];
  conditional?: {
    dependsOn: string;  // ID of the question this depends on
    condition: 'equals' | 'not_equals' | 'contains' | 'not_contains';
    value: string;
  };
  helpText?: string;
  maxLength?: number;
  minLength?: number;
  defaultValue?: string | number | boolean;
  group?: string;  // For grouping related questions
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  questions: Question[];
  isRepeatable?: boolean;  // For sections that can be repeated (e.g., work experience)
  maxRepeats?: number;     // Maximum number of times this section can be repeated
}

export interface ApplicationTemplate {
  id: string;
  scholarshipId: string;
  title: string;
  description?: string;
  version: string;
  isActive: boolean;
  sections: FormSection[];
  estimatedTime: number;  // Estimated time to complete in minutes
  instructions?: string;  // General instructions for applicants
  submissionDeadline?: Date;
  allowDraftSaving: boolean;
  requireEmailVerification: boolean;
  requirePhoneVerification: boolean;
  maxFileSize: number;  // Maximum file size in MB
  allowedFileTypes: string[];
  createdAt?: Date;
  updatedAt?: Date;
}