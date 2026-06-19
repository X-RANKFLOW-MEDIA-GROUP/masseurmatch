import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/app/api/_lib/supabase-server'
import { errorResponse } from '@/app/api/_lib/http'
import { getTwilioClient } from '@/lib/sms/twilio-utils'

// GET /api/sms/status — Twilio connectivity check + active profile counts
export async function GET(request: NextRequest) {
  try {
    await requireAdminSession(request as unknown as Request)
    const client = getTwilioClient()

    let twilioConnected = false
    let accountName: string | null = null
    let phoneNumbers: Array<{ phone_number: string; friendly_name: string }> = []

    if (client) {
      try {
        const account = await client.api.v2010.accounts(process.env.TWILIO_ACCOUNT_SID!).fetch()
        twilioConnected = account.status === 'active'
        accountName = account.friendlyName

        const numbers = await client.incomingPhoneNumbers.list({ limit: 20 })
        phoneNumbers = numbers.map(n => ({
          phone_number: n.phoneNumber,
          friendly_name: n.friendlyName,
        }))
      } catch {
        twilioConnected = false
      }
    }

    return NextResponse.json({
      ok: true,
      twilio: {
        connected: twilioConnected,
        account_name: accountName,
        phone_numbers: phoneNumbers,
        has_credentials: Boolean(
          process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
        ),
      },
    })
  } catch (err) {
    return errorResponse(err)
  }
}
