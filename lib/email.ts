import { Resend } from 'resend';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('Resend API key not configured, skipping email send');
      return false;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: process.env.SENDER_EMAIL || 'noreply@appeval.co',
      to: [emailData.to],
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text || emailData.html.replace(/<[^>]*>/g, ''),
    });

    if (error) {
      console.error('Resend error:', error);
      return false;
    }

    console.log('Email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendDocumentShareEmail = async (
  toEmail: string,
  reviewerName: string,
  documentTitle: string,
  shareUrl: string,
  message?: string
): Promise<boolean> => {
  const subject = `Document Review Request: ${documentTitle}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document Review Request</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Document Review Request</h2>
        </div>
        
        <p>Hello ${reviewerName},</p>
        
        <p>You have been invited to review a document titled <strong>"${documentTitle}"</strong>.</p>
        
        ${message ? `<p><strong>Message from the author:</strong><br>${message}</p>` : ''}
        
        <p>Please click the button below to access the document and provide your feedback:</p>
        
        <a href="${shareUrl}" class="button">Review Document</a>
        
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${shareUrl}</p>
        
        <div class="footer">
          <p>This review request was sent from the Eddura platform.</p>
          <p>If you have any questions, please contact the document author directly.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: toEmail,
    subject,
    html,
  });
};

export const sendFeedbackReceivedEmail = async (
  toEmail: string,
  documentTitle: string,
  reviewerName: string,
  feedbackUrl: string
): Promise<boolean> => {
  const subject = `New Feedback Received: ${documentTitle}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Feedback Received</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .button { display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>New Feedback Received</h2>
        </div>
        
        <p>Great news! You have received new feedback on your document <strong>"${documentTitle}"</strong>.</p>
        
        <p><strong>Reviewer:</strong> ${reviewerName}</p>
        
        <p>Click the button below to view the feedback:</p>
        
        <a href="${feedbackUrl}" class="button">View Feedback</a>
        
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${feedbackUrl}</p>
        
        <div class="footer">
          <p>This notification was sent from the Eddura platform.</p>
          <p>Thank you for using our document management system!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: toEmail,
    subject,
    html,
  });
};

// Recommendation Request Email Functions
export const sendRecommendationRequestEmail = async (
  recipientEmail: string,
  recipientName: string,
  studentName: string,
  requestTitle: string,
  deadline: Date,
  secureToken: string,
  requestType: string,
  submissionMethod: string,
  communicationStyle: string,
  relationshipContext: string,
  institutionName?: string,
  schoolEmail?: string,
  schoolInstructions?: string,
  includeDraft: boolean = false,
  draftContent?: string,
  additionalContext?: string
): Promise<boolean> => {
  const deadlineFormatted = deadline.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/recommendation/${secureToken}`;

  const subject = `Recommendation Letter Request - ${studentName}`;

  // Generate appropriate greeting based on communication style
  const getGreeting = () => {
    switch (communicationStyle) {
      case 'formal':
        return `Dear ${recipientName},`;
      case 'friendly':
        return `Hi ${recipientName},`;
      default: // polite
        return `Dear ${recipientName},`;
    }
  };

  // Generate appropriate closing based on communication style
  const getClosing = () => {
    switch (communicationStyle) {
      case 'formal':
        return 'Thank you for your time and consideration.\n\nBest regards,\nThe Eddura Team';
      case 'friendly':
        return 'Thank you so much for your help!\n\nBest regards,\nThe Eddura Team';
      default: // polite
        return 'Thank you for your time and consideration.\n\nBest regards,\nThe Eddura Team';
    }
  };

  // Generate context paragraph based on relationship
  const getContextParagraph = () => {
    return `I hope this email finds you well. ${studentName} has requested a recommendation letter from you for their academic or professional pursuits. ${relationshipContext}`;
  };

  const getSchoolInfo = () => {
    if (requestType === 'school_direct' && institutionName) {
      return `
        <div style="background-color: #e3f2fd; border: 1px solid #2196f3; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #1976d2;">Institution Information</h4>
          <p><strong>Institution:</strong> ${institutionName}</p>
          ${schoolEmail ? `<p><strong>School Email:</strong> ${schoolEmail}</p>` : ''}
          ${schoolInstructions ? `<p><strong>Instructions:</strong> ${schoolInstructions}</p>` : ''}
        </div>
      `;
    }
    return '';
  };

  const getSubmissionInstructions = () => {
    if (requestType === 'school_direct' && submissionMethod === 'school_only') {
      return `
        <p>The institution (${institutionName || 'the school'}) will be sending you a direct email with their submission link. Please check your email for their request.</p>
      `;
    } else {
      return `
        <p>To submit your recommendation letter, please click the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${portalUrl}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Submit Recommendation Letter
          </a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${portalUrl}</p>
      `;
    }
  };

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Recommendation Letter Request</h2>
      
      <p>${getGreeting()}</p>
      
      <p>${getContextParagraph()}</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${requestTitle}</h3>
        <p><strong>Deadline:</strong> ${deadlineFormatted}</p>
      </div>
      
      ${getSchoolInfo()}
      
      ${getSubmissionInstructions()}
      
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
      
      ${additionalContext ? `
        <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="margin-top: 0;">Additional Context</h4>
          <p>${additionalContext}</p>
        </div>
      ` : ''}
      
      <p>${getClosing()}</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #666;">
        This is an automated message. Please do not reply to this email.
        If you have any questions, please contact the student directly.
      </p>
    </div>
  `;

  return sendEmail({
    to: recipientEmail,
    subject,
    html: htmlContent,
  });
};

