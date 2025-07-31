import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Recipient from '@/models/Recipient';
import User from '@/models/User';

/**
 * GET /api/recommendations/recipients
 * Get all recipients for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const recipients = await Recipient.find({ createdBy: user._id }).sort({ createdAt: -1 });
    
    return NextResponse.json({ recipients });
  } catch (error) {
    console.error('Error fetching recipients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/recommendations/recipients
 * Create a new recipient
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const body = await request.json();
    const { emails, name, title, institution, department, phoneNumber, officeAddress, prefersDrafts, preferredCommunicationMethod } = body;
    if (!emails || !emails.length || !name || !title || !institution) {
      return NextResponse.json(
        { error: 'Missing required fields: emails, name, title, institution' },
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
    
    // Check for existing recipient with any of the emails
    const existingRecipient = await Recipient.findOne({ 
      emails: { $in: validEmails.map((email: string) => email.toLowerCase()) },
      createdBy: user._id 
    });
    if (existingRecipient) {
      return NextResponse.json(
        { error: 'Recipient with one of these emails already exists' },
        { status: 409 }
      );
    }
    
    const primaryEmail = validEmails[0].toLowerCase();
    const recipient = new Recipient({
      emails: validEmails.map((email: string) => email.toLowerCase()),
      primaryEmail,
      name,
      title,
      institution,
      department,
      phoneNumber,
      officeAddress,
      prefersDrafts: prefersDrafts || false,
      preferredCommunicationMethod: preferredCommunicationMethod || 'email',
      createdBy: user._id
    });
    await recipient.save();
    return NextResponse.json({ recipient }, { status: 201 });
  } catch (error) {
    console.error('Error creating recipient:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
