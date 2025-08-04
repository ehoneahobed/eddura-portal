import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import School from '@/models/School';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Test basic school query
    const schoolCount = await School.countDocuments();
    const sampleSchools = await School.find().limit(5).select('name country city');
    
    return NextResponse.json({ 
      message: 'Schools API test successful',
      schoolCount,
      sampleSchools,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Schools API test error:', error);
    return NextResponse.json({ 
      error: 'Schools API test failed',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}