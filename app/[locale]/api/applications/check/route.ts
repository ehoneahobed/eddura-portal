import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scholarshipId = searchParams.get('scholarshipId');

    if (!scholarshipId) {
      return NextResponse.json({ error: 'Scholarship ID is required' }, { status: 400 });
    }

    await connectDB();

    const application = await Application.findOne({
      userId: session.user.id,
      scholarshipId: scholarshipId,
      isActive: true
    });

    return NextResponse.json({ 
      exists: !!application,
      applicationId: application?._id || null
    });
  } catch (error) {
    console.error('Error checking application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}