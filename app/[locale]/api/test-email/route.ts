import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { to } = await request.json();
    
    if (!to) {
      return NextResponse.json(
        { success: false, message: 'Email address is required' },
        { status: 400 }
      );
    }

    const success = await sendEmail({
      to,
      subject: 'Test Email from Document Feedback System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Test Email</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
            .success { color: #28a745; font-weight: bold; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Test Email Successful!</h1>
            </div>
            
            <h2>Document Feedback System</h2>
            <p>This is a test email from your Document Feedback & Review System.</p>
            
            <div class="success">
              <p>🎉 If you received this email, your Resend configuration is working correctly!</p>
            </div>
            
            <h3>What this means:</h3>
            <ul>
              <li>✅ Resend API key is configured correctly</li>
              <li>✅ Email sending functionality is working</li>
              <li>✅ Your domain/email setup is valid</li>
              <li>✅ The Document Feedback System can send notifications</li>
            </ul>
            
            <h3>Next Steps:</h3>
            <ol>
              <li>Start sharing documents for feedback</li>
              <li>Reviewers will receive professional invitation emails</li>
              <li>You'll get notifications when feedback is submitted</li>
              <li>All feedback will be centralized in your dashboard</li>
            </ol>
            
            <div class="footer">
              <p>This test was sent from the Document Feedback & Review System</p>
              <p>Powered by Resend</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test email sent successfully! Check your inbox.' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to send test email. Check your Resend configuration.' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error sending test email. Check server logs for details.' 
    }, { status: 500 });
  }
}

// GET endpoint to show test form
export async function GET() {
  return NextResponse.json({
    message: 'Use POST with { "to": "your-email@example.com" } to test email configuration',
    example: {
      method: 'POST',
      body: {
        to: 'your-email@example.com'
      }
    }
  });
}