import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Document } from '@/models/Document';
import { auth } from '@/lib/auth';

// GET /api/documents - Get all documents for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {
      userId: session.user.id,
      isLatestVersion: true // Only get latest versions
    };

    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Get documents with pagination
    const documents = await Document.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Document.countDocuments(query);

    return NextResponse.json({
      documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/documents - Create a new document
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const {
      title,
      type,
      category,
      content,
      description,
      tags,
      targetAudience,
      targetInstitution,
      targetProgram,
      status = 'draft',
      isPublic = false,
      allowComments = true,
      metadata = {}
    } = body;

    // Validate required fields
    if (!title || !type || !category || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new document
    const document = new Document({
      userId: session.user.id,
      title,
      type,
      category,
      content,
      description,
      tags: tags || [],
      targetAudience,
      targetInstitution,
      targetProgram,
      status,
      isPublic,
      allowComments,
      metadata: {
        language: metadata.language || 'en',
        format: metadata.format || 'text',
        lastEditedBy: session.user.id,
        editHistory: [{
          userId: session.user.id,
          action: 'created',
          timestamp: new Date(),
          changes: 'Document created'
        }]
      }
    });

    await document.save();

    return NextResponse.json({
      message: 'Document created successfully',
      document
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/documents - Update a document (creates new version if content changed)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const {
      documentId,
      title,
      type,
      category,
      content,
      description,
      tags,
      targetAudience,
      targetInstitution,
      targetProgram,
      status,
      isPublic,
      allowComments,
      createNewVersion = false
    } = body;

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Get the current document
    const currentDoc = await Document.findById(documentId);
    if (!currentDoc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check if user owns the document
    if (currentDoc.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    let updatedDocument;

    // If content changed significantly or user wants new version, create version
    const contentChanged = content && content !== currentDoc.content;
    const shouldVersion = createNewVersion || (contentChanged && content.length > 100);

    if (shouldVersion) {
      // Create new version
      updatedDocument = await Document.createNewVersion(
        documentId,
        session.user.id,
        {
          title,
          type,
          category,
          content,
          description,
          tags,
          targetAudience,
          targetInstitution,
          targetProgram,
          status
        }
      );
    } else {
      // Update existing document
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (type !== undefined) updateData.type = type;
      if (category !== undefined) updateData.category = category;
      if (content !== undefined) updateData.content = content;
      if (description !== undefined) updateData.description = description;
      if (tags !== undefined) updateData.tags = tags;
      if (targetAudience !== undefined) updateData.targetAudience = targetAudience;
      if (targetInstitution !== undefined) updateData.targetInstitution = targetInstitution;
      if (targetProgram !== undefined) updateData.targetProgram = targetProgram;
      if (status !== undefined) updateData.status = status;
      if (isPublic !== undefined) updateData.isPublic = isPublic;
      if (allowComments !== undefined) updateData.allowComments = allowComments;

      // Add to edit history
      updateData['metadata.lastEditedBy'] = session.user.id;
      updateData['metadata.editHistory'] = [
        ...currentDoc.metadata.editHistory,
        {
          userId: session.user.id,
          action: 'updated',
          timestamp: new Date(),
          changes: contentChanged ? 'Content updated' : 'Metadata updated'
        }
      ];

      updatedDocument = await Document.findByIdAndUpdate(
        documentId,
        updateData,
        { new: true }
      );
    }

    return NextResponse.json({
      message: shouldVersion ? 'New version created' : 'Document updated',
      document: updatedDocument
    });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/documents - Delete a document (soft delete by archiving)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Get the document
    const document = await Document.findById(documentId);
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check if user owns the document
    if (document.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Soft delete by archiving
    await Document.findByIdAndUpdate(documentId, {
      status: 'archived',
      'metadata.lastEditedBy': session.user.id,
      'metadata.editHistory': [
        ...document.metadata.editHistory,
        {
          userId: session.user.id,
          action: 'archived',
          timestamp: new Date(),
          changes: 'Document archived'
        }
      ]
    });

    return NextResponse.json({
      message: 'Document archived successfully'
    });
  } catch (error) {
    console.error('Error archiving document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}