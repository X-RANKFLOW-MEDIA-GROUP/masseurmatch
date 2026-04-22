import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

interface SMSPayload {
  to: string;
  message: string;
  type: 'confirmation' | 'reminder' | 'notification';
}

export async function POST(request: NextRequest) {
  try {
    if (!accountSid || !authToken || !fromNumber) {
      return NextResponse.json(
        { error: 'SMS service not configured' },
        { status: 500 }
      );
    }

    const { to, message, type }: SMSPayload = await request.json();

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, message' },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!/^\+?[1-9]\d{1,14}$/.test(to)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: to,
    });

    return NextResponse.json({
      success: true,
      messageId: result.sid,
      type,
    });
  } catch (error) {
    console.error('SMS API error:', error);
    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    );
  }
}
