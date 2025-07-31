import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Recipient from '@/models/Recipient';
import User from '@/models/User';

/**
 * PUT /api/recommendations/recipients/[id]
 * Update a recipient
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
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
    const recipient = await Recipient.findById(params.id);
    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    // Check if email is being changed and if it conflicts with another recipient
    if (email.toLowerCase() !== recipient.email) {
      const existingRecipient = await Recipient.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: params.id }
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Get user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if recipient exists
    const recipient = await Recipient.findById(params.id);
    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    // TODO: Check if recipient has any active recommendation requests
    // For now, we'll allow deletion

    await Recipient.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Recipient deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipient:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}