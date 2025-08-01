import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RecommendationRequest from '@/models/RecommendationRequest';
import Recipient from '@/models/Recipient';
import User from '@/models/User';
import { sendRecommendationReminder } from '@/lib/email/recommendation-email';

/**
 * Vercel Cron Job: Send recommendation reminders
 * Runs every hour to check for pending reminders
 * 
 * Cron expression: 0 * * * * (every hour)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is a Vercel cron request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Skip if Resend API key is not configured
    if (!process.env.RESEND_API_KEY) {
      console.log('Skipping recommendation reminders - RESEND_API_KEY not configured');
      return NextResponse.json({ 
        message: 'Skipped - RESEND_API_KEY not configured',
        processed: 0,
        sent: 0,
        errors: 0
      });
    }

    await connectDB();

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find requests that need reminders
    const requestsNeedingReminders = await RecommendationRequest.find({
      status: { $in: ['pending', 'sent'] },
      deadline: { $gt: now },
      $or: [
        { nextReminderDate: { $lte: now } },
        { nextReminderDate: { $exists: false } }
      ]
    }).populate('recipientId', 'name emails primaryEmail title institution department')
      .populate('studentId', 'name email');

    console.log(`Found ${requestsNeedingReminders.length} requests needing reminders`);

    const results = {
      processed: 0,
      sent: 0,
      errors: 0,
      details: [] as any[]
    };

    for (const request of requestsNeedingReminders) {
      try {
        results.processed++;

        // Skip if no recipient or email
        if (!request.recipientId || !(request.recipientId as any).primaryEmail) {
          results.errors++;
          results.details.push({
            requestId: request._id,
            error: 'No recipient or email found'
          });
          continue;
        }

        // Calculate days until deadline
        const daysUntilDeadline = Math.ceil((request.deadline.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

        // Determine urgency level and message
        const urgencyLevel = getUrgencyLevel(daysUntilDeadline);
        const urgencyMessage = getUrgencyMessage(daysUntilDeadline, urgencyLevel);

        // Send reminder email
        await sendRecommendationReminder(
          (request.recipientId as any).primaryEmail,
          (request.recipientId as any).name,
          (request.studentId as any)?.name || (request.studentId as any)?.email || 'Student',
          request.title,
          request.deadline,
          request.secureToken,
          daysUntilDeadline,
          request.requestType,
          request.submissionMethod,
          request.institutionName,
          urgencyLevel,
          urgencyMessage
        );

        // Update reminder tracking
        request.lastReminderSent = now;
        
        // Calculate next reminder date
        const nextReminderIndex = request.reminderIntervals.findIndex(
          (days: number) => daysUntilDeadline > days
        );
        
        if (nextReminderIndex !== -1) {
          const nextReminderDays = request.reminderIntervals[nextReminderIndex];
          request.nextReminderDate = new Date(
            request.deadline.getTime() - (nextReminderDays * 24 * 60 * 60 * 1000)
          );
        } else {
          // No more reminders scheduled
          request.nextReminderDate = undefined;
        }

        await request.save();
        results.sent++;
        results.details.push({
          requestId: request._id,
          recipientEmail: (request.recipientId as any).primaryEmail,
          daysUntilDeadline,
          urgencyLevel
        });

      } catch (error) {
        console.error(`Error processing reminder for request ${request._id}:`, error);
        results.errors++;
        results.details.push({
          requestId: request._id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      summary: results
    });

  } catch (error) {
    console.error('Error in recommendation reminder cron job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Determine urgency level based on days until deadline
 */
function getUrgencyLevel(daysUntilDeadline: number): 'low' | 'medium' | 'high' | 'critical' {
  if (daysUntilDeadline <= 1) return 'critical';
  if (daysUntilDeadline <= 3) return 'high';
  if (daysUntilDeadline <= 7) return 'medium';
  return 'low';
}

/**
 * Generate urgency message based on deadline proximity
 */
function getUrgencyMessage(daysUntilDeadline: number, urgencyLevel: string): string {
  switch (urgencyLevel) {
    case 'critical':
      return `URGENT: This recommendation is due TOMORROW! Please submit as soon as possible to avoid missing the deadline.`;
    case 'high':
      return `IMPORTANT: This recommendation is due in ${daysUntilDeadline} days. Please prioritize this request to ensure timely submission.`;
    case 'medium':
      return `REMINDER: This recommendation is due in ${daysUntilDeadline} days. Please plan to submit soon.`;
    case 'low':
    default:
      return `Friendly reminder: This recommendation is due in ${daysUntilDeadline} days.`;
  }
} 