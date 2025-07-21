import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { RequirementsTemplateService } from '@/lib/services/RequirementsTemplateService';
import { CreateTemplateData } from '@/types/requirements';
import connectDB from '@/lib/mongodb';

/**
 * GET /api/requirements-templates
 * Get templates with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    
    // Check if user is requesting only system templates
    const isSystemTemplateOnly = searchParams.get('isSystemTemplate') === 'true';
    
    // For system templates, allow access without authentication
    if (isSystemTemplateOnly) {
      const templates = await RequirementsTemplateService.getTemplates({
        isSystemTemplate: true,
        isActive: true,
        limit: parseInt(searchParams.get('limit') || '50'),
        offset: parseInt(searchParams.get('offset') || '0')
      });
      
      return NextResponse.json({
        success: true,
        data: templates,
        count: templates.length
      });
    }
    
    // For all other requests, require authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const options = {
      category: searchParams.get('category') as any,
      isSystemTemplate: searchParams.get('isSystemTemplate') === 'true' ? true : 
                       searchParams.get('isSystemTemplate') === 'false' ? false : undefined,
      isActive: searchParams.get('isActive') === 'true' ? true : 
               searchParams.get('isActive') === 'false' ? false : undefined,
      createdBy: searchParams.get('createdBy') || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0')
    };

    const templates = await RequirementsTemplateService.getTemplates(options);
    
    return NextResponse.json({
      success: true,
      data: templates,
      count: templates.length
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/requirements-templates
 * Create a new template
 */
export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();
    
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateTemplateData = await request.json();

    // Validate required fields
    if (!body.name || !body.category || !body.requirements || body.requirements.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category, requirements' },
        { status: 400 }
      );
    }

    const template = await RequirementsTemplateService.createTemplate(body, session.user.id);
    
    return NextResponse.json({
      success: true,
      data: template,
      message: 'Template created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create template' },
      { status: 500 }
    );
  }
} 