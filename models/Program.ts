import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * IProgram represents an academic program offered by a school/university.
 * Each field is documented to clarify its purpose and expected values.
 */
export interface IProgram extends Document {
  /** Reference to the associated School (ObjectId) */
  schoolId: mongoose.Types.ObjectId;
  /** Name of the program (e.g., Computer Science) */
  name: string;
  /** Degree type (e.g., Bachelor, Master, PhD, etc.) */
  degreeType: 'Diploma' | 'Bachelor' | 'Master' | 'MBA' | 'PhD' | 'Certificate' | 'Short Course';
  /** Main field of study (e.g., Engineering, Business) */
  fieldOfStudy: string;
  /** Optional subfield or specialization (e.g., Artificial Intelligence) */
  subfield?: string;
  /** Mode of study (e.g., Full-time, Part-time, Online, Hybrid) */
  mode: 'Full-time' | 'Part-time' | 'Online' | 'Hybrid';
  /** Duration of the program (e.g., '2 years', '4 semesters') */
  duration: string;
  /** Languages in which the program is taught */
  languages: string[];
  /** Application deadline dates (ISO strings or formatted dates) */
  applicationDeadlines: string[];
  /** Intake sessions (e.g., 'Fall', 'Spring') */
  intakeSessions: string[];
  /** Admission requirements for the program */
  admissionRequirements: {
    /** Minimum GPA required for admission */
    minGPA?: number;
    /** Required previous degrees (e.g., 'High School Diploma') */
    requiredDegrees?: string[];
    /** Required standardized tests and minimum scores */
    requiredTests?: {
      /** Name of the test (e.g., 'TOEFL', 'GRE') */
      name: string;
      /** Minimum score required */
      minScore: number;
    }[];
    /** Number of letters of recommendation required */
    lettersOfRecommendation?: number;
    /** Whether a personal statement is required */
    requiresPersonalStatement?: boolean;
    /** Whether a CV/resume is required */
    requiresCV?: boolean;
    /** Additional details about requirements */
    detailedRequirementNote?: string;
  };
  /** Tuition fees for local and international students, and currency */
  tuitionFees: {
    /** Tuition fee for local students */
    local: number;
    /** Tuition fee for international students */
    international: number;
    /** Currency code (e.g., 'USD', 'EUR') */
    currency: string;
  };
  /** IDs of available scholarships for this program */
  availableScholarships?: string[];
  /** Application fee amount (if any) */
  applicationFee?: number;
  /** Teaching methodologies used (e.g., 'Lectures', 'Labs') */
  teachingMethodology?: string[];
  /** Typical career outcomes for graduates */
  careerOutcomes?: string[];
  /** Employability rank or score (if available) */
  employabilityRank?: number;
  /** Details about notable alumni */
  alumniDetails?: string;
  /** Short summary of the program */
  programSummary?: string;
  /** Vector ID for search/AI purposes (if used) */
  vectorId?: string;
  /** Link to a program brochure (PDF or web page) */
  brochureLink?: string;
  /** Overview/description of the program */
  programOverview?: string;
  /** Learning outcomes for students */
  learningOutcomes?: string;
  /** Program level: Undergraduate or Postgraduate */
  programLevel: 'Undergraduate' | 'Postgraduate';
  /** Date the program was created (auto-managed by Mongoose) */
  createdAt: Date;
  /** Date the program was last updated (auto-managed by Mongoose) */
  updatedAt: Date;
}

const ProgramSchema: Schema = new Schema<IProgram>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    name: { type: String, required: true, trim: true },
    degreeType: {
      type: String,
      required: true,
      enum: ['Diploma', 'Bachelor', 'Master', 'MBA', 'PhD', 'Certificate', 'Short Course'],
    },
    fieldOfStudy: { type: String, required: true, trim: true },
    subfield: { type: String, trim: true },
    mode: { 
      type: String, 
      enum: ['Full-time', 'Part-time', 'Online', 'Hybrid'], 
      required: true 
    },
    duration: { type: String, required: true, trim: true },
    languages: [{ type: String, trim: true }],
    applicationDeadlines: [{ type: String }],
    intakeSessions: [{ type: String, trim: true }],
    admissionRequirements: {
      minGPA: { type: Number, min: 0, max: 4 },
      requiredDegrees: [{ type: String, trim: true }],
      requiredTests: [
        {
          name: { type: String, required: true, trim: true },
          minScore: { type: Number, required: true, min: 0 },
        },
      ],
      lettersOfRecommendation: { type: Number, min: 0, max: 10 },
      requiresPersonalStatement: { type: Boolean, default: false },
      requiresCV: { type: Boolean, default: false },
      detailedRequirementNote: { type: String, trim: true },
    },
    tuitionFees: {
      local: { type: Number, required: true, min: 0 },
      international: { type: Number, required: true, min: 0 },
      currency: { type: String, required: true, trim: true, uppercase: true },
    },
    availableScholarships: [{ type: String, trim: true }],
    applicationFee: { type: Number, min: 0 },
    teachingMethodology: [{ type: String, trim: true }],
    careerOutcomes: [{ type: String, trim: true }],
    employabilityRank: { type: Number, min: 0, max: 100 },
    alumniDetails: { type: String, trim: true },
    programSummary: { type: String, trim: true },
    vectorId: { type: String, trim: true },
    brochureLink: { type: String, trim: true },
    programOverview: { type: String, trim: true },
    learningOutcomes: { type: String, trim: true },
    programLevel: {
      type: String,
      enum: ['Undergraduate', 'Postgraduate'],
      required: true
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate for school information
ProgramSchema.virtual('school', {
  ref: 'School',
  localField: 'schoolId',
  foreignField: '_id',
  justOne: true
});

// Indexes for better query performance
ProgramSchema.index({ schoolId: 1 });
ProgramSchema.index({ degreeType: 1 });
ProgramSchema.index({ fieldOfStudy: 1 });
ProgramSchema.index({ mode: 1 });

const Program: Model<IProgram> = mongoose.models.Program || mongoose.model<IProgram>('Program', ProgramSchema);

export default Program;