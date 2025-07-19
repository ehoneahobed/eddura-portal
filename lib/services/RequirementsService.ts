import mongoose from 'mongoose';
import ApplicationRequirement, { IApplicationRequirement, RequirementStatus } from '../../models/ApplicationRequirement';
import Application from '../../models/Application';
import { 
  CreateRequirementData, 
  UpdateRequirementData, 
  RequirementsProgress,
  RequirementsQueryOptions,
  RequirementFilters,
  RequirementValidationResult,
  RequirementValidationError
} from '../../types/requirements';

/**
 * Service class for managing application requirements
 * Handles CRUD operations, progress tracking, and validation
 */
export class RequirementsService {
  
  /**
   * Create a new requirement for an application
   */
  static async createRequirement(data: CreateRequirementData): Promise<IApplicationRequirement> {
    try {
      // Validate the requirement data
      const validation = this.validateRequirementData(data);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      // Check if application exists
      const application = await Application.findById(data.applicationId);
      if (!application) {
        throw new Error('Application not found');
      }

      // Create the requirement
      const requirement = new ApplicationRequirement({
        ...data,
        applicationId: new mongoose.Types.ObjectId(data.applicationId),
        status: 'pending'
      });

      await requirement.save();

      // Update application's requirements array
      await Application.findByIdAndUpdate(
        data.applicationId,
        { $push: { requirements: requirement._id } }
      );

      // Update application progress
      await this.updateApplicationProgress(data.applicationId);

      return requirement;
    } catch (error) {
      throw new Error(`Failed to create requirement: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get requirements for an application
   */
  static async getRequirementsByApplication(
    applicationId: string, 
    options: RequirementsQueryOptions = {}
  ): Promise<IApplicationRequirement[]> {
    try {
      const query: any = { applicationId: new mongoose.Types.ObjectId(applicationId) };

      // Apply filters
      if (options.filters) {
        if (options.filters.status?.length) {
          query.status = { $in: options.filters.status };
        }
        if (options.filters.category?.length) {
          query.category = { $in: options.filters.category };
        }
        if (options.filters.requirementType?.length) {
          query.requirementType = { $in: options.filters.requirementType };
        }
        if (options.filters.isRequired !== undefined) {
          query.isRequired = options.filters.isRequired;
        }
        if (options.filters.isOptional !== undefined) {
          query.isOptional = options.filters.isOptional;
        }
      }

      // Build sort object
      const sort: any = {};
      if (options.sortBy) {
        sort[options.sortBy] = options.sortOrder === 'desc' ? -1 : 1;
      } else {
        sort.order = 1; // Default sort by order
      }

      // Execute query
      const requirements = await ApplicationRequirement
        .find(query)
        .sort(sort)
        .limit(options.limit || 100)
        .skip(options.offset || 0)
        .populate('linkedDocument')
        .populate('task');

      return requirements;
    } catch (error) {
      throw new Error(`Failed to get requirements: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a single requirement by ID
   */
  static async getRequirementById(requirementId: string): Promise<IApplicationRequirement | null> {
    try {
      const requirement = await ApplicationRequirement
        .findById(requirementId)
        .populate('linkedDocument')
        .populate('task')
        .populate('application');

      return requirement;
    } catch (error) {
      throw new Error(`Failed to get requirement: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update a requirement
   */
  static async updateRequirement(
    requirementId: string, 
    data: UpdateRequirementData
  ): Promise<IApplicationRequirement> {
    try {
      const requirement = await ApplicationRequirement.findById(requirementId);
      if (!requirement) {
        throw new Error('Requirement not found');
      }

      // Update fields
      Object.assign(requirement, data);

      // Set timestamps for status changes
      if (data.status === 'completed' && !requirement.submittedAt) {
        requirement.submittedAt = new Date();
      }
      if (data.status === 'completed' && !requirement.verifiedAt) {
        requirement.verifiedAt = new Date();
      }

      await requirement.save();

      // Update application progress
      await this.updateApplicationProgress(requirement.applicationId.toString());

      return requirement;
    } catch (error) {
      throw new Error(`Failed to update requirement: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a requirement
   */
  static async deleteRequirement(requirementId: string): Promise<void> {
    try {
      const requirement = await ApplicationRequirement.findById(requirementId);
      if (!requirement) {
        throw new Error('Requirement not found');
      }

      const applicationId = requirement.applicationId;

      // Delete the requirement
      await ApplicationRequirement.findByIdAndDelete(requirementId);

      // Remove from application's requirements array
      await Application.findByIdAndUpdate(
        applicationId,
        { $pull: { requirements: requirementId } }
      );

      // Update application progress
      await this.updateApplicationProgress(applicationId.toString());
    } catch (error) {
      throw new Error(`Failed to delete requirement: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update requirement status
   */
  static async updateRequirementStatus(
    requirementId: string, 
    status: RequirementStatus, 
    notes?: string
  ): Promise<IApplicationRequirement> {
    try {
      const requirement = await ApplicationRequirement.findById(requirementId);
      if (!requirement) {
        throw new Error('Requirement not found');
      }

      return await requirement.updateStatus(status, notes);
    } catch (error) {
      throw new Error(`Failed to update requirement status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Link a document to a requirement
   */
  static async linkDocumentToRequirement(
    requirementId: string, 
    documentId: string, 
    notes?: string
  ): Promise<IApplicationRequirement> {
    try {
      const requirement = await ApplicationRequirement.findById(requirementId);
      if (!requirement) {
        throw new Error('Requirement not found');
      }

      requirement.linkedDocumentId = new mongoose.Types.ObjectId(documentId);
      requirement.status = 'completed';
      requirement.submittedAt = new Date();
      if (notes) {
        requirement.notes = notes;
      }

      await requirement.save();

      // Update application progress
      await this.updateApplicationProgress(requirement.applicationId.toString());

      return requirement;
    } catch (error) {
      throw new Error(`Failed to link document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate progress for an application's requirements
   */
  static async calculateApplicationProgress(applicationId: string): Promise<RequirementsProgress> {
    try {
      const requirements = await ApplicationRequirement.find({
        applicationId: new mongoose.Types.ObjectId(applicationId)
      });

      const total = requirements.length;
      const completed = requirements.filter(req => 
        req.status === 'completed' || req.status === 'waived' || req.status === 'not_applicable'
      ).length;
      
      const required = requirements.filter(req => req.isRequired && !req.isOptional).length;
      const requiredCompleted = requirements.filter(req => 
        (req.isRequired && !req.isOptional) && 
        (req.status === 'completed' || req.status === 'waived' || req.status === 'not_applicable')
      ).length;
      
      const optional = requirements.filter(req => req.isOptional).length;
      const optionalCompleted = requirements.filter(req => 
        req.isOptional && 
        (req.status === 'completed' || req.status === 'waived' || req.status === 'not_applicable')
      ).length;

      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        total,
        completed,
        required,
        requiredCompleted,
        optional,
        optionalCompleted,
        percentage
      };
    } catch (error) {
      throw new Error(`Failed to calculate progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update application progress in the database
   */
  static async updateApplicationProgress(applicationId: string): Promise<void> {
    try {
      const progress = await this.calculateApplicationProgress(applicationId);
      
      await Application.findByIdAndUpdate(applicationId, {
        requirementsProgress: progress,
        progress: progress.percentage
      });
    } catch (error) {
      throw new Error(`Failed to update application progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get requirements summary for an application
   */
  static async getApplicationRequirementsSummary(applicationId: string) {
    try {
      const application = await Application.findById(applicationId);
      if (!application) {
        throw new Error('Application not found');
      }

      const requirements = await this.getRequirementsByApplication(applicationId);
      const progress = await this.calculateApplicationProgress(applicationId);

      // Group requirements by category
      const requirementsByCategory = {
        academic: { total: 0, completed: 0, requirements: [] as IApplicationRequirement[] },
        financial: { total: 0, completed: 0, requirements: [] as IApplicationRequirement[] },
        personal: { total: 0, completed: 0, requirements: [] as IApplicationRequirement[] },
        professional: { total: 0, completed: 0, requirements: [] as IApplicationRequirement[] },
        administrative: { total: 0, completed: 0, requirements: [] as IApplicationRequirement[] }
      };

      // Group requirements by type
      const requirementsByType = {
        document: { total: 0, completed: 0, requirements: [] as IApplicationRequirement[] },
        test_score: { total: 0, completed: 0, requirements: [] as IApplicationRequirement[] },
        fee: { total: 0, completed: 0, requirements: [] as IApplicationRequirement[] },
        interview: { total: 0, completed: 0, requirements: [] as IApplicationRequirement[] },
        other: { total: 0, completed: 0, requirements: [] as IApplicationRequirement[] }
      };

      requirements.forEach(requirement => {
        // Update category stats
        const category = requirementsByCategory[requirement.category as keyof typeof requirementsByCategory];
        if (category) {
          category.total++;
          category.requirements.push(requirement);
          if (requirement.status === 'completed' || requirement.status === 'waived' || requirement.status === 'not_applicable') {
            category.completed++;
          }
        }

        // Update type stats
        const type = requirementsByType[requirement.requirementType as keyof typeof requirementsByType];
        if (type) {
          type.total++;
          type.requirements.push(requirement);
          if (requirement.status === 'completed' || requirement.status === 'waived' || requirement.status === 'not_applicable') {
            type.completed++;
          }
        }
      });

      return {
        applicationId,
        applicationName: application.name,
        totalRequirements: progress.total,
        completedRequirements: progress.completed,
        requiredRequirements: progress.required,
        completedRequiredRequirements: progress.requiredCompleted,
        optionalRequirements: progress.optional,
        completedOptionalRequirements: progress.optionalCompleted,
        progressPercentage: progress.percentage,
        requirementsByCategory,
        requirementsByType
      };
    } catch (error) {
      throw new Error(`Failed to get requirements summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate requirement data
   */
  static validateRequirementData(data: CreateRequirementData): RequirementValidationResult {
    const errors: RequirementValidationError[] = [];

    // Basic validation
    if (!data.name?.trim()) {
      errors.push({ field: 'name', message: 'Name is required' });
    }

    if (!data.requirementType) {
      errors.push({ field: 'requirementType', message: 'Requirement type is required' });
    }

    if (!data.category) {
      errors.push({ field: 'category', message: 'Category is required' });
    }

    // Type-specific validation
    if (data.requirementType === 'document' && !data.documentType) {
      errors.push({ field: 'documentType', message: 'Document type is required for document requirements' });
    }

    if (data.requirementType === 'test_score' && !data.testType) {
      errors.push({ field: 'testType', message: 'Test type is required for test score requirements' });
    }

    if (data.requirementType === 'fee' && !data.applicationFeeAmount) {
      errors.push({ field: 'applicationFeeAmount', message: 'Fee amount is required for fee requirements' });
    }

    if (data.requirementType === 'interview' && !data.interviewType) {
      errors.push({ field: 'interviewType', message: 'Interview type is required for interview requirements' });
    }

    // Numeric validation
    if (data.maxFileSize !== undefined && data.maxFileSize < 0) {
      errors.push({ field: 'maxFileSize', message: 'Max file size must be non-negative' });
    }

    if (data.wordLimit !== undefined && data.wordLimit < 0) {
      errors.push({ field: 'wordLimit', message: 'Word limit must be non-negative' });
    }

    if (data.characterLimit !== undefined && data.characterLimit < 0) {
      errors.push({ field: 'characterLimit', message: 'Character limit must be non-negative' });
    }

    if (data.minScore !== undefined && data.minScore < 0) {
      errors.push({ field: 'minScore', message: 'Minimum score must be non-negative' });
    }

    if (data.maxScore !== undefined && data.maxScore < 0) {
      errors.push({ field: 'maxScore', message: 'Maximum score must be non-negative' });
    }

    if (data.applicationFeeAmount !== undefined && data.applicationFeeAmount < 0) {
      errors.push({ field: 'applicationFeeAmount', message: 'Application fee amount must be non-negative' });
    }

    if (data.interviewDuration !== undefined && data.interviewDuration < 0) {
      errors.push({ field: 'interviewDuration', message: 'Interview duration must be non-negative' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Bulk update requirements
   */
  static async bulkUpdateRequirements(
    requirementIds: string[], 
    updateData: Partial<UpdateRequirementData>
  ): Promise<void> {
    try {
      const result = await ApplicationRequirement.updateMany(
        { _id: { $in: requirementIds } },
        { $set: updateData }
      );

      if (result.modifiedCount === 0) {
        throw new Error('No requirements were updated');
      }

      // Update progress for all affected applications
      const requirements = await ApplicationRequirement.find({ _id: { $in: requirementIds } });
      const applicationIds = Array.from(new Set(requirements.map(req => req.applicationId.toString())));
      
      for (const applicationId of applicationIds) {
        await this.updateApplicationProgress(applicationId);
      }
    } catch (error) {
      throw new Error(`Failed to bulk update requirements: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get requirements that need attention (pending or in progress)
   */
  static async getRequirementsNeedingAttention(applicationId: string): Promise<IApplicationRequirement[]> {
    try {
      return await ApplicationRequirement.find({
        applicationId: new mongoose.Types.ObjectId(applicationId),
        status: { $in: ['pending', 'in_progress'] },
        isRequired: true
      }).sort({ order: 1 });
    } catch (error) {
      throw new Error(`Failed to get requirements needing attention: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if application is ready to submit based on requirements
   */
  static async isApplicationReadyToSubmit(applicationId: string): Promise<boolean> {
    try {
      const progress = await this.calculateApplicationProgress(applicationId);
      return progress.requiredCompleted === progress.required && progress.required > 0;
    } catch (error) {
      throw new Error(`Failed to check application readiness: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 