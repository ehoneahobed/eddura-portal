import ApplicationRequirement, { IApplicationRequirement } from '../models/ApplicationRequirement';
import RequirementsTemplate, { IRequirementsTemplate } from '../models/RequirementsTemplate';

/**
 * Requirement types for different application components
 */
export type RequirementType = 'document' | 'test_score' | 'fee' | 'interview' | 'other';

/**
 * Categories for organizing requirements
 */
export type RequirementCategory = 'academic' | 'financial' | 'personal' | 'professional' | 'administrative';

/**
 * Document types for document requirements
 */
export type DocumentType = 
  | 'personal_statement' 
  | 'cv' 
  | 'transcript' 
  | 'recommendation_letter' 
  | 'test_scores' 
  | 'portfolio' 
  | 'financial_documents' 
  | 'other';

/**
 * Test types for test score requirements
 */
export type TestType = 'toefl' | 'ielts' | 'gre' | 'gmat' | 'sat' | 'act' | 'other';

/**
 * Interview types
 */
export type InterviewType = 'in-person' | 'virtual' | 'phone' | 'multiple';

/**
 * Requirement status tracking
 */
export type RequirementStatus = 'pending' | 'in_progress' | 'completed' | 'waived' | 'not_applicable';

/**
 * Template categories for different application types
 */
export type TemplateCategory = 'graduate' | 'undergraduate' | 'scholarship' | 'custom';

/**
 * Interface for requirement creation/update
 */
export interface CreateRequirementData {
  applicationId: string;
  requirementType: RequirementType;
  category: RequirementCategory;
  name: string;
  description?: string;
  isRequired: boolean;
  isOptional: boolean;
  
  // Document-specific
  documentType?: DocumentType;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  wordLimit?: number;
  characterLimit?: number;
  
  // Test score-specific
  testType?: TestType;
  minScore?: number;
  maxScore?: number;
  scoreFormat?: string;
  
  // Application fee-specific
  applicationFeeAmount?: number;
  applicationFeeCurrency?: string;
  applicationFeeDescription?: string;
  
  // Interview-specific
  interviewType?: InterviewType;
  interviewDuration?: number;
  interviewNotes?: string;
  
  order: number;
}

/**
 * Interface for requirement update
 */
export interface UpdateRequirementData {
  status?: RequirementStatus;
  notes?: string;
  linkedDocumentId?: string;
  externalUrl?: string;
  submittedAt?: Date;
  verifiedAt?: Date;
}

/**
 * Interface for requirements progress
 */
export interface RequirementsProgress {
  total: number;
  completed: number;
  required: number;
  requiredCompleted: number;
  optional: number;
  optionalCompleted: number;
  percentage: number;
}

/**
 * Interface for requirement with progress
 */
export interface RequirementWithProgress extends IApplicationRequirement {
  progress: RequirementsProgress;
}

/**
 * Interface for application requirements summary
 */
export interface ApplicationRequirementsSummary {
  applicationId: string;
  applicationName: string;
  totalRequirements: number;
  completedRequirements: number;
  requiredRequirements: number;
  completedRequiredRequirements: number;
  optionalRequirements: number;
  completedOptionalRequirements: number;
  progressPercentage: number;
  requirementsByCategory: {
    [category in RequirementCategory]: {
      total: number;
      completed: number;
      requirements: IApplicationRequirement[];
    };
  };
  requirementsByType: {
    [type in RequirementType]: {
      total: number;
      completed: number;
      requirements: IApplicationRequirement[];
    };
  };
}

/**
 * Interface for template creation/update
 */
