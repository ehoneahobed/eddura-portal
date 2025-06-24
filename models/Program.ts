import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProgram extends Document {
  schoolId: mongoose.Types.ObjectId;
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
    requiredTests?: {
      name: string;
      minScore: number;
    }[];
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
  createdAt: Date;
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