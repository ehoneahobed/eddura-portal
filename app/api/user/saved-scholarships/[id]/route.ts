import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import SavedScholarship from '@/models/SavedScholarship';

// DELETE /api/user/saved-scholarships/[id] - Unsave a scholarship
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const savedScholarship = await SavedScholarship.findOneAndDelete({
      userId: session.user.id,
      scholarshipId: params.id
    });

    if (!savedScholarship) {
      return NextResponse.json(
        { error: 'Saved scholarship not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Scholarship unsaved successfully'
    });

  } catch (error) {
    console.error('Error unsaving scholarship:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/user/saved-scholarships/[id] - Update saved scholarship
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notes, status, reminderDate } = body;

    await connectDB();

    const savedScholarship = await SavedScholarship.findOne({
      userId: session.user.id,
      scholarshipId: params.id
    });

    if (!savedScholarship) {
      return NextResponse.json(
        { error: 'Saved scholarship not found' },
        { status: 404 }
      );
    }

    // Update fields if provided
    if (notes !== undefined) savedScholarship.notes = notes;
    if (status !== undefined) savedScholarship.status = status;
    if (reminderDate !== undefined) {
      savedScholarship.reminderDate = reminderDate;
      savedScholarship.isReminderSet = !!reminderDate;
    }

    await savedScholarship.save();

    return NextResponse.json({
      message: 'Saved scholarship updated successfully',
      savedScholarship
    });

  } catch (error) {
    console.error('Error updating saved scholarship:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}