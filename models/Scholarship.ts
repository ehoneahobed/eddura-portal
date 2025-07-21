import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IScholarship extends Document {
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
  openingDate?: string; // When applications open
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
  
  // Relationship fields
  /** Linked school names (not IDs for flexibility) */
  linkedSchools?: string[];
  /** Linked program names */
  linkedPrograms?: string[];
  /** Linked school IDs (for schools in our system) */
  linkedSchoolIds?: mongoose.Types.ObjectId[];
  /** Linked program IDs (for programs in our system) */
  linkedProgramIds?: mongoose.Types.ObjectId[];
  
  // Application integration
  /** Whether we provide an application form */
  hasApplicationForm?: boolean;
  /** Reference to ApplicationTemplate */
  applicationFormId?: mongoose.Types.ObjectId;
  /** Whether scholarship requires interview */
  requiresInterview?: boolean;
  /** Type of interview required */
  interviewType?: 'in-person' | 'virtual' | 'phone';
  
  // Scholarship-specific requirements
  /** Additional scholarship requirements */
  scholarshipRequirements?: {
    /** Additional documents beyond program requirements */
    documents: string[];
    /** Additional criteria */
    additionalCriteria?: string;
    /** Application deadline */
    applicationDeadline: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const ScholarshipSchema: Schema = new Schema<IScholarship>(
  {
    title: { type: String, required: true, trim: true },
    scholarshipDetails: { type: String, required: true, trim: true },
    provider: { type: String, required: true, trim: true },
    linkedSchool: { type: String, trim: true },
    linkedProgram: { type: String, trim: true },
    coverage: [{ type: String, required: true, trim: true }],
    value: { 
      type: Schema.Types.Mixed,
      validate: {
        validator: function(value: any) {
          // Allow undefined, null, empty string, number, or non-empty string
          if (value === undefined || value === null || value === '') return true;
          if (typeof value === 'number') return value >= 0;
          if (typeof value === 'string') return true; // Allow any string, including empty
          return false;
        },
        message: 'Value must be a non-negative number or a string'
      }
    },
    currency: { type: String, trim: true, uppercase: true },
    frequency: {
      type: String,
      enum: ['One-time', 'Annual', 'Full Duration'],
      required: true,
    },
    numberOfAwardsPerYear: { type: Number, min: 1 },
    eligibility: {
      nationalities: [{ type: String, trim: true }],
      genders: [{ type: String, trim: true }],
      disabilityStatus: { type: Boolean },
      degreeLevels: [{ type: String, trim: true }],
      fieldsOfStudy: [{ type: String, trim: true }],
      minGPA: { type: Number, min: 0, max: 4 },
      ageLimit: { type: String, trim: true },
      countryResidency: [{ type: String, trim: true }],
      incomeStatus: { type: String, trim: true },
      additionalCriteria: { type: String, trim: true },
    },
    applicationRequirements: {
      essay: { type: Boolean, default: false },
      cv: { type: Boolean, default: false },
      testScores: { type: Boolean, default: false },
      recommendationLetters: { type: Number, min: 0, max: 10 },
      requirementsDescription: { type: String, trim: true },
      documentsToSubmit: [{ type: String, trim: true }],
    },
    deadline: { type: String, required: true },
    openingDate: { type: String, trim: true }, // When applications open
    applicationLink: { 
      type: String, 
      required: true, 
      trim: true,
      match: [/^https?:\/\/.+/, 'Please enter a valid URL']
    },
    selectionCriteria: [{ type: String, trim: true }],
    renewalConditions: { type: String, trim: true },
    decisionTimeline: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    vectorId: { type: String, trim: true },
    notes: { type: String, trim: true },
    awardUsage: [{ type: String, trim: true }],
    contactInfo: {
      email: { type: String, trim: true },
      phone: { type: String, trim: true },
    },
    applicationMethod: { type: String, trim: true },
    selectionProcess: { type: String, trim: true },
    notificationMethod: { type: String, trim: true },
    eligibleRegions: [{ type: String, trim: true }],
    deferralPolicy: { type: String, trim: true },
    infoPage: { type: String, trim: true },
    faqLink: { type: String, trim: true },
    disbursementDetails: { type: String, trim: true },
    pastRecipients: { type: String, trim: true },
    
    // Relationship fields
    linkedSchools: [{ type: String, trim: true }],
    linkedPrograms: [{ type: String, trim: true }],
    linkedSchoolIds: [{ type: Schema.Types.ObjectId, ref: 'School' }],
    linkedProgramIds: [{ type: Schema.Types.ObjectId, ref: 'Program' }],
    
    // Application integration
    hasApplicationForm: { type: Boolean, default: false },
    applicationFormId: { type: Schema.Types.ObjectId, ref: 'ApplicationTemplate' },
    requiresInterview: { type: Boolean, default: false },
    interviewType: {
      type: String,
      enum: ['in-person', 'virtual', 'phone']
    },
    
    // Scholarship-specific requirements
    scholarshipRequirements: {
      documents: [{ type: String, trim: true }],
      additionalCriteria: { type: String, trim: true },
      applicationDeadline: { type: String, required: true }
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
ScholarshipSchema.index({ provider: 1 });
ScholarshipSchema.index({ deadline: 1 });
ScholarshipSchema.index({ openingDate: 1 });
ScholarshipSchema.index({ value: -1 });
ScholarshipSchema.index({ 'eligibility.degreeLevels': 1 });
ScholarshipSchema.index({ title: 1 }); // For alphabetical sorting
ScholarshipSchema.index({ createdAt: -1 }); // For newest/oldest sorting

const Scholarship: Model<IScholarship> = mongoose.models.Scholarship || mongoose.model<IScholarship>('Scholarship', ScholarshipSchema);

export default Scholarship;