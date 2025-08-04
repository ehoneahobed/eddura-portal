import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    return NextResponse.json({ 
      message: 'API is working', 
      timestamp: new Date().toISOString(),
      mongodb: 'Connected successfully'
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({ 
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}