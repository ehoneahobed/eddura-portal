import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Application from '@/models/Application';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; sectionId: string } }
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

    // Find the section
    const sectionIndex = application.sections.findIndex(section => section.sectionId === params.sectionId);
    if (sectionIndex === -1) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    // Mark section as complete
    application.sections[sectionIndex].isComplete = true;
    application.sections[sectionIndex].completedAt = new Date();

    // Calculate progress
    const completedSections = application.sections.filter(section => section.isComplete).length;
    const totalSections = application.sections.length;
    application.progress = Math.round((completedSections / totalSections) * 100);

    // Update status if needed
    if (application.status === 'draft' && application.progress > 0) {
      application.status = 'in_progress';
    }

    // Update last activity
    application.lastActivityAt = new Date();

    await application.save();

    return NextResponse.json({ 
      message: 'Section completed successfully',
      progress: application.progress
    });
  } catch (error) {
    console.error('Error completing section:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}