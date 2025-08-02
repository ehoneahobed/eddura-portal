import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ApplicationTemplate from '@/models/ApplicationTemplate';
import Scholarship from '@/models/Scholarship';
import mongoose from 'mongoose';
import { auth, hasPermission, isAdmin } from '@/lib/auth';

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Temporarily disable authentication for testing
    // const session = await auth();
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const resolvedParams = await params;
    await connectDB();
    
    let template = null;
    if (mongoose.Types.ObjectId.isValid(resolvedParams.id)) {
      template = await ApplicationTemplate.findById(resolvedParams.id)
        .populate('scholarshipId', 'title provider')
        .lean();
    }
    
    if (!template) {
      return NextResponse.json({ 
        error: 'Application template not found',
        details: `No template found with ID "${resolvedParams.id}"`,
      }, { status: 404 });
    }
    
    return NextResponse.json(transformTemplate(template));
  } catch (error) {
    console.error('Error fetching application template:', error);
    
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
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('=== API PUT /api/application-templates/[id] ===');
  console.log('PUT /api/application-templates/[id] called');
  console.log('Request method:', request.method);
  console.log('Request URL:', request.url);
  console.log('Request headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    // Temporarily disable authentication for testing
    // const session = await auth();
    // console.log('Session:', session?.user);
    // if (!session?.user || !isAdmin(session.user) || !hasPermission(session.user, 'template:update')) {
    //   console.log('Unauthorized access attempt');
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const resolvedParams = await params;
    console.log('📋 Template ID:', resolvedParams.id);
    console.log('🔌 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected successfully');
    
    if (!mongoose.Types.ObjectId.isValid(resolvedParams.id)) {
      console.log('❌ Invalid template ID format:', resolvedParams.id);
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 });
    }
    
    console.log('📦 Reading request body...');
    const body = await request.json();
    console.log('📦 Request body:', JSON.stringify(body, null, 2));
    
    if (body.sections && body.sections.length === 0) {
      console.log('Validation error: Template must have at least one section');
      return NextResponse.json(
        { error: 'Template must have at least one section' },
        { status: 400 }
      );
    }
    
    if (body.sections) {
      for (const section of body.sections) {
        if (!section.id || !section.title || !section.questions || section.questions.length === 0) {
          return NextResponse.json(
            { error: 'Each section must have id, title, and at least one question' },
            { status: 400 }
          );
        }
        
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
    
    console.log('🔄 Updating template in database...');
    console.log('📋 Update data:', { ...body, updatedAt: new Date() });
    
    const updatedTemplate = await ApplicationTemplate.findByIdAndUpdate(
      resolvedParams.id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('scholarshipId', 'title provider').lean();
    
    if (!updatedTemplate) {
      console.log('❌ Template not found in database');
      return NextResponse.json({ error: 'Application template not found' }, { status: 404 });
    }
    
    console.log('✅ Template updated successfully');
    const transformedTemplate = transformTemplate(updatedTemplate);
    console.log('📤 Returning transformed template:', transformedTemplate);
    return NextResponse.json(transformedTemplate);
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !isAdmin(session.user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 });
    }
    
    const deletedTemplate = await ApplicationTemplate.findByIdAndDelete(resolvedParams.id);
    
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