import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ApplicationTemplate from '@/models/ApplicationTemplate';
import Scholarship from '@/models/Scholarship';

/**
 * Transform MongoDB document to include id field
 */
function transformTemplate(template: any) {
  if (!template) return template;
  
  const transformed = template.toObject ? template.toObject() : template;
  return {
    ...transformed,
    id: transformed._id?.toString(),
    scholarshipId: transformed.scholarshipId?._id?.toString() || transformed.scholarshipId?.toString(),
    scholarship: transformed.scholarshipId
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
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const scholarshipId = searchParams.get('scholarshipId');
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    
    // Build query
    const query: any = {};
    
    if (scholarshipId) {
      query.scholarshipId = scholarshipId;
    }
    
    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { version: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Execute query with pagination
    const templates = await ApplicationTemplate.find(query)
      .populate('scholarshipId', 'title provider')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const total = await ApplicationTemplate.countDocuments(query);
    
    return NextResponse.json({
      templates: transformTemplates(templates),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
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
    
    const template = new ApplicationTemplate({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const savedTemplate = await template.save();
    const populatedTemplate = await ApplicationTemplate.findById(savedTemplate._id)
      .populate('scholarshipId', 'title provider');
    
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