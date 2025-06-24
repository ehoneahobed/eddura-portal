import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISchool extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const SchoolSchema: Schema = new Schema<ISchool>(
  {
    name: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    types: [{ type: String, trim: true }],
    globalRanking: { type: Number, min: 1 },
    yearFounded: { type: Number, min: 1000, max: new Date().getFullYear() },
    accreditationBodies: [{ type: String, trim: true }],
    websiteUrl: { type: String, trim: true },
    contactEmail: { 
      type: String, 
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    contactPhone: { type: String, trim: true },
    logoUrl: { type: String, trim: true },
    socialLinks: {
      facebook: { type: String, trim: true },
      twitter: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      youtube: { type: String, trim: true },
    },
    campusType: {
      type: String,
      enum: ['Urban', 'Suburban', 'Rural', 'Unknown'],
      default: 'Unknown'
    },
    languagesOfInstruction: [{ type: String, trim: true }],
    internationalStudentCount: { type: Number, min: 0 },
    studentFacultyRatio: { type: String, trim: true },
    housingOptions: [{ type: String, trim: true }],
    supportServices: [{ type: String, trim: true }],
    avgLivingCost: { type: Number, min: 0 },
    visaSupportServices: { type: Boolean, default: false },
    virtualTourLink: { type: String, trim: true },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
SchoolSchema.index({ name: 1 });
SchoolSchema.index({ country: 1, city: 1 });
SchoolSchema.index({ globalRanking: 1 });

const School: Model<ISchool> = mongoose.models.School || mongoose.model<ISchool>('School', SchoolSchema);

export default School;