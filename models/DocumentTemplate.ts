import mongoose, { Schema, Document as MongooseDocument, Model } from 'mongoose';

/**
 * TemplateVariable interface for dynamic fields in templates
 */
export interface TemplateVariable {
  name: string;
  type: 'text' | 'textarea' | 'select' | 'date';
  label: string;
  placeholder?: string;
  options?: string[]; // For select type
  required?: boolean;
}

/**
 * DocumentTemplate interface representing a reusable document template
 */
export interface IDocumentTemplate extends MongooseDocument {
  name: string;
  type: string; // Use DocumentType enum in implementation
  category: string;
  description: string;
  templateContent: string;
  variables: TemplateVariable[];
  isActive: boolean;
  usageCount: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateVariableSchema: Schema = new Schema<TemplateVariable>({
  name: { type: String, required: true },
  type: { type: String, enum: ['text', 'textarea', 'select', 'date'], required: true },
  label: { type: String, required: true },
  placeholder: { type: String },
  options: [{ type: String }],
  required: { type: Boolean, default: false },
}, { _id: false });

const DocumentTemplateSchema: Schema = new Schema<IDocumentTemplate>({
  name: { type: String, required: true, maxlength: 100 },
  type: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true, maxlength: 500 },
  templateContent: { type: String, required: true },
  variables: { type: [TemplateVariableSchema], default: [] },
  isActive: { type: Boolean, default: true },
  usageCount: { type: Number, default: 0 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
}, {
  timestamps: true,
});

// Indexes for performance
DocumentTemplateSchema.index({ type: 1, category: 1 });
DocumentTemplateSchema.index({ isActive: 1 });
DocumentTemplateSchema.index({ createdAt: -1 });

const DocumentTemplate: Model<IDocumentTemplate> = mongoose.models.DocumentTemplate || mongoose.model<IDocumentTemplate>('DocumentTemplate', DocumentTemplateSchema);

export default DocumentTemplate; 