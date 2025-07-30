import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User interface representing a registered user in the Eddura platform
 */
export interface IUser extends Document {
  // Authentication & Basic Info
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  
  // Profile Information
  dateOfBirth?: Date;
  phoneNumber?: string;
  country?: string;
  city?: string;
  profilePicture?: string;
  
  // Quiz & Career Data
  quizResponses?: QuizResponses;
  quizCompleted: boolean;
  quizCompletedAt?: Date;
  careerPreferences?: CareerPreferences;
  aiAnalysis?: AIAnalysis;
  
  // Account Status
  isActive: boolean;
  lastLoginAt?: Date;
  loginCount: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * Quiz responses interface for storing career discovery quiz answers
 */
export interface QuizResponses {
  // Section 1: Education & Aspirations
  educationLevel?: string[];
  programInterest?: string[];
  academicBackground?: string[];
  careerProgression?: string[];
  previousDegreeField?: string[];
  
  // Section 2: Academic Preparation (Undergraduate)
  highSchoolSubjects?: string[];
  academicAchievements?: string[];
  
  // Section 3: Postgraduate Background
  workExperience?: string[];
  researchInterests?: string[];
  specializationGoals?: string[];
  
  // Section 4: Interest Areas
  interestAreas?: string[];
  learningApproach?: string[];
  
  // Section 5: Work Environment
  workEnvironment?: string[];
  projectMotivation?: string[];
  
  // Section 6: Work Style
  workApproach?: string[];
  conflictResolution?: string[];
  
  // Section 7: Strengths & Skills
  keyStrengths?: string[];
  skillGapResponse?: string[];
  
  // Section 8: Career Goals & Values
  careerValues?: string[];
  jobPreference?: string[];
  
  // Section 9: Academic Subjects
  academicSubjects?: string[];
  assignmentEngagement?: string[];
  
  // Section 10: Time Commitment
  timeCommitment?: string[];
  extendedCommitment?: string[];
  
  // Section 11: Budget Considerations
  financialConsiderations?: string[];
  tuitionChallenge?: string[];
  
  // Section 12: Location Preferences
  studyLocation?: string[];
  locationFactors?: string[];
  locationDecision?: string[];
  
  // Open-ended Questions
  additionalInfo?: string;
  idealDay?: string;
  nonNegotiables?: string;
  
