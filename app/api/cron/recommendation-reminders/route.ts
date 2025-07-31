import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RecommendationRequest from '@/models/RecommendationRequest';
import Recipient from '@/models/Recipient';
import User from '@/models/User';
import { sendRecommendationReminderEmail } from '@/lib/email';

/**
 * Vercel Cron Job: Send recommendation reminders
 * Runs every hour to check for requests that need reminders
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate Vercel cron request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const now = new Date();
    const results = {
      checked: 0,
      remindersSent: 0,
      errors: 0,
      details: [] as any[]
    };

    // Find requests that need reminders
    const requestsNeedingReminders = await RecommendationRequest.find({
      status: { $in: ['pending', 'sent'] },
      nextReminderDate: { $lte: now },
      deadline: { $gt: now } // Only for requests that haven't passed deadline
    }).populate('recipientId', 'name emails primaryEmail title institution department')
      .populate('studentId', 'name email');

    results.checked = requestsNeedingReminders.length;

    for (const request of requestsNeedingReminders) {
      try {
        const recipient = request.recipientId as any;
        const student = request.studentId as any;
        
        if (!recipient || !recipient.primaryEmail) {
          results.errors++;
          results.details.push({
            requestId: request._id,
            error: 'No recipient or recipient email found'
          });
          continue;
        }

        // Calculate days until deadline
        const deadline = new Date(request.deadline);
        const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Determine which reminder this is
        const reminderIndex = request.reminderIntervals.findIndex(interval => 
          daysUntilDeadline <= interval
        );

        if (reminderIndex === -1) {
          // No more reminders needed
          continue;
        }

        // Send reminder email
        await sendRecommendationReminderEmail(
          recipient.primaryEmail,
          recipient.name,
          student.name || student.email,
          request.title,
          deadline,
          request.secureToken,
          daysUntilDeadline,
          request.requestType,
          request.submissionMethod,
          request.institutionName,
          reminderIndex + 1
        );

        // Update reminder tracking
        request.lastReminderSent = now;
        
        // Calculate next reminder date
        const nextReminderIndex = reminderIndex + 1;
        if (nextReminderIndex < request.reminderIntervals.length) {
          const nextReminderDays = request.reminderIntervals[nextReminderIndex];
          request.nextReminderDate = new Date(deadline.getTime() - (nextReminderDays * 24 * 60 * 60 * 1000));
        } else {
          // No more reminders
          request.nextReminderDate = undefined;
        }

        await request.save();
        
        results.remindersSent++;
        results.details.push({
          requestId: request._id,
          recipientEmail: recipient.primaryEmail,
          daysUntilDeadline,
          reminderNumber: reminderIndex + 1
        });

      } catch (error) {
        console.error(`Error processing reminder for request ${request._id}:`, error);
        results.errors++;
        results.details.push({
          requestId: request._id,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // Update overdue requests
    const overdueRequests = await RecommendationRequest.find({
      status: { $in: ['pending', 'sent'] },
      deadline: { $lt: now }
    });

    for (const request of overdueRequests) {
      request.status = 'overdue';
      await request.save();
    }

    console.log(`Cron job completed: ${results.remindersSent} reminders sent, ${results.errors} errors`);

    return NextResponse.json({
      success: true,
      message: 'Recommendation reminders processed',
      results
    });

  } catch (error) {
    console.error('Error in recommendation reminders cron job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 