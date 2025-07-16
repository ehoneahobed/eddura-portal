# Resend Email Setup Guide

## Overview

This guide will help you set up Resend for the Document Feedback & Review System. Resend is a modern email API that provides reliable email delivery with excellent developer experience.

## Why Resend?

- **Simple API**: Easy to integrate with just an API key
- **High Deliverability**: Excellent email delivery rates
- **Developer Friendly**: Great documentation and SDKs
- **Affordable**: Generous free tier (3,000 emails/month)
- **Modern**: Built for developers with TypeScript support

## Setup Steps

### 1. Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key

1. Log into your Resend dashboard
2. Go to the "API Keys" section
3. Click "Create API Key"
4. Give it a name (e.g., "Document Feedback System")
5. Copy the API key (starts with `re_`)

### 3. Verify Your Domain (Recommended)

For production use, you should verify your domain:

1. In your Resend dashboard, go to "Domains"
2. Click "Add Domain"
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the required DNS records to your domain provider
5. Wait for verification (usually takes a few minutes)

### 4. Configure Environment Variables

Add these variables to your `.env.local` file:

```env
# Resend Configuration
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=noreply@yourdomain.com

# For development (if you don't have a verified domain)
# FROM_EMAIL=onboarding@resend.dev
```

### 5. Test Email Configuration

You can test the email setup by creating a simple test endpoint:

```typescript
// app/api/test-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { to } = await request.json();
    
    const success = await sendEmail({
      to,
      subject: 'Test Email from Document Feedback System',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email from your Document Feedback System.</p>
        <p>If you received this, your Resend configuration is working correctly!</p>
      `
    });

    if (success) {
      return NextResponse.json({ success: true, message: 'Test email sent successfully' });
    } else {
      return NextResponse.json({ success: false, message: 'Failed to send test email' }, { status: 500 });
    }
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({ success: false, message: 'Error sending test email' }, { status: 500 });
  }
}
```

## Email Templates

The system includes two professional email templates:

### 1. Document Share Email
Sent when a document is shared for review:
- Professional invitation design
- Document title and details
- Custom message from document owner
- Direct link to review page
- Responsive design

### 2. Feedback Received Email
Sent when new feedback is submitted:
- Notification of new feedback
- Reviewer information
- Link to view feedback
- Professional styling

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `RESEND_API_KEY` | Your Resend API key | Yes | `re_1234567890abcdef` |
| `FROM_EMAIL` | Sender email address | Yes | `noreply@yourdomain.com` |

## Troubleshooting

### Common Issues

1. **"API key not configured" warning**
   - Make sure `RESEND_API_KEY` is set in your environment variables
   - Restart your development server after adding the variable

2. **"Invalid API key" error**
   - Verify your API key is correct
   - Check that the key starts with `re_`
   - Ensure the key is active in your Resend dashboard

3. **"Domain not verified" error**
   - Use `onboarding@resend.dev` for testing
   - Verify your domain in Resend dashboard for production
   - Check DNS records are correctly configured

4. **Emails not being sent**
   - Check browser console for errors
   - Verify network connectivity
   - Check Resend dashboard for delivery status

### Testing in Development

For development and testing, you can use:
- `onboarding@resend.dev` as the FROM_EMAIL
- Your personal email for testing
- Resend's built-in email preview feature

### Production Considerations

1. **Domain Verification**: Always verify your domain for production
2. **Rate Limits**: Resend has generous limits (3,000 emails/month free)
3. **Monitoring**: Use Resend dashboard to monitor email delivery
4. **Error Handling**: The system gracefully handles email failures

## Security Best Practices

1. **API Key Security**
   - Never commit API keys to version control
   - Use environment variables
   - Rotate keys periodically

2. **Email Validation**
   - Validate email addresses before sending
   - Implement rate limiting for email sending
   - Monitor for abuse

3. **Privacy**
   - Only send emails to verified recipients
   - Include unsubscribe options for marketing emails
   - Comply with email regulations (CAN-SPAM, GDPR)

## Cost Considerations

### Resend Pricing (as of 2024)
- **Free Tier**: 3,000 emails/month
- **Pro Plan**: $20/month for 50,000 emails
- **Enterprise**: Custom pricing

### Estimating Usage
- Document share emails: ~1 per share
- Feedback notifications: ~1 per feedback submission
- Typical usage: 100-500 emails/month for small to medium usage

## Support

- **Resend Documentation**: [docs.resend.com](https://docs.resend.com)
- **Resend Support**: Available in dashboard
- **Community**: Active Discord community

## Migration from Other Email Services

If you're migrating from another email service:

1. **Export your domain DNS records**
2. **Add domain to Resend**
3. **Update DNS records**
4. **Test email delivery**
5. **Update environment variables**
6. **Monitor delivery rates**

The Document Feedback System is designed to work seamlessly with Resend and provides a much better developer experience compared to traditional SMTP services.