  // Quiz metadata
  startedAt?: Date;
  completedAt?: Date;
  timeSpent?: number; // in minutes
  progress?: number; // percentage complete
}

/**
 * Career preferences interface for storing processed quiz data
 */
export interface CareerPreferences {
  primaryInterests: string[];
  workStyle: string[];
  careerGoals: string[];
  academicStrengths: string[];
  budgetRange: string;
  locationPreference: string;
  timeHorizon: string;
  personalityTraits: string[];
  skillGaps: string[];
  recommendedFields: string[];
}

/**
 * AI Analysis interface for storing AI-generated career and program recommendations
 */
export interface AIAnalysis {
  careerInsights: {
    primaryCareerPaths: Array<{
      title: string;
      description: string;
      educationRequirements: string[];
      skillsNeeded: string[];
      growthPotential: string;
      salaryRange: string;
      workEnvironment: string;
    }>;
    alternativeCareerPaths: Array<{
      title: string;
      description: string;
      educationRequirements: string[];
      skillsNeeded: string[];
      growthPotential: string;
      salaryRange: string;
      workEnvironment: string;
    }>;
    skillGaps: Array<{
      skill: string;
      importance: string;
      howToDevelop: string;
    }>;
    personalityTraits: string[];
    workStyle: string[];
  };
  programRecommendations: {
    undergraduatePrograms: Array<{
      fieldOfStudy: string;
      programType: string;
      duration: string;
      whyRecommended: string;
      careerOutcomes: string[];
      prerequisites: string[];
      costRange: string;
    }>;
    postgraduatePrograms: Array<{
      fieldOfStudy: string;
      programType: string;
      duration: string;
      whyRecommended: string;
      careerOutcomes: string[];
      prerequisites: string[];
      costRange: string;
    }>;
    specializations: Array<{
      area: string;
      description: string;
      careerRelevance: string;
    }>;
  };
  scholarshipRecommendations: {
    scholarshipTypes: Array<{
      type: string;
      description: string;
      eligibilityCriteria: string[];
      applicationTips: string[];
    }>;
    targetFields: string[];
    applicationStrategy: {
      timeline: string;
      keyDocuments: string[];
      strengthsToHighlight: string[];
    };
  };
  actionPlan: {
    immediateSteps: Array<{
      action: string;
      timeline: string;
      priority: string;
      resources: string[];
    }>;
    shortTermGoals: string[];
    longTermGoals: string[];
  };
  summary: {
    keyStrengths: string[];
    areasForDevelopment: string[];
    overallAssessment: string;
    confidenceLevel: string;
  };
  generatedAt: Date;
  analysisType: string;
}

const QuizResponsesSchema = new Schema<QuizResponses>({
  // Section 1: Education & Aspirations
  educationLevel: [{ type: String, trim: true }],
  programInterest: [{ type: String, trim: true }],
  academicBackground: [{ type: String, trim: true }],
  careerProgression: [{ type: String, trim: true }],
  previousDegreeField: [{ type: String, trim: true }],
  
  // Section 2: Academic Preparation (Undergraduate)
  highSchoolSubjects: [{ type: String, trim: true }],
  academicAchievements: [{ type: String, trim: true }],
  
  // Section 3: Postgraduate Background
  workExperience: [{ type: String, trim: true }],
  researchInterests: [{ type: String, trim: true }],
  specializationGoals: [{ type: String, trim: true }],
  
  // Section 4: Interest Areas
  interestAreas: [{ type: String, trim: true }],
  learningApproach: [{ type: String, trim: true }],
  
  // Section 5: Work Environment
  workEnvironment: [{ type: String, trim: true }],
  projectMotivation: [{ type: String, trim: true }],
  
  // Section 6: Work Style
  workApproach: [{ type: String, trim: true }],
  conflictResolution: [{ type: String, trim: true }],
  
  // Section 7: Strengths & Skills
  keyStrengths: [{ type: String, trim: true }],
  skillGapResponse: [{ type: String, trim: true }],
  
  // Section 8: Career Goals & Values
  careerValues: [{ type: String, trim: true }],
  jobPreference: [{ type: String, trim: true }],
  
  // Section 9: Academic Subjects
  academicSubjects: [{ type: String, trim: true }],
  assignmentEngagement: [{ type: String, trim: true }],
  
  // Section 10: Time Commitment
  timeCommitment: [{ type: String, trim: true }],
  extendedCommitment: [{ type: String, trim: true }],
  
  // Section 11: Budget Considerations
  financialConsiderations: [{ type: String, trim: true }],
  tuitionChallenge: [{ type: String, trim: true }],
  
  // Section 12: Location Preferences
  studyLocation: [{ type: String, trim: true }],
  locationFactors: [{ type: String, trim: true }],
  locationDecision: [{ type: String, trim: true }],
  
  // Open-ended Questions
  additionalInfo: { type: String, trim: true },
  idealDay: { type: String, trim: true },
  nonNegotiables: { type: String, trim: true },
  
  // Quiz metadata
  startedAt: { type: Date },
  completedAt: { type: Date },
  timeSpent: { type: Number, min: 0 },
  progress: { type: Number, min: 0, max: 100 }
}, { _id: false });

const CareerPreferencesSchema = new Schema<CareerPreferences>({
  primaryInterests: [{ type: String, trim: true }],
  workStyle: [{ type: String, trim: true }],
  careerGoals: [{ type: String, trim: true }],
  academicStrengths: [{ type: String, trim: true }],
  budgetRange: { type: String, trim: true },
  locationPreference: { type: String, trim: true },
  timeHorizon: { type: String, trim: true },
  personalityTraits: [{ type: String, trim: true }],
  skillGaps: [{ type: String, trim: true }],
  recommendedFields: [{ type: String, trim: true }]
}, { _id: false });

const AIAnalysisSchema = new Schema<AIAnalysis>({
  careerInsights: {
    primaryCareerPaths: [{
      title: { type: String, trim: true },
      description: { type: String, trim: true },
      educationRequirements: [{ type: String, trim: true }],
      skillsNeeded: [{ type: String, trim: true }],
      growthPotential: { type: String, trim: true },
      salaryRange: { type: String, trim: true },
      workEnvironment: { type: String, trim: true }
    }],
    alternativeCareerPaths: [{
      title: { type: String, trim: true },
      description: { type: String, trim: true },
      educationRequirements: [{ type: String, trim: true }],
      skillsNeeded: [{ type: String, trim: true }],
      growthPotential: { type: String, trim: true },
      salaryRange: { type: String, trim: true },
      workEnvironment: { type: String, trim: true }
    }],
    skillGaps: [{
      skill: { type: String, trim: true },
      importance: { type: String, trim: true },
      howToDevelop: { type: String, trim: true }
    }],
    personalityTraits: [{ type: String, trim: true }],
    workStyle: [{ type: String, trim: true }]
  },
  programRecommendations: {
    undergraduatePrograms: [{
      fieldOfStudy: { type: String, trim: true },
      programType: { type: String, trim: true },
      duration: { type: String, trim: true },
      whyRecommended: { type: String, trim: true },
      careerOutcomes: [{ type: String, trim: true }],
      prerequisites: [{ type: String, trim: true }],
      costRange: { type: String, trim: true }
    }],
    postgraduatePrograms: [{
      fieldOfStudy: { type: String, trim: true },
      programType: { type: String, trim: true },
      duration: { type: String, trim: true },
      whyRecommended: { type: String, trim: true },
      careerOutcomes: [{ type: String, trim: true }],
      prerequisites: [{ type: String, trim: true }],
      costRange: { type: String, trim: true }
    }],
    specializations: [{
      area: { type: String, trim: true },
      description: { type: String, trim: true },
      careerRelevance: { type: String, trim: true }
    }]
  },
  scholarshipRecommendations: {
    scholarshipTypes: [{
      type: { type: String, trim: true },
      description: { type: String, trim: true },
      eligibilityCriteria: [{ type: String, trim: true }],
      applicationTips: [{ type: String, trim: true }]
    }],
    targetFields: [{ type: String, trim: true }],
    applicationStrategy: {
      timeline: { type: String, trim: true },
      keyDocuments: [{ type: String, trim: true }],
      strengthsToHighlight: [{ type: String, trim: true }]
    }
  },
  actionPlan: {
    immediateSteps: [{
      action: { type: String, trim: true },
      timeline: { type: String, trim: true },
      priority: { type: String, trim: true },
      resources: [{ type: String, trim: true }]
    }],
    shortTermGoals: [{ type: String, trim: true }],
    longTermGoals: [{ type: String, trim: true }]
  },
  summary: {
    keyStrengths: [{ type: String, trim: true }],
    areasForDevelopment: [{ type: String, trim: true }],
    overallAssessment: { type: String, trim: true },
    confidenceLevel: { type: String, trim: true }
  },
  generatedAt: { type: Date, default: Date.now },
  analysisType: { type: String, trim: true }
}, { _id: false });

const UserSchema: Schema = new Schema<IUser>({
  // Authentication & Basic Info
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: true, 
    minlength: 8 
  },
  firstName: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 50 
  },
  lastName: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 50 
  },
  isEmailVerified: { 
    type: Boolean, 
    default: false 
  },
  emailVerificationToken: { 
    type: String 
  },
  emailVerificationExpires: { 
    type: Date 
  },
  passwordResetToken: { 
    type: String 
  },
  passwordResetExpires: { 
    type: Date 
  },
  
  // Profile Information
  dateOfBirth: { 
    type: Date 
  },
  phoneNumber: { 
    type: String, 
    trim: true 
  },
  country: { 
    type: String, 
    trim: true 
  },
  city: { 
    type: String, 
    trim: true 
  },
  profilePicture: { 
    type: String, 
    trim: true 
  },
  
  // Quiz & Career Data
  quizResponses: QuizResponsesSchema,
  quizCompleted: { 
    type: Boolean, 
    default: false 
  },
  quizCompletedAt: { 
    type: Date 
  },
  careerPreferences: CareerPreferencesSchema,
  aiAnalysis: AIAnalysisSchema,
  
  // Account Status
  isActive: { 
    type: Boolean, 
    default: true 
  },
  lastLoginAt: { 
    type: Date 
  },
  loginCount: { 
    type: Number, 
    default: 0 
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for quiz progress percentage
UserSchema.virtual('quizProgress').get(function() {
  if (!this.quizResponses) return 0;
  return (this.quizResponses as QuizResponses).progress || 0;
});

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Indexes for better query performance
UserSchema.index({ isEmailVerified: 1 });
UserSchema.index({ quizCompleted: 1 });
UserSchema.index({ createdAt: -1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User; 