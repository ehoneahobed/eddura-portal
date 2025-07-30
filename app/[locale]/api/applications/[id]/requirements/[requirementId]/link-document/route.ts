import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import ApplicationRequirement from '@/models/ApplicationRequirement';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; requirementId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: applicationId, requirementId } = await params;
    const { documentId } = await request.json();
    
    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    await connectDB();

    // First, get the current requirement to check its type and status
    const currentRequirement = await ApplicationRequirement.findOne({
      _id: requirementId,
      applicationId: applicationId
    });

    if (!currentRequirement) {
      return NextResponse.json({ error: 'Requirement not found' }, { status: 404 });
    }

    // Determine the new status based on requirement type and current status
    let newStatus = currentRequirement.status;
    
    // For document and test_score requirements, mark as completed when document is linked
    if ((currentRequirement.requirementType === 'document' || currentRequirement.requirementType === 'test_score') && 
        currentRequirement.status !== 'waived' && currentRequirement.status !== 'not_applicable') {
      newStatus = 'completed';
    }
    // For other requirement types, keep the current status

    // Update the requirement to link the document and update status
    const requirement = await ApplicationRequirement.findOneAndUpdate(
      {
        _id: requirementId,
        applicationId: applicationId
      },
      {
        $set: {
          linkedDocumentId: documentId,
          status: newStatus
        }
      },
      { new: true }
    );

    if (!requirement) {
      return NextResponse.json({ error: 'Requirement not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Document linked successfully' 
    });

  } catch (error) {
    console.error('Error linking document:', error);
    return NextResponse.json(
      { error: 'Failed to link document' },
      { status: 500 }
    );
  }
} 