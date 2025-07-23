import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Scholarship from '@/models/Scholarship';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const scholarships = await Scholarship.find({})
      .select('_id title provider deadline')
      .limit(10)
      .sort({ createdAt: -1 });

    return NextResponse.json({ 
      scholarships: scholarships.map(s => ({
        _id: s._id,
        title: s.title,
        provider: s.provider,
        deadline: s.deadline
      }))
    });
  } catch (error) {
    console.error('Error fetching scholarships:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 