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
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const scholarshipId = searchParams.get('scholarshipId');
    
    if (scholarshipId) {
      // Get templates for a specific scholarship
      const templates = await ApplicationTemplate.find({
        scholarshipId: scholarshipId,
        isActive: true
      }).sort({ createdAt: -1 });
      
      return NextResponse.json({ templates });
    }
    
    // Get all active templates
    const templates = await ApplicationTemplate.find({ isActive: true })
      .populate('scholarship', 'title provider')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ templates });
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