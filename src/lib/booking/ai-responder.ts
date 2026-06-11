/**
 * Orchestrates the full inquiry response flow:
 * 1. Save inquiry to DB
 * 2. Sync to Google Sheets
 * 3. Run background intelligence check
 * 4. Generate AI response via DeepSeek
 * 5. Update everything
 */

import { createSupabaseAdminClient } from '@/app/api/_lib/supabase-server'
import { runIntelligence, intelligenceStatusFromReport } from './intelligence'
import { chatWithDeepSeek, generateWelcomeResponse, getHoldMessage } from './deepseek'
import { appendInquiryToSheet, updateInquiryRow } from './sheets'
import type { BookingInquiry, ConversationMessage, NewInquiryInput } from './types'

async function saveInquiry(input: NewInquiryInput): Promise<BookingInquiry | null> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('booking_inquiries')
    .insert({
      client_name: input.client_name ?? null,
      client_phone: input.client_phone ?? null,
      client_email: input.client_email ?? null,
      client_hotel: input.client_hotel ?? null,
      service_type: input.service_type ?? null,
      preferred_date: input.preferred_date ?? null,
      preferred_time: input.preferred_time ?? null,
      duration_minutes: input.duration_minutes ?? 60,
      message: input.message ?? null,
      source: input.source ?? 'website',
      therapist_id: input.therapist_id ?? null,
      status: 'new',
      intelligence_status: 'pending',
    })
    .select()
    .single()

  if (error) return null
  return data as unknown as BookingInquiry
}

async function pushAiMessage(inquiryId: string, message: string, conversation: ConversationMessage[]): Promise<void> {
  const supabase = createSupabaseAdminClient()
  const updated: ConversationMessage[] = [
    ...conversation,
    { role: 'assistant', content: message, ts: new Date().toISOString() },
  ]
  await supabase
    .from('booking_inquiries')
    .update({ ai_conversation: updated as unknown as never, status: 'checking' })
    .eq('id', inquiryId)
}

// Runs intelligence + full AI response asynchronously after the initial response is sent
export async function runBackgroundIntelligence(inquiryId: string): Promise<void> {
  const supabase = createSupabaseAdminClient()

  // Mark as checking
  const { data: inquiry } = await supabase
    .from('booking_inquiries')
    .select('*')
    .eq('id', inquiryId)
    .single()

  if (!inquiry) return

  const typed = inquiry as unknown as BookingInquiry

  // Mark intelligence as running
  await supabase
    .from('booking_inquiries')
    .update({ intelligence_status: 'running' })
    .eq('id', inquiryId)

  // Run intelligence check
  const report = await runIntelligence(typed.client_phone ?? '', typed.client_name)
  const intStatus = intelligenceStatusFromReport(report)

  // Generate full AI welcome response now that we have context
  const welcomeMsg = await generateWelcomeResponse({
    client_name: typed.client_name,
    service_type: typed.service_type,
    preferred_date: typed.preferred_date,
    preferred_time: typed.preferred_time,
    message: typed.message,
  })

  const existingConvo = (typed.ai_conversation ?? []) as ConversationMessage[]
  const newConvo: ConversationMessage[] = [
    // Remove the hold message if it was the only thing there
    ...existingConvo.filter(m => m.role !== 'assistant'),
    { role: 'assistant', content: welcomeMsg, ts: new Date().toISOString() },
  ]

  // Save intelligence + AI response
  const { data: updated } = await supabase
    .from('booking_inquiries')
    .update({
      intelligence_status: intStatus,
      intelligence_report: report as unknown as never,
      ai_conversation: newConvo as unknown as never,
      status: intStatus === 'flagged' ? 'checking' : 'checking',
    })
    .eq('id', inquiryId)
    .select()
    .single()

  if (!updated) return

  // Sync to Google Sheets
  const fullInquiry = updated as unknown as BookingInquiry
  if (fullInquiry.sheets_row_id) {
    await updateInquiryRow(fullInquiry.sheets_row_id, fullInquiry)
  }
}

