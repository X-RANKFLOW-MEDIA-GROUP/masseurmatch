'use client'

import { useEffect, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { format, parseISO, startOfToday, addDays } from 'date-fns'
import { Clock, ChevronRight } from 'lucide-react'
import type { AvailableSlot } from '@/lib/booking/types'

import 'react-day-picker/dist/style.css'

interface Props {
  therapistId: string
  onSlotSelected: (slot: AvailableSlot) => void
  selectedSlot?: AvailableSlot | null
}

export function BookingCalendar({ therapistId, onSlotSelected, selectedSlot }: Props) {
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  useEffect(() => {
    fetch(`/api/booking/slots?therapist_id=${therapistId}&days=21`)
      .then(r => r.json())
      .then((data: { slots?: AvailableSlot[] }) => {
        setSlots(data.slots ?? [])
      })
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [therapistId])

  const availableDates = new Set(slots.map(s => s.date))

  const timeSlotsForDate = selectedDate
    ? slots.filter(s => s.date === format(selectedDate, 'yyyy-MM-dd'))
    : []

  const today = startOfToday()
  const maxDate = addDays(today, 21)

  function isDayAvailable(day: Date): boolean {
    return availableDates.has(format(day, 'yyyy-MM-dd'))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-slate-400">
        Loading availability…
      </div>
    )
  }

  if (!slots.length) {
    return (
      <div className="py-8 text-center text-sm text-slate-400">
        No availability in the next 3 weeks. Reach out directly to arrange a time.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Calendar */}
      <div className="rdp-wrapper">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          fromDate={addDays(today, 1)}
          toDate={maxDate}
          modifiers={{ available: (d) => isDayAvailable(d) }}
          modifiersClassNames={{
            available: 'rdp-available',
          }}
          className="mx-auto"
        />
      </div>

      {/* Time slots for selected date */}
      {selectedDate && (
        <div>
          <p className="mb-3 text-sm font-medium text-slate-300">
            Available times — {format(selectedDate, 'EEEE, MMMM d')}
          </p>
          {timeSlotsForDate.length === 0 ? (
            <p className="text-sm text-slate-500">No slots on this day.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {timeSlotsForDate.map(slot => {
                const isSelected =
                  selectedSlot?.date === slot.date && selectedSlot?.time === slot.time
                return (
                  <button
                    key={`${slot.date}-${slot.time}`}
                    onClick={() => onSlotSelected(slot)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-all ${
                      isSelected
                        ? 'border-red-600 bg-red-600/10 text-red-400'
                        : 'border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/20 hover:bg-white/[0.07]'
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5 shrink-0 opacity-70" strokeWidth={2.25} />
                    {format(parseISO(`${slot.date}T${slot.time}`), 'h:mm a')}
                    {isSelected && <ChevronRight className="ml-auto h-3.5 w-3.5 text-red-400" strokeWidth={2.25} />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      <style>{`
        .rdp-available { font-weight: 600; color: #4ade80; }
        .rdp-available:not([disabled]):hover { background: rgba(74,222,128,0.1); }
      `}</style>
    </div>
  )
}
