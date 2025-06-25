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
  value: number;
  currency: string;
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
  createdAt?: Date;
  updatedAt?: Date;
}