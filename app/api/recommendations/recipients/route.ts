import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';
import Recipient from '@/models/Recipient';
import User from '@/models/User';

/**
 * GET /api/recommendations/recipients
 * Get all recipients for the authenticated user
 */
export async function GET(request: NextRequest) {
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

    // Get recipients for this user
    const recipients = await Recipient.find({ 
      // For now, we'll store recipients globally, but in the future
      // we might want to associate them with specific users
    }).sort({ createdAt: -1 });

    return NextResponse.json({ recipients });
  } catch (error) {
    console.error('Error fetching recipients:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recommendations/recipients
 * Create a new recipient
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { email, name, title, institution, department, phoneNumber, officeAddress, prefersDrafts, preferredCommunicationMethod } = body;

    // Validate required fields
    if (!email || !name || !title || !institution) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, title, institution' },
        { status: 400 }
      );
    }

    // Check if recipient already exists
    const existingRecipient = await Recipient.findOne({ email: email.toLowerCase() });
    if (existingRecipient) {
      return NextResponse.json(
        { error: 'Recipient with this email already exists' },
        { status: 409 }
      );
    }

    // Create new recipient
    const recipient = new Recipient({
      email: email.toLowerCase(),
      name,
      title,
      institution,
      department,
      phoneNumber,
      officeAddress,
      prefersDrafts: prefersDrafts || false,
      preferredCommunicationMethod: preferredCommunicationMethod || 'both',
    });

    await recipient.save();

    return NextResponse.json({ recipient }, { status: 201 });
  } catch (error) {
    console.error('Error creating recipient:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}