import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Recipient from '@/models/Recipient';
import User from '@/models/User';

/**
 * PUT /api/recommendations/recipients/[id]
 * Update a recipient
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    await connectDB();
    
    // Get user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { email, name, title, institution, department, phoneNumber, officeAddress, prefersDrafts, preferredCommunicationMethod } = body;

    // Validate required fields
    if (!email || !name || !title || !institution) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, title, institution' },
        { status: 400 }
      );
    }

    // Check if recipient exists
    const recipient = await Recipient.findById(resolvedParams.id);
    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    // Check if email is being changed and if it conflicts with another recipient
    if (email.toLowerCase() !== recipient.email) {
      const existingRecipient = await Recipient.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: resolvedParams.id }
      });
      if (existingRecipient) {
        return NextResponse.json(
          { error: 'Recipient with this email already exists' },
          { status: 409 }
        );
      }
    }

    // Update recipient
    recipient.email = email.toLowerCase();
    recipient.name = name;
    recipient.title = title;
    recipient.institution = institution;
    recipient.department = department;
    recipient.phoneNumber = phoneNumber;
    recipient.officeAddress = officeAddress;
    recipient.prefersDrafts = prefersDrafts;
    recipient.preferredCommunicationMethod = preferredCommunicationMethod;

    await recipient.save();

    return NextResponse.json({ recipient });
  } catch (error) {
    console.error('Error updating recipient:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/recommendations/recipients/[id]
 * Delete a recipient
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    await connectDB();
    
    // Get user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if recipient exists
    const recipient = await Recipient.findById(resolvedParams.id);
    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    // TODO: Check if recipient has any active recommendation requests
    // For now, we'll allow deletion

    await Recipient.findByIdAndDelete(resolvedParams.id);

    return NextResponse.json({ message: 'Recipient deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipient:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}