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
  contactEmail?: string;
  contactPhone?: string;
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
  admissionRequirements: {
    minGPA?: number;
    requiredDegrees?: string[];
    requiredTests?: { name: string; minScore: number; }[];
    lettersOfRecommendation?: number;
    requiresPersonalStatement?: boolean;
    requiresCV?: boolean;
    detailedRequirementNote?: string;
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