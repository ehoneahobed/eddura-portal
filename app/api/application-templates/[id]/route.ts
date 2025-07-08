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
  return {
    ...transformed,
    id: transformed._id?.toString(),
    scholarshipId: transformed.scholarshipId?._id?.toString() || transformed.scholarshipId?.toString(),
    scholarship: transformed.scholarshipId
  };
}

/**
 * GET /api/application-templates/[id]
 * Retrieve a specific application template by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Fetching template with ID:', params.id);
    console.log('ID type:', typeof params.id);
    console.log('ID length:', params.id.length);
    console.log('URL:', request.url);
    
    await connectDB();
    
    // Try to find the template by ID, regardless of format
    let template = null;
    
    // First, try as ObjectId
    if (mongoose.Types.ObjectId.isValid(params.id)) {
      console.log('Trying to find by ObjectId:', params.id);
      template = await ApplicationTemplate.findById(params.id)
        .populate('scholarshipId', 'title provider')
        .lean();
    }
    
    // If not found, try to find by any field that might match
    if (!template) {
      console.log('ObjectId search failed, trying alternative search...');
      
      // Try to find by title (case-insensitive)
      template = await ApplicationTemplate.findOne({
        title: { $regex: new RegExp(params.id, 'i') }
      }).populate('scholarshipId', 'title provider').lean();
      
      if (!template) {
        // Try to find by any field containing the ID
        template = await ApplicationTemplate.findOne({
          $or: [
            { title: { $regex: new RegExp(params.id, 'i') } },
            { description: { $regex: new RegExp(params.id, 'i') } },
            { version: { $regex: new RegExp(params.id, 'i') } }
          ]
        }).populate('scholarshipId', 'title provider').lean();
      }
    }
    
    console.log('Template found:', !!template);
    
    if (!template) {
      console.log('Template not found in database');
      
      // Get all templates for debugging
      const allTemplates = await ApplicationTemplate.find({}).select('_id title').limit(10).lean();
      console.log('Available templates:', allTemplates.map((t: any) => ({ id: t._id.toString(), title: t.title })));
      
      return NextResponse.json({ 
        error: 'Application template not found',
        details: `No template found with ID "${params.id}"`,
        availableTemplates: allTemplates.map((t: any) => ({ id: t._id.toString(), title: t.title }))
      }, { status: 404 });
    }
    
    console.log('Returning template:', template.title);
    return NextResponse.json(transformTemplate(template));
  } catch (error) {
    console.error('Error fetching application template:', error);
    
    // More detailed error response
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch application template',
          details: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch application template' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/application-templates/[id]
 * Update an existing application template
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 });
    }
    
    const body = await request.json();
    
    // Validate required fields if they're being updated
    if (body.sections && body.sections.length === 0) {
      return NextResponse.json(
        { error: 'Template must have at least one section' },
        { status: 400 }
      );
    }
    
    // Validate sections structure if provided
    if (body.sections) {
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
    }
    
    const updatedTemplate = await ApplicationTemplate.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('scholarshipId', 'title provider').lean();
    
    if (!updatedTemplate) {
      return NextResponse.json({ error: 'Application template not found' }, { status: 404 });
    }
    
    return NextResponse.json(transformTemplate(updatedTemplate));
  } catch (error) {
    console.error('Error updating application template:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update application template' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/application-templates/[id]
 * Delete an application template
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 });
    }
    
    const deletedTemplate = await ApplicationTemplate.findByIdAndDelete(params.id);
    
    if (!deletedTemplate) {
      return NextResponse.json({ error: 'Application template not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Application template deleted successfully' });
  } catch (error) {
    console.error('Error deleting application template:', error);
    return NextResponse.json(
      { error: 'Failed to delete application template' },
      { status: 500 }
    );
  }
} 