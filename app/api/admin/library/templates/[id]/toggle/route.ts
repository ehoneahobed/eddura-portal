import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import LibraryDocument from '@/models/LibraryDocument';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { isTemplate } = body as { isTemplate?: boolean };

    if (typeof isTemplate !== 'boolean') {
      return NextResponse.json({ error: 'isTemplate must be a boolean' }, { status: 400 });
    }

    const document = await LibraryDocument.findById(id);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    document.isTemplate = isTemplate;
    await document.save();

    return NextResponse.json({
      message: 'Template status updated successfully',
      document: {
        _id: (document._id as any).toString(),
        isTemplate: document.isTemplate,
      },
    });
  } catch (error) {
    console.error('Error toggling template status:', error);
    return NextResponse.json({ error: 'Failed to update template status' }, { status: 500 });
  }
} 