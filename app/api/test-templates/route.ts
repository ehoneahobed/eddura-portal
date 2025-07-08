import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ApplicationTemplate from '@/models/ApplicationTemplate';

export async function GET() {
  try {
    await connectDB();
    console.log('Database connected for test');
    
    // Simple count query first
    const count = await ApplicationTemplate.countDocuments();
    console.log('Application templates count:', count);
    
    // Simple find without populate
    const templates = await ApplicationTemplate.find().limit(5);
    console.log('Found templates:', templates.length);
    
    return NextResponse.json({
      success: true,
      count,
      templatesCount: templates.length,
      templates: templates.map((t: any) => ({
        id: t._id.toString(),
        title: t.title,
        scholarshipId: t.scholarshipId?.toString()
      }))
    });
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}