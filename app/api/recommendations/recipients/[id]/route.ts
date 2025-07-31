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
    const { 
      name, 
      emails, 
      title, 
      institution, 
      department, 
      phoneNumber, 
      officeAddress, 
      prefersDrafts, 
      preferredCommunicationMethod 
    } = body;

    if (!name || !emails || !emails.length || !title || !institution) {
      return NextResponse.json(
        { error: 'Missing required fields: name, emails, title, institution' },
        { status: 400 }
      );
    }
    
    // Validate emails
    const validEmails = emails.filter((email: string) => email && email.trim());
    if (validEmails.length === 0) {
      return NextResponse.json(
        { error: 'At least one valid email is required' },
        { status: 400 }
      );
    }

    // Get recipient
    const recipient = await Recipient.findOne({
      _id: resolvedParams.id,
      createdBy: user._id
    });

    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    // Check if emails are being changed and if they conflict with another recipient
    const hasEmailChanges = !recipient.emails.every((email: string) => validEmails.includes(email)) ||
                           !validEmails.every((email: string) => recipient.emails.includes(email));
    
    if (hasEmailChanges) {
      const existingRecipient = await Recipient.findOne({ 
        emails: { $in: validEmails.map((email: string) => email.toLowerCase()) },
        createdBy: user._id,
        _id: { $ne: resolvedParams.id }
      });
      if (existingRecipient) {
        return NextResponse.json(
          { error: 'Recipient with one of these emails already exists' },
          { status: 409 }
        );
      }
    }

    // Update fields
    recipient.name = name;
    recipient.emails = validEmails.map((email: string) => email.toLowerCase());
    recipient.primaryEmail = validEmails[0].toLowerCase();
    recipient.title = title;
    recipient.institution = institution;
    recipient.department = department || undefined;
    recipient.phoneNumber = phoneNumber || undefined;
    recipient.officeAddress = officeAddress || undefined;
    recipient.prefersDrafts = prefersDrafts || false;
    recipient.preferredCommunicationMethod = preferredCommunicationMethod || 'email';

    await recipient.save();

    return NextResponse.json({ recipient });
  } catch (error) {
    console.error('Error updating recipient:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

    // Get recipient
    const recipient = await Recipient.findOne({
      _id: resolvedParams.id,
      createdBy: user._id
    });

    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    // Check if recipient is being used in any active recommendation requests
    const RecommendationRequest = (await import('@/models/RecommendationRequest')).default;
    const activeRequests = await RecommendationRequest.find({
      recipientId: resolvedParams.id,
      status: { $in: ['pending', 'sent'] }
    });

    if (activeRequests.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete recipient with active recommendation requests. Please cancel or complete the requests first.' },
        { status: 400 }
      );
    }

    await Recipient.findByIdAndDelete(resolvedParams.id);

    return NextResponse.json({ message: 'Recipient deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipient:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}