export const sendRecommendationReminderEmail = async (
  recipientEmail: string,
  recipientName: string,
  studentName: string,
  requestTitle: string,
  deadline: Date,
  secureToken: string,
  daysUntilDeadline: number,
  requestType: string,
  submissionMethod: string,
  institutionName?: string,
  reminderNumber: number = 1
): Promise<boolean> => {
  const deadlineFormatted = deadline.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/recommendation/${secureToken}`;

  // Generate urgency-based subject and content
  const getUrgencyContent = () => {
    if (daysUntilDeadline === 1) {
      return {
        subject: `URGENT: Recommendation Letter Due TOMORROW - ${studentName}`,
        urgencyColor: '#dc3545',
        urgencyText: 'URGENT - Due Tomorrow!',
        urgencyMessage: 'This recommendation letter is due TOMORROW. Your prompt response is crucial for the student\'s application success.',
        buttonColor: '#dc3545'
      };
    } else if (daysUntilDeadline <= 3) {
      return {
        subject: `IMPORTANT: Recommendation Letter Due in ${daysUntilDeadline} Days - ${studentName}`,
        urgencyColor: '#fd7e14',
        urgencyText: `Due in ${daysUntilDeadline} Days`,
        urgencyMessage: `This recommendation letter is due in ${daysUntilDeadline} days. Please submit as soon as possible to ensure the student meets their deadline.`,
        buttonColor: '#fd7e14'
      };
    } else {
      return {
        subject: `Reminder: Recommendation Letter for ${studentName} - Due in ${daysUntilDeadline} Days`,
        urgencyColor: '#ffc107',
        urgencyText: `Due in ${daysUntilDeadline} Days`,
        urgencyMessage: `This is a friendly reminder that the recommendation letter is due in ${daysUntilDeadline} days.`,
        buttonColor: '#007bff'
      };
    }
  };

  const urgency = getUrgencyContent();

  const getSubmissionInstructions = () => {
    if (requestType === 'school_direct' && submissionMethod === 'school_only') {
      return `
        <p><strong>Reminder:</strong> The institution (${institutionName || 'the school'}) should be sending you a direct email with their submission link. Please check your email for their request.</p>
      `;
    } else {
      return `
        <p>To submit your recommendation letter, please click the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${portalUrl}" 
             style="background-color: ${urgency.buttonColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Submit Recommendation Letter NOW
          </a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${portalUrl}</p>
      `;
    }
  };

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Recommendation Letter Reminder</h2>
      
      <p>Dear ${recipientName},</p>
      
      <p>This is a friendly reminder that you have a pending recommendation letter request from ${studentName}.</p>
      
      <div style="background-color: ${urgency.urgencyColor}; color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: white;">${requestTitle}</h3>
        <p style="color: white;"><strong>Deadline:</strong> ${deadlineFormatted}</p>
        <p style="color: white;"><strong>Status:</strong> ${urgency.urgencyText}</p>
        <p style="color: white; font-weight: bold;">${urgency.urgencyMessage}</p>
      </div>
      
      ${getSubmissionInstructions()}
      
      <p>Thank you for your time and consideration.</p>
      
      <p>Best regards,<br>The Eddura Team</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #666;">
        This is an automated reminder. Please do not reply to this email.
        If you have any questions, please contact the student directly.
      </p>
    </div>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: urgency.subject,
    html: htmlContent,
  });
};

export const sendRecommendationReceivedEmail = async (
  studentEmail: string,
  studentName: string,
  recipientName: string,
  requestTitle: string
): Promise<boolean> => {
  const subject = `Recommendation Letter Received: ${requestTitle}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recommendation Letter Received</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #d4edda; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .button { display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🎉 Recommendation Letter Received!</h2>
        </div>
        
        <p>Great news, ${studentName}!</p>
        
        <p>Your recommendation letter from <strong>${recipientName}</strong> has been received for:</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${requestTitle}</h3>
        </div>
        
        <p>You can now proceed with your application process. Thank you for using the Eddura platform!</p>
        
        <div class="footer">
          <p>This notification was sent from the Eddura platform.</p>
          <p>Good luck with your application!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: studentEmail,
    subject,
    html,
  });
};