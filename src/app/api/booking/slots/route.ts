import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/app/api/_lib/supabase-server'
import { addDays, format, parseISO } from 'date-fns'
import type { AvailableSlot } from '@/lib/booking/types'

// GET /api/booking/slots?therapist_id=xxx&days=14
// Returns available booking slots for the next N days based on therapist_availability
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const therapistId = searchParams.get('therapist_id')
  const days = Math.min(parseInt(searchParams.get('days') ?? '14', 10), 60)

  if (!therapistId) return NextResponse.json({ error: 'therapist_id required' }, { status: 400 })

  const supabase = createSupabaseAdminClient()

  // Load weekly availability slots
  const { data: availability } = await supabase
    .from('therapist_availability')
    .select('*')
    .eq('therapist_id', therapistId)

  if (!availability?.length) {
    return NextResponse.json({ slots: [] })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const endDate = addDays(today, days)

  // Load all confirmed appointments in that range
  const { data: booked } = await supabase
    .from('appointments')
    .select('start_time, end_time')
    .eq('therapist_id', therapistId)
    .in('status', ['pending', 'confirmed'])
    .gte('start_time', today.toISOString())
    .lte('start_time', endDate.toISOString())

  const bookedTimes = new Set(
    (booked ?? []).map(a => {
      const d = new Date(a.start_time as string)
      return `${format(d, 'yyyy-MM-dd')}_${format(d, 'HH:mm')}`
    })
  )

  // Also load pending approval booking inquiries to avoid double-booking
  const { data: pendingInquiries } = await supabase
    .from('booking_inquiries')
    .select('confirmed_date, confirmed_time')
    .eq('therapist_id', therapistId)
    .in('status', ['pending_approval', 'approved'])
    .gte('confirmed_date', format(today, 'yyyy-MM-dd'))
    .lte('confirmed_date', format(endDate, 'yyyy-MM-dd'))

  for (const inq of pendingInquiries ?? []) {
    if (inq.confirmed_date && inq.confirmed_time) {
      bookedTimes.add(`${inq.confirmed_date}_${inq.confirmed_time}`)
    }
  }

  const slots: AvailableSlot[] = []

  for (let i = 1; i <= days; i++) {
    const date = addDays(today, i)
    const dayOfWeek = date.getDay()
    const dateStr = format(date, 'yyyy-MM-dd')

    const daySlots = availability.filter(a => a.day_of_week === dayOfWeek)

    for (const slot of daySlots) {
      // Generate hourly slots within each availability window
      const [startH, startM] = (slot.start_time as string).split(':').map(Number)
      const [endH] = (slot.end_time as string).split(':').map(Number)

      for (let h = startH; h < endH; h++) {
        const time = `${String(h).padStart(2, '0')}:${String(startM || 0).padStart(2, '0')}`
        const key = `${dateStr}_${time}`

        if (!bookedTimes.has(key)) {
          const label = format(parseISO(`${dateStr}T${time}`), 'EEE, MMM d · h:mm a')
          slots.push({ date: dateStr, time, label })
        }
      }
    }
  }

  return NextResponse.json({ slots })
}
