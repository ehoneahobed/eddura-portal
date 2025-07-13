import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Application from '@/models/Application';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const application = await Application.findOne({
      _id: params.id,
      userId: session.user.id,
      isActive: true
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Check if all sections are complete
    const incompleteSections = application.sections.filter(section => !section.isComplete);
    if (incompleteSections.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot submit application with incomplete sections',
        incompleteSections: incompleteSections.map(section => section.sectionId)
      }, { status: 400 });
    }

    // Update application status
    application.status = 'submitted';
    application.submittedAt = new Date();
    application.completedAt = new Date();
    application.lastActivityAt = new Date();
    application.progress = 100;

    await application.save();

    return NextResponse.json({ 
      message: 'Application submitted successfully',
      applicationId: application._id
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}