import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sectionId, questionId, value, isComplete } = await request.json();

    if (!sectionId || !questionId) {
      return NextResponse.json({ error: 'Section ID and Question ID are required' }, { status: 400 });
    }

    await connectDB();
    
    const resolvedParams = await params;

    const application = await Application.findOne({
      _id: resolvedParams.id,
      userId: session.user.id,
      isActive: true
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Find the section
    const sectionIndex = application.sections.findIndex((section: any) => section.sectionId === sectionId);
    if (sectionIndex === -1) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    // Find or create the response
    const responseIndex = application.sections[sectionIndex].responses.findIndex(
      (response: any) => response.questionId === questionId
    );

    const responseData = {
      questionId,
      value,
      timestamp: new Date(),
      isComplete: isComplete || false
    };

    if (responseIndex === -1) {
      // Add new response
      application.sections[sectionIndex].responses.push(responseData);
    } else {
      // Update existing response
      application.sections[sectionIndex].responses[responseIndex] = responseData;
    }

    // Update last activity
    application.lastActivityAt = new Date();

    await application.save();

    return NextResponse.json({ message: 'Response saved successfully' });
  } catch (error) {
    console.error('Error saving response:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}