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
      from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
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