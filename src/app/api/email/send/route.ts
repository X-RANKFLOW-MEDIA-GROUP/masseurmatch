import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

interface EmailData {
  to: string;
  template: string;
  data: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailData = await request.json();
    const { to, template, data } = body;

    if (!to || !template) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const htmlContent = renderTemplate(template, data);
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { message: 'Email service not configured', id: `mock-${Date.now()}` },
        { status: 200 }
      );
    }

    const resend = new Resend(apiKey);

    const result = await resend.emails.send({
      from: 'notifications@masseurmatch.com',
      to,
      subject: getSubjectLine(template, data),
      html: htmlContent,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return NextResponse.json(
      { message: 'Email sent successfully', id: result.data?.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json(
      { message: 'Failed to send email' },
      { status: 500 }
    );
  }
}

function getSubjectLine(template: string, data: Record<string, any>): string {
  switch (template) {
    case 'new-inquiry':
      return `New inquiry from ${data.clientName}`;
    case 'inquiry-received':
      return 'We received your inquiry';
    case 'inquiry-confirmed':
      return 'Your inquiry was sent successfully';
    default:
      return 'MasseurMatch Notification';
  }
}

function renderTemplate(template: string, data: Record<string, any>): string {
  switch (template) {
    case 'new-inquiry':
      return renderNewInquiryEmail(data);
    case 'inquiry-received':
      return renderInquiryReceivedEmail(data);
    case 'inquiry-confirmed':
      return renderInquiryConfirmedEmail(data);
    default:
      return '<p>Email notification</p>';
  }
}

function renderNewInquiryEmail(data: Record<string, any>): string {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: sans-serif; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #FF8A1F 0%, #F97316 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
      .content { border: 1px solid #ddd; border-radius: 0 0 8px 8px; padding: 20px; }
      .info-block { background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 15px 0; }
      .button { background: #FF8A1F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 15px; }
      .footer { font-size: 12px; color: #999; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>New Client Inquiry</h1>
        <p>You have a new message from ${data.clientName}</p>
      </div>
      <div class="content">
        <p>Hi ${data.therapistName},</p>
        
        <p>A new client has reached out to you on MasseurMatch:</p>
        
        <div class="info-block">
          <p><strong>From:</strong> ${data.clientName}</p>
          <p><strong>Email:</strong> <a href="mailto:${data.clientEmail}">${data.clientEmail}</a></p>
          ${data.clientPhone ? `<p><strong>Phone:</strong> ${data.clientPhone}</p>` : ''}
          <p><strong>Preferred contact:</strong> ${data.preferredContact}</p>
        </div>
        
        <p><strong>Message:</strong></p>
        <div class="info-block">
          ${data.message}
        </div>
        
        <p>
          <a href="${data.inquiryLink}" class="button">View in Dashboard</a>
        </p>
        
        <p>You can respond directly to their ${data.preferredContact === 'email' ? 'email address' : 'phone number'} or manage all inquiries in your <a href="${process.env.NEXT_PUBLIC_APP_URL}/pro/inquiries">inquiries dashboard</a>.</p>
        
        <p>Best regards,<br>The MasseurMatch Team</p>
        
        <div class="footer">
          <p>This is an automated notification. Please don't reply to this email.</p>
          <p>MasseurMatch &copy; 2026. All rights reserved.</p>
        </div>
      </div>
    </div>
  </body>
</html>
  `;
}

function renderInquiryReceivedEmail(data: Record<string, any>): string {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: sans-serif; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #FF8A1F 0%, #F97316 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
      .content { border: 1px solid #ddd; border-radius: 0 0 8px 8px; padding: 20px; }
      .info-block { background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 15px 0; }
      .footer { font-size: 12px; color: #999; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Your inquiry was received</h1>
      </div>
      <div class="content">
        <p>Hi ${data.clientName},</p>
        
        <p>Thank you for reaching out to ${data.therapistName} on MasseurMatch. Your inquiry has been received.</p>
        
        <div class="info-block">
          <p><strong>What happens next:</strong></p>
          <ul>
            <li>Your message has been sent to the therapist</li>
            <li>Most therapists respond within 24 hours</li>
            <li>You'll receive their response via ${data.preferredContact}</li>
          </ul>
        </div>
        
        <p>If you have any questions about MasseurMatch, visit our <a href="${process.env.NEXT_PUBLIC_APP_URL}/faq">FAQ page</a>.</p>
        
        <p>Best regards,<br>The MasseurMatch Team</p>
        
        <div class="footer">
          <p>This is an automated notification. Please don't reply to this email.</p>
          <p>MasseurMatch &copy; 2026. All rights reserved.</p>
        </div>
      </div>
    </div>
  </body>
</html>
  `;
}

function renderInquiryConfirmedEmail(data: Record<string, any>): string {
  return renderInquiryReceivedEmail(data);
}