export interface CreateTemplateData {
  name: string;
  description?: string;
  category: TemplateCategory;
  requirements: {
    requirementType: RequirementType;
    category: RequirementCategory;
    name: string;
    description?: string;
    isRequired: boolean;
    isOptional: boolean;
    
    // Document-specific
    documentType?: string;
    maxFileSize?: number;
    allowedFileTypes?: string[];
    wordLimit?: number;
    characterLimit?: number;
    
    // Test score-specific
    testType?: string;
    minScore?: number;
    maxScore?: number;
    scoreFormat?: string;
    
    // Application fee-specific
    applicationFeeAmount?: number;
    applicationFeeCurrency?: string;
    applicationFeeDescription?: string;
    
    // Interview-specific
    interviewType?: string;
    interviewDuration?: number;
    interviewNotes?: string;
    
    order: number;
  }[];
  tags?: string[];
}

/**
 * Interface for template with usage stats
 */
export interface TemplateWithUsage extends IRequirementsTemplate {
  usageCount: number;
  isPopular: boolean;
}

/**
 * Interface for requirement filters
 */
export interface RequirementFilters {
  status?: RequirementStatus[];
  category?: RequirementCategory[];
  requirementType?: RequirementType[];
  isRequired?: boolean;
  isOptional?: boolean;
}

/**
 * Interface for requirements query options
 */
export interface RequirementsQueryOptions {
  filters?: RequirementFilters;
  sortBy?: 'name' | 'status' | 'category' | 'requirementType' | 'order' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Interface for document linking data
 */
export interface LinkDocumentData {
  requirementId: string;
  documentId: string;
  notes?: string;
}

/**
 * Interface for requirement status update
 */
export interface UpdateRequirementStatusData {
  status: RequirementStatus;
  notes?: string;
  submittedAt?: Date;
  verifiedAt?: Date;
}

/**
 * Interface for bulk requirement operations
 */
export interface BulkRequirementOperation {
  requirementIds: string[];
  operation: 'update_status' | 'link_document' | 'delete';
  data?: UpdateRequirementStatusData | LinkDocumentData;
}

/**
 * Interface for requirement analytics
 */
export interface RequirementAnalytics {
  totalRequirements: number;
  completedRequirements: number;
  pendingRequirements: number;
  inProgressRequirements: number;
  waivedRequirements: number;
  notApplicableRequirements: number;
  
  requirementsByCategory: {
    [category in RequirementCategory]: {
      total: number;
      completed: number;
      pending: number;
      inProgress: number;
    };
  };
  
  requirementsByType: {
    [type in RequirementType]: {
      total: number;
      completed: number;
      pending: number;
      inProgress: number;
    };
  };
  
  averageCompletionTime: number; // in days
  mostCommonMissingRequirements: string[];
  completionTrends: {
    date: string;
    completed: number;
    total: number;
  }[];
}

/**
 * Interface for requirement export data
 */
export interface RequirementExportData {
  applicationName: string;
  requirements: {
    name: string;
    category: string;
    type: string;
    status: string;
    isRequired: boolean;
    notes?: string;
    completedAt?: string;
  }[];
  summary: {
    total: number;
    completed: number;
    pending: number;
    progressPercentage: number;
  };
  exportedAt: string;
}

/**
 * Interface for requirement template data
 */
export interface RequirementTemplateData {
  id: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  requirements: {
    requirementType: RequirementType;
    category: RequirementCategory;
    name: string;
    description?: string;
    isRequired: boolean;
    isOptional: boolean;
    order: number;
  }[];
  usageCount: number;
  isSystemTemplate: boolean;
  tags?: string[];
}

/**
 * Interface for requirement validation errors
 */
export interface RequirementValidationError {
  field: string;
  message: string;
  value?: any;
}

/**
 * Interface for requirement validation result
 */
export interface RequirementValidationResult {
  isValid: boolean;
  errors: RequirementValidationError[];
}

/**
 * Interface for requirement search filters
 */
export interface RequirementSearchFilters {
  query?: string;
  status?: RequirementStatus[];
  category?: RequirementCategory[];
  requirementType?: RequirementType[];
  isRequired?: boolean;
  isOptional?: boolean;
  hasLinkedDocument?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
}

/**
 * Interface for requirement search result
 */
export interface RequirementSearchResult {
  requirements: IApplicationRequirement[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
} 