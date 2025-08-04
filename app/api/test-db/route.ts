import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import School from '@/models/School';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Check if we can connect to the database
    const schoolCount = await School.countDocuments();
    
    return NextResponse.json({ 
      message: 'Database connection successful',
      schoolCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({ 
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}