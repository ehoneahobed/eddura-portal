import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import Admin from '@/models/Admin';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type') || 'all';
    const priority = searchParams.get('priority') || 'all';
    const category = searchParams.get('category') || 'all';
    const isRead = searchParams.get('isRead');
    const isArchived = searchParams.get('isArchived') || 'false';

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {
      $or: [
        { sender: session.user.id },
        { recipients: session.user.id },
        { ccRecipients: session.user.id }
      ]
    };

    if (type !== 'all') {
      query.messageType = type;
    }

    if (priority !== 'all') {
      query.priority = priority;
    }

    if (category !== 'all') {
      query.category = category;
    }

    if (isRead !== null && isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    if (isArchived === 'true') {
      query.isArchived = true;
    } else {
      query.isArchived = false;
    }

    const messages = await Message.find(query)
      .populate('sender', 'firstName lastName email')
      .populate('recipients', 'firstName lastName email')
      .populate('ccRecipients', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Message.countDocuments(query);

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    console.log('Creating message with body:', body);
    
    const { 
      subject, 
      content, 
      recipients, 
      ccRecipients, 
      messageType, 
      priority, 
      category, 
      tags, 
      attachments,
      parentMessage,
      threadId 
    } = body;

    // Validate required fields
    if (!subject || !content || !recipients || recipients.length === 0) {
      return NextResponse.json(
        { message: "Subject, content, and at least one recipient are required" },
        { status: 400 }
      );
    }

    // Validate recipients exist
    const recipientIds = Array.isArray(recipients) ? recipients : [recipients];
    const validRecipients = await Admin.find({ _id: { $in: recipientIds } });
    
    if (validRecipients.length !== recipientIds.length) {
      return NextResponse.json(
        { message: "One or more recipients not found" },
        { status: 400 }
      );
    }

    // Create message
    const messageData: any = {
      subject,
      content,
      sender: session.user.id,
      recipients: recipientIds,
      ccRecipients: ccRecipients || [],
      messageType: messageType || 'general',
      priority: priority || 'medium',
      category,
      tags,
      attachments
    };

    // Only add parentMessage if it's a valid ObjectId
    if (parentMessage && /^[0-9a-fA-F]{24}$/.test(parentMessage)) {
      messageData.parentMessage = parentMessage;
    }

    // Only add threadId if it's a valid ObjectId
    if (threadId && /^[0-9a-fA-F]{24}$/.test(threadId)) {
      messageData.threadId = threadId;
    }

    const message = new Message(messageData);

    await message.save();

    // Populate sender and recipients for response
    await message.populate('sender', 'firstName lastName email');
    await message.populate('recipients', 'firstName lastName email');
    await message.populate('ccRecipients', 'firstName lastName email');

    return NextResponse.json(
      { message: "Message sent successfully", messageData: message.toObject() },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { message: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}