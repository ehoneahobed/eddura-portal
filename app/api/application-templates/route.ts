import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ApplicationTemplate from '@/models/ApplicationTemplate';
import Scholarship from '@/models/Scholarship';
import mongoose from 'mongoose';

/**
 * Transform MongoDB document to include id field
 */
function transformTemplate(template: any) {
  if (!template) return template;
  
  const transformed = template.toObject ? template.toObject() : template;
  
  // Handle populated scholarshipId safely
  let scholarshipId = null;
  let scholarship = null;
  
  if (transformed.scholarshipId) {
    if (typeof transformed.scholarshipId === 'string') {
      scholarshipId = transformed.scholarshipId;
    } else if (transformed.scholarshipId._id) {
      scholarshipId = transformed.scholarshipId._id.toString();
      scholarship = transformed.scholarshipId;
    } else {
      scholarshipId = transformed.scholarshipId.toString();
    }
  }
  
  return {
    ...transformed,
    id: transformed._id?.toString(),
    scholarshipId,
    scholarship
  };
}

/**
 * Transform array of templates
 */
function transformTemplates(templates: any[]) {
  return templates.map(transformTemplate);
}

/**
 * GET /api/application-templates
 * Retrieve all application templates with optional filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected successfully');
    
    const { searchParams } = new URL(request.url);
    const scholarshipId = searchParams.get('scholarshipId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Build query
    let query: any = {};
    
    if (scholarshipId) {
      query.scholarshipId = scholarshipId;
    }
    
    // Handle isActive filter
    if (isActive !== null && isActive !== undefined && isActive !== '') {
      // If isActive is explicitly provided, filter by it
      query.isActive = isActive === 'true';
    }
    // If isActive is null, undefined, or empty string, don't filter by isActive (show all templates)
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Get total count for pagination
    console.log('Executing count query with:', query);
    const totalCount = await ApplicationTemplate.countDocuments(query);
    console.log('Total count result:', totalCount);
    
    // Calculate pagination values
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    // Get templates with pagination
    console.log('Executing find query with:', { query, sort, skip, limit });
    const templates = await ApplicationTemplate.find(query)
      .populate('scholarshipId', 'title provider')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    console.log('Find query result count:', templates.length);
    
    // Transform templates
    const transformedTemplates = transformTemplates(templates);
    
    // Debug logging
    console.log('API Debug:', {
      query,
      totalCount,
      totalPages,
      currentPage: page,
      templatesCount: transformedTemplates.length,
      hasNextPage,
      hasPrevPage,
      searchParams: Object.fromEntries(searchParams.entries())
    });

    // Return with pagination info
    return NextResponse.json({
      templates: transformedTemplates,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching application templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application templates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/application-templates
 * Create a new application template
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.sections || body.sections.length === 0) {
      return NextResponse.json(
        { error: 'Title and at least one section are required' },
        { status: 400 }
      );
    }
    
    // Validate sections structure
    for (const section of body.sections) {
      if (!section.id || !section.title || !section.questions || section.questions.length === 0) {
        return NextResponse.json(
          { error: 'Each section must have id, title, and at least one question' },
          { status: 400 }
        );
      }
      
      // Validate questions structure
      for (const question of section.questions) {
        if (!question.id || !question.type || !question.title) {
          return NextResponse.json(
            { error: 'Each question must have id, type, and title' },
            { status: 400 }
          );
        }
      }
    }

    // Check for existing template to prevent duplicates
    const duplicateQuery: any = {
      applicationType: body.applicationType,
      isActive: true
    };

    // Add the appropriate ID field based on application type
    if (body.applicationType === 'scholarship' && body.scholarshipId) {
      duplicateQuery.scholarshipId = body.scholarshipId;
    } else if (body.applicationType === 'school' && body.schoolId) {
      duplicateQuery.schoolId = body.schoolId;
    } else if (body.applicationType === 'program' && body.programId) {
      duplicateQuery.programId = body.programId;
    }

    const existingTemplate = await ApplicationTemplate.findOne(duplicateQuery);
    if (existingTemplate) {
      return NextResponse.json(
        { 
          error: `An active application template already exists for this ${body.applicationType}`,
          existingTemplateId: existingTemplate._id,
          existingTemplateTitle: existingTemplate.title,
          message: `A template titled "${existingTemplate.title}" is already active for this ${body.applicationType}. You can either edit the existing template or create a new one with a different title.`
        },
        { status: 409 }
      );
    }
    
    const template = new ApplicationTemplate({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const savedTemplate = await template.save();
    
    // Ensure Scholarship model is registered for populate
    if (!mongoose.models.Scholarship) {
      console.log('Registering Scholarship model for populate...');
      Scholarship.modelName; // Force registration
    }
    
    const populatedTemplate = await ApplicationTemplate.findById(savedTemplate._id)
      .populate('scholarshipId', 'title provider')
      .lean();
    
    return NextResponse.json(transformTemplate(populatedTemplate), { status: 201 });
  } catch (error) {
    console.error('Error creating application template:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create application template' },
      { status: 500 }
    );
  }
} 