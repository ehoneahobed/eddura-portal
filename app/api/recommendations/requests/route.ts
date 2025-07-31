import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import RecommendationRequest from '@/models/RecommendationRequest';
import Recipient from '@/models/Recipient';
import User from '@/models/User';
import { randomBytes } from 'crypto';
import { sendRecommendationRequest } from '@/lib/email/recommendation-email';

/**
 * GET /api/recommendations/requests
 * Get all recommendation requests for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Get user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get requests for this user
    const requests = await RecommendationRequest.find({ 
      studentId: user._id 
    })
    .populate('recipientId', 'name emails primaryEmail title institution department prefersDrafts')
    .populate('applicationId', 'title')
    .populate('scholarshipId', 'title')
    .sort({ createdAt: -1 });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching recommendation requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recommendations/requests
 * Create a new recommendation request
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Get user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { 
      recipientId, 
      title, 
      description, 
      deadline, 
      priority, 
      includeDraft, 
      draftContent,
      applicationId,
      scholarshipId,
      reminderIntervals,
      reminderFrequency,
      requestType,
      submissionMethod,
      communicationStyle,
      relationshipContext,
      additionalContext,
      institutionName,
      schoolEmail,
      schoolInstructions
    } = body;

    // Validate required fields
    if (!recipientId || !title || !description || !deadline || !relationshipContext) {
      return NextResponse.json(
        { error: 'Missing required fields: recipientId, title, description, deadline, relationshipContext' },
        { status: 400 }
      );
    }

    // Validate deadline is in the future
    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      return NextResponse.json(
        { error: 'Deadline must be in the future' },
        { status: 400 }
      );
    }

    // Check if recipient exists
    const recipient = await Recipient.findById(recipientId);
    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    // Generate secure token
    const secureToken = randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(deadlineDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days after deadline

    // Calculate next reminder date
    const reminderDays = reminderIntervals || [7, 3, 1];
    const nextReminderDate = new Date(deadlineDate.getTime() - (reminderDays[0] * 24 * 60 * 60 * 1000));

    // Create new request
    const recommendationRequest = new RecommendationRequest({
      studentId: user._id,
      recipientId,
      title,
      description,
      deadline: deadlineDate,
      priority: priority || 'medium',
      requestType: requestType || 'direct_platform',
      submissionMethod: submissionMethod || 'platform_only',
      communicationStyle: communicationStyle || 'polite',
      relationshipContext,
      additionalContext,
      institutionName,
      schoolEmail,
      schoolInstructions,
      includeDraft: includeDraft || false,
      draftContent,
      applicationId,
      scholarshipId,
      reminderIntervals: reminderDays,
      reminderFrequency: reminderFrequency || 'standard',
      nextReminderDate,
      secureToken,
      tokenExpiresAt,
    });

    await recommendationRequest.save();

    // Populate recipient info for response
    await recommendationRequest.populate('recipientId', 'name emails primaryEmail title institution department prefersDrafts');

    // Send initial email to recipient
    try {
      console.log('=== EMAIL SENDING DEBUG ===');
      console.log('Recipient ID:', recipientId);
      console.log('User:', { name: user.name, email: user.email });
      console.log('Request title:', title);
      
      const recipient = await Recipient.findById(recipientId);
      console.log('Recipient found:', recipient ? { 
        name: recipient.name, 
        email: recipient.primaryEmail,
        id: recipient._id 
      } : 'Not found');
      
      if (recipient && recipient.primaryEmail) {
        console.log('✅ Recipient and email found, attempting to send email to:', recipient.primaryEmail);
        
        const emailResult = await sendRecommendationRequest(
          recipient.primaryEmail,
          recipient.name,
          user.name || user.email,
          title,
          deadlineDate,
          secureToken,
          requestType || 'direct_platform',
          submissionMethod || 'platform_only',
          communicationStyle || 'polite',
          relationshipContext,
          institutionName,
          schoolEmail,
          schoolInstructions,
          includeDraft || false,
          draftContent,
          additionalContext
        );
        
        console.log('✅ Email sent successfully! Result:', emailResult);
        
        // Update request status to 'sent'
        recommendationRequest.status = 'sent';
        recommendationRequest.sentAt = new Date();
        await recommendationRequest.save();
        console.log('✅ Request status updated to sent');
      } else {
        console.log('❌ No recipient or email found, skipping email send');
        console.log('Recipient exists:', !!recipient);
        console.log('Recipient has email:', recipient ? !!recipient.primaryEmail : 'N/A');
      }
      console.log('=== END EMAIL DEBUG ===');
    } catch (emailError) {
      console.error('❌ Error sending recommendation request email:', emailError);
      console.error('Error details:', {
        message: emailError.message,
        stack: emailError.stack
      });
      // Don't fail the request creation if email fails
    }

    return NextResponse.json({ request: recommendationRequest }, { status: 201 });
  } catch (error) {
    console.error('Error creating recommendation request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}