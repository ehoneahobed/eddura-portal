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
 * Retrieve all application templates with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    console.log('=== APPLICATION TEMPLATES API DEBUG START ===');
    console.log('Environment check:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('- MONGODB_URI length:', process.env.MONGODB_URI?.length || 0);
    console.log('- MONGODB_URI prefix:', process.env.MONGODB_URI?.substring(0, 20) || 'Not found');
    
    console.log('Attempting database connection...');
    await connectDB();
    console.log('✅ Successfully connected to database for application templates');
    
    const { searchParams } = new URL(request.url);
    const scholarshipId = searchParams.get('scholarshipId');
    const isActive = searchParams.get('isActive');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const search = searchParams.get('search') || '';
    
    // Build query
    const query: any = {};
    
    if (scholarshipId) {
      query.scholarshipId = scholarshipId;
    }
    
    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }
    
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { version: { $regex: search.trim(), $options: 'i' } }
      ];
    }
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    console.log('Executing query with params:', { query, page, limit, skip });
    console.log('ApplicationTemplate model check:', typeof ApplicationTemplate);
    console.log('ApplicationTemplate.find type:', typeof ApplicationTemplate.find);
    
    // Ensure Scholarship model is registered (serverless fix)
    console.log('Ensuring Scholarship model is registered...');
    console.log('Scholarship model check:', typeof Scholarship);
    console.log('Mongoose models list:', Object.keys(mongoose.models));
    
    // Force registration if not already registered
    if (!mongoose.models.Scholarship) {
      console.log('Scholarship model not found in mongoose.models, forcing registration...');
      // This will trigger the model registration
      console.log('Scholarship model after access:', Scholarship.modelName);
    }
    
    // Execute query with pagination
    console.log('About to execute ApplicationTemplate.find...');
    const templates = await ApplicationTemplate.find(query)
      .populate('scholarshipId', 'title provider')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    console.log('✅ Query executed successfully');
    console.log('Templates found:', templates?.length || 0);
    console.log('Sample template (first one):', templates?.[0] ? {
      id: templates[0]._id,
      title: templates[0].title,
      scholarshipId: templates[0].scholarshipId
    } : 'No templates found');
    
    // Get total count for pagination
    console.log('Getting total count...');
    const total = await ApplicationTemplate.countDocuments(query);
    console.log('Total count:', total);
    
    return NextResponse.json({
      templates: transformTemplates(templates),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
        limit
      }
    });
  } catch (error) {
    console.error('=== APPLICATION TEMPLATES API ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error instanceof Error:', error instanceof Error);
    console.error('Full error object:', error);
    
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Check for specific error types
      if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        console.error('Database connection error detected');
        return NextResponse.json(
          { 
            error: 'Database connection failed. Please try again later.',
            details: error.message,
            type: 'CONNECTION_ERROR'
          },
          { status: 503 }
        );
      }
      
      if (error.message.includes('MONGODB_URI')) {
        console.error('MongoDB URI error detected');
        return NextResponse.json(
          { 
            error: 'Database configuration error',
            details: error.message,
            type: 'CONFIG_ERROR'
          },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch application templates',
        details: error instanceof Error ? error.message : 'Unknown error',
        type: 'GENERAL_ERROR',
        timestamp: new Date().toISOString()
      },
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