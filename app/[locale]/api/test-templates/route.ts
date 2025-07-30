import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import RequirementsTemplate from '../../../models/RequirementsTemplate';

/**
 * GET /api/test-templates
 * Test endpoint to debug templates
 */
export async function GET(request: NextRequest) {
  try {
    console.log('Testing templates endpoint...');
    
    // Test database connection
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      return NextResponse.json({ error: 'MONGODB_URI not set' }, { status: 500 });
    }
    
    console.log('MongoDB URI exists');
    
    // Test model
    const count = await RequirementsTemplate.countDocuments();
    console.log('Template count:', count);
    
    // Test finding system templates
    const systemTemplates = await RequirementsTemplate.find({ isSystemTemplate: true });
    console.log('System templates found:', systemTemplates.length);
    
    return NextResponse.json({
      success: true,
      totalTemplates: count,
      systemTemplates: systemTemplates.length,
      templates: systemTemplates.map(t => ({ id: t._id, name: t.name, category: t.category }))
    });
  } catch (error) {
    console.error('Error in test templates:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}