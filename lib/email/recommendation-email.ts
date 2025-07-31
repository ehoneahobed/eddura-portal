import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send recommendation request email to recipient
 */
export async function sendRecommendationRequest(
  recipientEmail: string,
  recipientName: string,
  studentName: string,
  requestTitle: string,
  deadline: Date,
  secureToken: string,
  includeDraft: boolean = false,
  draftContent?: string
) {
  const deadlineFormatted = deadline.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/recommendation/${secureToken}`;

  const subject = `Recommendation Letter Request - ${studentName}`;

  let htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Recommendation Letter Request</h2>
      
      <p>Dear ${recipientName},</p>
      
      <p>${studentName} has requested a recommendation letter from you for the following purpose:</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${requestTitle}</h3>
        <p><strong>Deadline:</strong> ${deadlineFormatted}</p>
      </div>
      
      <p>To submit your recommendation letter, please click the button below:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${portalUrl}" 
           style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Submit Recommendation Letter
        </a>
      </div>
      
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${portalUrl}</p>
      
      <p>This link will expire on ${deadlineFormatted}.</p>
      
      ${includeDraft && draftContent ? `
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="margin-top: 0;">Draft Content (Optional)</h4>
          <p>${studentName} has provided a draft that you may use as a starting point:</p>
          <div style="background-color: white; padding: 10px; border-radius: 3px; margin-top: 10px;">
            ${draftContent.replace(/\n/g, '<br>')}
          </div>
        </div>
      ` : ''}
      
      <p>Thank you for your time and consideration.</p>
      
      <p>Best regards,<br>The Eddura Team</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #666;">
        This is an automated message. Please do not reply to this email.
        If you have any questions, please contact the student directly.
      </p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Eddura <noreply@eddura.com>',
      to: [recipientEmail],
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Error sending recommendation request email:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to send recommendation request email:', error);
    throw error;
  }
}

/**
 * Send reminder email to recipient
 */
export async function sendRecommendationReminder(
  recipientEmail: string,
  recipientName: string,
  studentName: string,
  requestTitle: string,
  deadline: Date,
  secureToken: string,
  daysUntilDeadline: number
) {
  const deadlineFormatted = deadline.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/recommendation/${secureToken}`;

  const subject = `Reminder: Recommendation Letter for ${studentName} - Due in ${daysUntilDeadline} day${daysUntilDeadline > 1 ? 's' : ''}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Recommendation Letter Reminder</h2>
      
      <p>Dear ${recipientName},</p>
      
      <p>This is a friendly reminder that you have a pending recommendation letter request from ${studentName}.</p>
      
      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${requestTitle}</h3>
        <p><strong>Deadline:</strong> ${deadlineFormatted}</p>
        <p><strong>Time remaining:</strong> ${daysUntilDeadline} day${daysUntilDeadline > 1 ? 's' : ''}</p>
      </div>
      
      <p>To submit your recommendation letter, please click the button below:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${portalUrl}" 
           style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Submit Recommendation Letter
        </a>
      </div>
      
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${portalUrl}</p>
      
      <p>Thank you for your time and consideration.</p>
      
      <p>Best regards,<br>The Eddura Team</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #666;">
        This is an automated reminder. Please do not reply to this email.
        If you have any questions, please contact the student directly.
      </p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Eddura <noreply@eddura.com>',
      to: [recipientEmail],
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Error sending recommendation reminder email:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to send recommendation reminder email:', error);
    throw error;
  }
}

/**
 * Send confirmation email to student when letter is received
 */
export async function sendRecommendationReceived(
  studentEmail: string,
  studentName: string,
  recipientName: string,
  requestTitle: string
) {
  const subject = `Recommendation Letter Received - ${requestTitle}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #28a745;">Recommendation Letter Received!</h2>
      
      <p>Dear ${studentName},</p>
      
      <p>Great news! Your recommendation letter has been submitted by ${recipientName}.</p>
      
      <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #155724;">${requestTitle}</h3>
        <p><strong>Submitted by:</strong> ${recipientName}</p>
        <p><strong>Status:</strong> <span style="color: #28a745;">✓ Received</span></p>
      </div>
      
      <p>You can view the details of this recommendation request in your dashboard.</p>
      
      <p>Thank you for using Eddura!</p>
      
      <p>Best regards,<br>The Eddura Team</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #666;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Eddura <noreply@eddura.com>',
      to: [studentEmail],
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Error sending recommendation received email:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to send recommendation received email:', error);
    throw error;
  }
}