import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { RequirementsService } from '@/lib/services/RequirementsService';

/**
 * POST /api/application-requirements/[id]/link-document
 * Link a document to a requirement
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requirementId = params.id;
    if (!requirementId) {
      return NextResponse.json({ error: 'Requirement ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { documentId, notes } = body;

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const requirement = await RequirementsService.linkDocumentToRequirement(requirementId, documentId, notes);
    
    return NextResponse.json({
      success: true,
      data: requirement,
      message: 'Document linked to requirement successfully'
    });
  } catch (error) {
    console.error('Error linking document to requirement:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to link document' },
      { status: 500 }
    );
  }
} 