// Main entry point: create inquiry and return initial AI response
export async function createInquiryAndRespond(input: NewInquiryInput): Promise<{
  inquiry: BookingInquiry
  aiMessage: string
  immediate: boolean
}> {
  const inquiry = await saveInquiry(input)
  if (!inquiry) throw new Error('Failed to save inquiry')

  // Try a quick intelligence check first (3s timeout)
  let quickReport = null
  if (inquiry.client_phone) {
    try {
      quickReport = await Promise.race([
        runIntelligence(inquiry.client_phone, inquiry.client_name),
        new Promise<null>(resolve => setTimeout(() => resolve(null), 3000)),
      ])
    } catch {
      quickReport = null
    }
  }

  let aiMessage: string
  let immediate = false

  if (quickReport) {
    // Got intelligence quickly — generate full welcome
    const intStatus = intelligenceStatusFromReport(quickReport)
    aiMessage = await generateWelcomeResponse({
      client_name: input.client_name,
      service_type: input.service_type,
      preferred_date: input.preferred_date,
      preferred_time: input.preferred_time,
      message: input.message,
    })
    immediate = true

    const convo: ConversationMessage[] = [
      { role: 'assistant', content: aiMessage, ts: new Date().toISOString() },
    ]

    const supabase = createSupabaseAdminClient()
    await supabase
      .from('booking_inquiries')
      .update({
        intelligence_status: intStatus,
        intelligence_report: quickReport as unknown as never,
        ai_conversation: convo as unknown as never,
        status: 'checking',
      })
      .eq('id', inquiry.id)
  } else {
    // Intelligence is taking time — send hold message first
    aiMessage = getHoldMessage()
    await pushAiMessage(inquiry.id, aiMessage, [])
    immediate = false
  }

  // Sync to Google Sheets (async, don't await)
  appendInquiryToSheet({ ...inquiry, ai_conversation: [] })
    .then(rowId => {
      if (rowId) {
        const supabase = createSupabaseAdminClient()
        supabase.from('booking_inquiries').update({ sheets_row_id: rowId }).eq('id', inquiry.id)
      }
    })
    .catch(() => undefined)

  return { inquiry: { ...inquiry }, aiMessage, immediate }
}

// Continue an existing AI conversation (client replied)
export async function continueConversation(
  inquiryId: string,
  clientMessage: string
): Promise<string> {
  const supabase = createSupabaseAdminClient()
  const { data } = await supabase
    .from('booking_inquiries')
    .select('*')
    .eq('id', inquiryId)
    .single()

  if (!data) return "hey, something went sideways on my end. mind trying again?"

  const inquiry = data as unknown as BookingInquiry
  const history = (inquiry.ai_conversation ?? []) as ConversationMessage[]

  // Append client message
  const updatedHistory: ConversationMessage[] = [
    ...history,
    { role: 'user', content: clientMessage, ts: new Date().toISOString() },
  ]

  const aiReply = await chatWithDeepSeek(updatedHistory) ??
    "my bad, having a lil tech issue rn. lmk if you wanna try again in a sec"

  const finalHistory: ConversationMessage[] = [
    ...updatedHistory,
    { role: 'assistant', content: aiReply, ts: new Date().toISOString() },
  ]

  await supabase
    .from('booking_inquiries')
    .update({ ai_conversation: finalHistory as unknown as never })
    .eq('id', inquiryId)

  // Update Sheet
  if (inquiry.sheets_row_id) {
    const { data: updated } = await supabase
      .from('booking_inquiries')
      .select('*')
      .eq('id', inquiryId)
      .single()
    if (updated) {
      await updateInquiryRow(inquiry.sheets_row_id, updated as unknown as BookingInquiry)
    }
  }

  return aiReply
}
