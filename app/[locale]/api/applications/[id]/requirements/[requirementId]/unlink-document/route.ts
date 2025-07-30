import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import ApplicationRequirement from '@/models/ApplicationRequirement';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; requirementId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: applicationId, requirementId } = await params;

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
    
    // If the requirement was completed due to document linking, reset to pending
    if (currentRequirement.status === 'completed' && currentRequirement.linkedDocumentId) {
      newStatus = 'pending';
    }
    // For other statuses, keep them as they are (in_progress, waived, etc.)

    // Update the requirement to unlink the document and update status
    const requirement = await ApplicationRequirement.findOneAndUpdate(
      {
        _id: requirementId,
        applicationId: applicationId
      },
      {
        $unset: {
          linkedDocumentId: 1
        },
        $set: {
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
      message: 'Document unlinked successfully' 
    });

  } catch (error) {
    console.error('Error unlinking document:', error);
    return NextResponse.json(
      { error: 'Failed to unlink document' },
      { status: 500 }
    );
  }
} 