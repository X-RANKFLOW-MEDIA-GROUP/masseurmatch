import { SignJWT, importPKCS8 } from 'jose'
import type { BookingInquiry } from './types'

// Spreadsheet ID from the user's Google Sheet URL
const SHEETS_ID = process.env.GOOGLE_SHEETS_ID || '1BocEQ4Or_PuwaVCgsNIZZdNwbcGu01ro'
const SHEET_NAME = 'Bookings'

// Column order must match appendRow() below
const HEADERS = [
  'Timestamp',
  'Inquiry ID',
  'Client Name',
  'Phone',
  'Email',
  'Hotel',
  'Service',
  'Preferred Date',
  'Preferred Time',
  'Duration (min)',
  'Message',
  'Status',
  'Intelligence',
  'Risk Level',
  'Confirmed Date',
  'Confirmed Time',
  'Admin Notes',
]

async function getServiceAccountToken(): Promise<string | null> {
  const credJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!credJson) return null

  try {
    const cred = JSON.parse(credJson) as {
      client_email: string
      private_key: string
    }

    const privateKey = await importPKCS8(cred.private_key, 'RS256')
    const now = Math.floor(Date.now() / 1000)

    const assertion = await new SignJWT({
      iss: cred.client_email,
      sub: cred.client_email,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
    })
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuedAt(now)
      .setExpirationTime(now + 3600)
      .sign(privateKey)

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion,
      }),
    })

    if (!res.ok) return null
    const data = (await res.json()) as { access_token?: string }
    return data.access_token ?? null
  } catch {
    return null
  }
}

async function sheetsRequest(
  token: string,
  method: string,
  endpoint: string,
  body?: unknown
): Promise<Response> {
  return fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
}

async function ensureHeaders(token: string): Promise<void> {
  const checkRes = await sheetsRequest(token, 'GET', `/values/${encodeURIComponent(SHEET_NAME)}!A1:A1`)
  if (!checkRes.ok) return
  const data = (await checkRes.json()) as { values?: string[][] }
  if (data.values?.length) return // Headers exist

  await sheetsRequest(token, 'POST', `/values/${encodeURIComponent(SHEET_NAME)}!A1:append?valueInputOption=RAW`, {
    values: [HEADERS],
  })
}

function inquiryToRow(inquiry: BookingInquiry): string[] {
  return [
    new Date(inquiry.created_at).toLocaleString('en-US', { timeZone: 'America/New_York' }),
    inquiry.id,
    inquiry.client_name ?? '',
    inquiry.client_phone ?? '',
    inquiry.client_email ?? '',
    inquiry.client_hotel ?? '',
    inquiry.service_type ?? '',
    inquiry.preferred_date ?? '',
    inquiry.preferred_time ?? '',
    String(inquiry.duration_minutes ?? 60),
    inquiry.message ?? '',
    inquiry.status,
    inquiry.intelligence_status,
    inquiry.intelligence_report?.riskLevel ?? '',
    inquiry.confirmed_date ?? '',
    inquiry.confirmed_time ?? '',
    inquiry.admin_notes ?? '',
  ]
}

export async function appendInquiryToSheet(inquiry: BookingInquiry): Promise<string | null> {
  const token = await getServiceAccountToken()
  if (!token) return null

  try {
    await ensureHeaders(token)

    const res = await sheetsRequest(
      token,
      'POST',
      `/values/${encodeURIComponent(SHEET_NAME)}!A:A:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS&includeValuesInResponse=true`,
      { values: [inquiryToRow(inquiry)] }
    )

    if (!res.ok) return null
    const data = (await res.json()) as {
      updates?: { updatedRange?: string }
    }

    // Return row number from range like "Bookings!A5:Q5"
    const range = data.updates?.updatedRange
    const match = range?.match(/!A(\d+)/)
    return match?.[1] ?? null
  } catch {
    return null
  }
}

export async function updateInquiryRow(rowId: string, inquiry: BookingInquiry): Promise<void> {
  const token = await getServiceAccountToken()
  if (!token) return

  try {
    const range = `${SHEET_NAME}!A${rowId}:Q${rowId}`
    await sheetsRequest(
      token,
      'PUT',
      `/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
      { values: [inquiryToRow(inquiry)] }
    )
  } catch {
    // Best-effort — Sheets sync should never block the main flow
  }
}
