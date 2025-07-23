import mongoose from 'mongoose';
import RequirementsTemplate, { IRequirementsTemplate, TemplateCategory } from '../../models/RequirementsTemplate';
import { RequirementsService } from './RequirementsService';
import { CreateTemplateData } from '../../types/requirements';

/**
 * Service class for managing requirements templates
 * Handles template CRUD operations, usage tracking, and template application
 */
export class RequirementsTemplateService {
  
  /**
   * Create a new requirements template
   */
  static async createTemplate(data: CreateTemplateData, createdBy?: string): Promise<IRequirementsTemplate> {
    try {
      // Validate template data
      if (!data.name?.trim()) {
        throw new Error('Template name is required');
      }

      if (!data.category) {
        throw new Error('Template category is required');
      }

      if (!data.requirements || data.requirements.length === 0) {
        throw new Error('Template must have at least one requirement');
      }

      // Validate requirements
      for (const requirement of data.requirements) {
        if (!requirement.name?.trim()) {
          throw new Error('All requirements must have a name');
        }
        if (!requirement.requirementType) {
          throw new Error('All requirements must have a type');
        }
        if (!requirement.category) {
          throw new Error('All requirements must have a category');
        }
      }

      // Create the template
      const template = new RequirementsTemplate({
        ...data,
        createdBy: createdBy ? new mongoose.Types.ObjectId(createdBy) : undefined,
        isSystemTemplate: false,
        usageCount: 0
      });

      await template.save();
      return template;
    } catch (error) {
      throw new Error(`Failed to create template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all templates with optional filtering
   */
  static async getTemplates(options: {
    category?: TemplateCategory;
    isSystemTemplate?: boolean;
    isActive?: boolean;
    createdBy?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<IRequirementsTemplate[]> {
    try {
      const query: any = {};

      if (options.category) {
        query.category = options.category;
      }

      if (options.isSystemTemplate !== undefined) {
        query.isSystemTemplate = options.isSystemTemplate;
      }

      if (options.isActive !== undefined) {
        query.isActive = options.isActive;
      }

      if (options.createdBy) {
        query.createdBy = new mongoose.Types.ObjectId(options.createdBy);
      }

      const templates = await RequirementsTemplate
        .find(query)
        .sort({ usageCount: -1, name: 1 })
        .limit(options.limit || 50)
        .skip(options.offset || 0)
        .populate('createdBy', 'name email');

      return templates;
    } catch (error) {
      throw new Error(`Failed to get templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a template by ID
   */
  static async getTemplateById(templateId: string): Promise<IRequirementsTemplate | null> {
    try {
      const template = await RequirementsTemplate
        .findById(templateId)
        .populate('createdBy', 'name email');

      return template;
    } catch (error) {
      throw new Error(`Failed to get template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update a template
   */
  static async updateTemplate(
    templateId: string, 
    data: Partial<CreateTemplateData>
  ): Promise<IRequirementsTemplate> {
    try {
      const template = await RequirementsTemplate.findById(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Prevent updating system templates
      if (template.isSystemTemplate) {
        throw new Error('Cannot update system templates');
      }

      // Update fields
      Object.assign(template, data);

      await template.save();
      return template;
    } catch (error) {
      throw new Error(`Failed to update template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a template
   */
  static async deleteTemplate(templateId: string): Promise<void> {
    try {
      const template = await RequirementsTemplate.findById(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Prevent deleting system templates
      if (template.isSystemTemplate) {
        throw new Error('Cannot delete system templates');
      }

      await RequirementsTemplate.findByIdAndDelete(templateId);
    } catch (error) {
      throw new Error(`Failed to delete template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Apply a template to an application
   */
  static async applyTemplateToApplication(
    templateId: string, 
    applicationId: string
  ): Promise<void> {
    try {
      const template = await RequirementsTemplate.findById(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      if (!template.isActive) {
        throw new Error('Template is not active');
      }

      // Create requirements from template
      for (const templateRequirement of template.requirements) {
        await RequirementsService.createRequirement({
          applicationId,
          requirementType: templateRequirement.requirementType,
          category: templateRequirement.category,
          name: templateRequirement.name,
          description: templateRequirement.description,
          isRequired: templateRequirement.isRequired,
          isOptional: templateRequirement.isOptional,
          
          // Document-specific
          documentType: templateRequirement.documentType as any,
          maxFileSize: templateRequirement.maxFileSize,
          allowedFileTypes: templateRequirement.allowedFileTypes,
          wordLimit: templateRequirement.wordLimit,
          characterLimit: templateRequirement.characterLimit,
          
          // Test score-specific
          testType: templateRequirement.testType as any,
          minScore: templateRequirement.minScore,
          maxScore: templateRequirement.maxScore,
          scoreFormat: templateRequirement.scoreFormat,
          
          // Application fee-specific
          applicationFeeAmount: templateRequirement.applicationFeeAmount,
          applicationFeeCurrency: templateRequirement.applicationFeeCurrency,
          applicationFeeDescription: templateRequirement.applicationFeeDescription,
          
          // Interview-specific
          interviewType: templateRequirement.interviewType as any,
          interviewDuration: templateRequirement.interviewDuration,
          interviewNotes: templateRequirement.interviewNotes,
          
          order: templateRequirement.order
        });
      }

      // Increment template usage count
      await template.incrementUsage();
    } catch (error) {
      throw new Error(`Failed to apply template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get popular templates
   */
  static async getPopularTemplates(limit: number = 10): Promise<IRequirementsTemplate[]> {
    try {
      return await RequirementsTemplate
        .find({ isActive: true })
        .sort({ usageCount: -1 })
        .limit(limit)
        .populate('createdBy', 'name email');
    } catch (error) {
      throw new Error(`Failed to get popular templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get templates by category
   */
  static async getTemplatesByCategory(category: TemplateCategory): Promise<IRequirementsTemplate[]> {
    try {
      return await RequirementsTemplate
        .find({ category, isActive: true })
        .sort({ usageCount: -1, name: 1 })
        .populate('createdBy', 'name email');
    } catch (error) {
      throw new Error(`Failed to get templates by category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search templates
   */
  static async searchTemplates(query: string, limit: number = 20): Promise<IRequirementsTemplate[]> {
    try {
      return await RequirementsTemplate
        .find({
          $and: [
            { isActive: true },
            {
              $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { tags: { $in: [new RegExp(query, 'i')] } }
              ]
            }
          ]
        })
        .sort({ usageCount: -1, name: 1 })
        .limit(limit)
        .populate('createdBy', 'name email');
    } catch (error) {
      throw new Error(`Failed to search templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create system templates (for initial setup)
   */
  static async createSystemTemplates(): Promise<void> {
    try {
      // Check if system templates already exist
      const existingSystemTemplates = await RequirementsTemplate.find({ isSystemTemplate: true });
      if (existingSystemTemplates.length > 0) {
        return; // System templates already exist
      }

      // Graduate School Application Template
      const graduateTemplate = new RequirementsTemplate({
        name: 'Graduate School Application',
        description: 'Standard requirements for graduate school applications including documents, test scores, and fees.',
        category: 'graduate',
        isSystemTemplate: true,
        isActive: true,
        requirements: [
          {
            requirementType: 'document',
            category: 'academic',
            name: 'Academic Transcripts',
            description: 'Official transcripts from all previous institutions',
            isRequired: true,
            isOptional: false,
            documentType: 'transcript',
            maxFileSize: 10,
            allowedFileTypes: ['pdf'],
            order: 1
          },
          {
            requirementType: 'document',
            category: 'personal',
            name: 'Personal Statement',
            description: 'Statement of purpose explaining your academic and career goals',
            isRequired: true,
            isOptional: false,
            documentType: 'personal_statement',
            maxFileSize: 5,
            allowedFileTypes: ['pdf', 'doc', 'docx'],
            wordLimit: 1000,
            order: 2
          },
          {
            requirementType: 'document',
            category: 'professional',
            name: 'Curriculum Vitae/Resume',
            description: 'Detailed CV highlighting academic and professional experience',
            isRequired: true,
            isOptional: false,
            documentType: 'cv',
            maxFileSize: 5,
            allowedFileTypes: ['pdf', 'doc', 'docx'],
            order: 3
          },
          {
            requirementType: 'document',
            category: 'professional',
            name: 'Letters of Recommendation',
            description: 'Academic or professional letters of recommendation',
            isRequired: true,
            isOptional: false,
            documentType: 'recommendation_letter',
            maxFileSize: 5,
            allowedFileTypes: ['pdf', 'doc', 'docx'],
            order: 4
          },
          {
            requirementType: 'test_score',
            category: 'academic',
            name: 'GRE Scores',
            description: 'Graduate Record Examination scores',
            isRequired: true,
            isOptional: false,
            testType: 'gre',
            minScore: 260,
            maxScore: 340,
            scoreFormat: '260-340 total score',
            order: 5
          },
          {
            requirementType: 'test_score',
            category: 'academic',
            name: 'TOEFL/IELTS Scores',
            description: 'English proficiency test scores (for international students)',
            isRequired: false,
            isOptional: true,
            testType: 'toefl',
            minScore: 80,
            maxScore: 120,
            scoreFormat: '80+ total score',
            order: 6
          },
          {
            requirementType: 'fee',
            category: 'administrative',
            name: 'Application Fee',
            description: 'Non-refundable application processing fee',
            isRequired: true,
            isOptional: false,
            applicationFeeAmount: 75,
            applicationFeeCurrency: 'USD',
            applicationFeeDescription: 'Standard application fee',
            order: 7
          },
          {
            requirementType: 'interview',
            category: 'professional',
            name: 'Admissions Interview',
            description: 'Interview with admissions committee or faculty',
            isRequired: false,
            isOptional: true,
            interviewType: 'virtual',
            interviewDuration: 30,
            interviewNotes: 'May be required for competitive programs',
            order: 8
          }
        ]
      });

      // Undergraduate Application Template
      const undergraduateTemplate = new RequirementsTemplate({
        name: 'Undergraduate Application',
        description: 'Standard requirements for undergraduate college applications.',
        category: 'undergraduate',
        isSystemTemplate: true,
        isActive: true,
        requirements: [
          {
            requirementType: 'document',
            category: 'academic',
            name: 'High School Transcripts',
            description: 'Official high school transcripts',
            isRequired: true,
            isOptional: false,
            documentType: 'transcript',
            maxFileSize: 10,
            allowedFileTypes: ['pdf'],
            order: 1
          },
          {
            requirementType: 'document',
            category: 'personal',
            name: 'Personal Essay',
            description: 'Personal statement or college essay',
            isRequired: true,
            isOptional: false,
            documentType: 'personal_statement',
            maxFileSize: 5,
            allowedFileTypes: ['pdf', 'doc', 'docx'],
            wordLimit: 650,
            order: 2
          },
          {
            requirementType: 'test_score',
            category: 'academic',
            name: 'SAT/ACT Scores',
            description: 'Standardized test scores',
            isRequired: true,
            isOptional: false,
            testType: 'sat',
            minScore: 1000,
            maxScore: 1600,
            scoreFormat: '1000+ total score',
            order: 3
          },
          {
            requirementType: 'document',
            category: 'professional',
            name: 'Letters of Recommendation',
            description: 'Teacher or counselor recommendations',
            isRequired: true,
            isOptional: false,
            documentType: 'recommendation_letter',
            maxFileSize: 5,
            allowedFileTypes: ['pdf', 'doc', 'docx'],
            order: 4
          },
          {
            requirementType: 'fee',
            category: 'administrative',
            name: 'Application Fee',
            description: 'Non-refundable application processing fee',
            isRequired: true,
            isOptional: false,
            applicationFeeAmount: 50,
            applicationFeeCurrency: 'USD',
            applicationFeeDescription: 'Standard application fee',
            order: 5
          }
        ]
      });

      // Scholarship Application Template
      const scholarshipTemplate = new RequirementsTemplate({
        name: 'Scholarship Application',
        description: 'Standard requirements for scholarship applications.',
        category: 'scholarship',
        isSystemTemplate: true,
        isActive: true,
        requirements: [
          {
            requirementType: 'document',
            category: 'personal',
            name: 'Scholarship Essay',
            description: 'Essay addressing scholarship criteria and personal goals',
            isRequired: true,
            isOptional: false,
            documentType: 'personal_statement',
            maxFileSize: 5,
            allowedFileTypes: ['pdf', 'doc', 'docx'],
            wordLimit: 500,
            order: 1
          },
          {
            requirementType: 'document',
            category: 'academic',
            name: 'Academic Transcripts',
            description: 'Current academic transcripts',
            isRequired: true,
            isOptional: false,
            documentType: 'transcript',
            maxFileSize: 10,
            allowedFileTypes: ['pdf'],
            order: 2
          },
          {
            requirementType: 'document',
            category: 'professional',
            name: 'Letters of Recommendation',
            description: 'Academic or professional recommendations',
            isRequired: true,
            isOptional: false,
            documentType: 'recommendation_letter',
            maxFileSize: 5,
            allowedFileTypes: ['pdf', 'doc', 'docx'],
            order: 3
          },
          {
            requirementType: 'document',
            category: 'financial',
            name: 'Financial Documents',
            description: 'Proof of financial need or income statements',
            isRequired: false,
            isOptional: true,
            documentType: 'financial_documents',
            maxFileSize: 10,
            allowedFileTypes: ['pdf'],
            order: 4
          },
          {
            requirementType: 'interview',
            category: 'professional',
            name: 'Scholarship Interview',
            description: 'Interview with scholarship committee',
            isRequired: false,
            isOptional: true,
            interviewType: 'virtual',
            interviewDuration: 30,
            interviewNotes: 'May be required for competitive scholarships',
            order: 5
          }
        ]
      });

      // Save all templates
      await Promise.all([
        graduateTemplate.save(),
        undergraduateTemplate.save(),
        scholarshipTemplate.save()
      ]);
    } catch (error) {
      throw new Error(`Failed to create system templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get template statistics
   */
  static async getTemplateStatistics(): Promise<{
    totalTemplates: number;
    systemTemplates: number;
    userTemplates: number;
    activeTemplates: number;
    totalUsage: number;
    templatesByCategory: Record<TemplateCategory, number>;
  }> {
    try {
      const [
        totalTemplates,
        systemTemplates,
        userTemplates,
        activeTemplates,
        totalUsage,
        templatesByCategory
      ] = await Promise.all([
        RequirementsTemplate.countDocuments(),
        RequirementsTemplate.countDocuments({ isSystemTemplate: true }),
        RequirementsTemplate.countDocuments({ isSystemTemplate: false }),
        RequirementsTemplate.countDocuments({ isActive: true }),
        RequirementsTemplate.aggregate([
          { $group: { _id: null, total: { $sum: '$usageCount' } } }
        ]),
        RequirementsTemplate.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } }
        ])
      ]);

      const categoryStats: Record<TemplateCategory, number> = {
        graduate: 0,
        undergraduate: 0,
        scholarship: 0,
        custom: 0
      };

      templatesByCategory.forEach((item: any) => {
        categoryStats[item._id as TemplateCategory] = item.count;
      });

      return {
        totalTemplates,
        systemTemplates,
        userTemplates,
        activeTemplates,
        totalUsage: totalUsage[0]?.total || 0,
        templatesByCategory: categoryStats
      };
    } catch (error) {
      throw new Error(`Failed to get template statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 