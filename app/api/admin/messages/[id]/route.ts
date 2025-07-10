import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    
    if (!session?.user || session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const message = await Message.findById(resolvedParams.id)
      .populate('sender', 'firstName lastName email')
      .populate('recipients', 'firstName lastName email')
      .populate('ccRecipients', 'firstName lastName email')
      .populate('parentMessage', 'subject content sender createdAt')
      .lean();

    if (!message) {
      return NextResponse.json(
        { message: "Message not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this message
    const hasAccess = message.sender._id === session.user.id ||
                     message.recipients.some((r: any) => r._id === session.user.id) ||
                     message.ccRecipients.some((r: any) => r._id === session.user.id);

    if (!hasAccess) {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    // Mark as read if user is a recipient and message is unread
    if (!message.isRead && message.recipients.some((r: any) => r._id === session.user.id)) {
      await Message.findByIdAndUpdate(resolvedParams.id, {
        isRead: true,
        readAt: new Date()
      });
      message.isRead = true;
      message.readAt = new Date();
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error fetching message:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    
    if (!session?.user || session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { isRead, isArchived, isPinned } = body;

    const message = await Message.findById(resolvedParams.id);
    if (!message) {
      return NextResponse.json(
        { message: "Message not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this message
    const hasAccess = message.sender.toString() === session.user.id ||
                     message.recipients.includes(session.user.id) ||
                     message.ccRecipients.includes(session.user.id);

    if (!hasAccess) {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    // Update fields
    if (isRead !== undefined) {
      message.isRead = isRead;
      message.readAt = isRead ? new Date() : undefined;
    }

    if (isArchived !== undefined) {
      message.isArchived = isArchived;
      message.archivedAt = isArchived ? new Date() : undefined;
    }

    if (isPinned !== undefined) {
      message.isPinned = isPinned;
    }

    await message.save();

    // Populate for response
    await message.populate('sender', 'firstName lastName email');
    await message.populate('recipients', 'firstName lastName email');
    await message.populate('ccRecipients', 'firstName lastName email');

    return NextResponse.json(
      { message: "Message updated successfully", messageData: message.toObject() }
    );
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    
    if (!session?.user || session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const message = await Message.findById(resolvedParams.id);
    if (!message) {
      return NextResponse.json(
        { message: "Message not found" },
        { status: 404 }
      );
    }

    // Only sender can delete the message
    if (message.sender.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "Only the sender can delete this message" },
        { status: 403 }
      );
    }

    await Message.findByIdAndDelete(resolvedParams.id);

    return NextResponse.json(
      { message: "Message deleted successfully" }
    );
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}