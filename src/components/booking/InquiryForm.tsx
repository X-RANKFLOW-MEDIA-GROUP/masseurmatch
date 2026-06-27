'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Calendar, CheckCircle2, Loader2, ArrowRight } from 'lucide-react'
import { BookingCalendar } from './BookingCalendar'
import type { AvailableSlot } from '@/lib/booking/types'

interface Props {
  therapistId: string
  therapistName?: string
}

type Step = 'form' | 'chat' | 'slot_select' | 'confirmed'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function InquiryForm({ therapistId, therapistName }: Props) {
  const [step, setStep] = useState<Step>('form')
  const [inquiryId, setInquiryId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Form state
  const [form, setForm] = useState({
    client_name: '',
    client_phone: '',
    client_email: '',
    client_hotel: '',
    service_type: 'swedish',
    duration_minutes: '60',
    message: '',
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function submitInquiry(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/booking/inquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          duration_minutes: parseInt(form.duration_minutes),
          therapist_id: therapistId,
          source: 'website',
        }),
      })

      const data = await res.json() as {
        ok: boolean
        inquiry_id?: string
        aiMessage?: string
      }

      if (data.ok && data.inquiry_id) {
        setInquiryId(data.inquiry_id)
        setMessages([{ role: 'assistant', content: data.aiMessage ?? 'hey, got your message!' }])
        setStep('chat')
      }
    } catch {
      // Keep form visible on failure
    } finally {
      setLoading(false)
    }
  }

  async function sendChatMessage() {
    if (!chatInput.trim() || !inquiryId) return
    const userMsg = chatInput.trim()
    setChatInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/booking/inquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquiry_id: inquiryId, client_message: userMsg }),
      })
      const data = await res.json() as { ok: boolean; aiMessage?: string }
      if (data.ok && data.aiMessage) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.aiMessage! }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "my bad, something went sideways. try again?" }])
    } finally {
      setLoading(false)
    }
  }

  async function confirmSlot() {
    if (!selectedSlot || !inquiryId) return
    setConfirmLoading(true)

    try {
      const res = await fetch('/api/booking/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiry_id: inquiryId,
          date: selectedSlot.date,
          time: selectedSlot.time,
        }),
      })
      const data = await res.json() as { ok: boolean; aiMessage?: string }
      if (data.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.aiMessage ?? "you're all set — pending final confirmation!" }])
        setStep('confirmed')
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "hit a snag, try again in a sec?" }])
    } finally {
      setConfirmLoading(false)
    }
  }

  if (step === 'form') {
    return (
      <form onSubmit={submitInquiry} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">Your Name</label>
            <input
              required
              value={form.client_name}
              onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
              placeholder="First name is fine"
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/20"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">Phone</label>
            <input
              required
              type="tel"
              value={form.client_phone}
              onChange={e => setForm(f => ({ ...f, client_phone: e.target.value }))}
              placeholder="+1 (555) 000-0000"
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/20"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">Email</label>
            <input
              type="email"
              value={form.client_email}
              onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))}
              placeholder="optional"
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/20"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">Hotel / Location</label>
            <input
              value={form.client_hotel}
              onChange={e => setForm(f => ({ ...f, client_hotel: e.target.value }))}
              placeholder="Hotel name or address"
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/20"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">Service</label>
            <select
              value={form.service_type}
              onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))}
              className="rounded-lg border border-white/10 bg-[#111111] px-3 py-2.5 text-sm text-white focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/20"
            >
              <option value="swedish">Swedish</option>
              <option value="deep_tissue">Deep Tissue</option>
              <option value="sports">Sports Massage</option>
              <option value="relaxation">Relaxation</option>
              <option value="hot_stone">Hot Stone</option>
              <option value="other">Other / Not sure</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">Duration</label>
            <select
              value={form.duration_minutes}
              onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))}
              className="rounded-lg border border-white/10 bg-[#111111] px-3 py-2.5 text-sm text-white focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/20"
            >
              <option value="60">60 min</option>
              <option value="90">90 min</option>
              <option value="120">120 min</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">Anything else? (optional)</label>
          <textarea
            rows={3}
            value={form.message}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            placeholder="Preferred dates, special requests, questions…"
            className="resize-none rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/20"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#8B1E2D] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-red-400 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
          ) : (
            <>
              Send Inquiry
              <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
            </>
          )}
        </button>
      </form>
    )
  }

  if (step === 'chat' || step === 'slot_select') {
    return (
      <div className="flex flex-col gap-4">
        {/* Chat messages */}
        <div className="flex max-h-64 flex-col gap-3 overflow-y-auto rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#8B1E2D]/90 text-white'
                    : 'bg-white/[0.08] text-slate-200'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 rounded-2xl bg-white/[0.08] px-4 py-2.5">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat input */}
        <div className="flex gap-2">
          <input
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
            placeholder="Reply…"
            disabled={loading}
            className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-red-500/50 focus:outline-none disabled:opacity-60"
          />
          <button
            onClick={sendChatMessage}
            disabled={loading || !chatInput.trim()}
            className="flex items-center justify-center rounded-lg bg-[#8B1E2D] px-3 py-2.5 transition-all hover:bg-red-400 disabled:opacity-60"
          >
            <Send className="h-4 w-4 text-white" strokeWidth={2.25} />
          </button>
        </div>

        {/* Show calendar picker */}
        {step === 'chat' && (
          <button
            onClick={() => setStep('slot_select')}
            className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-300 transition-all hover:border-red-500/40 hover:text-white"
          >
            <Calendar className="h-4 w-4" strokeWidth={2.25} />
            Pick a date &amp; time
          </button>
        )}

        {step === 'slot_select' && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <BookingCalendar
              therapistId={therapistId}
              onSlotSelected={setSelectedSlot}
              selectedSlot={selectedSlot}
            />
            {selectedSlot && (
              <button
                onClick={confirmSlot}
                disabled={confirmLoading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-400 disabled:opacity-60"
              >
                {confirmLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" strokeWidth={2.25} />
                    Confirm {selectedSlot.label}
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  // Confirmed
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
        <CheckCircle2 className="h-8 w-8 text-emerald-400" strokeWidth={2} />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">Request Received!</h3>
        <p className="mt-1 text-sm text-slate-400">
          {selectedSlot
            ? `Your slot on ${selectedSlot.label} is pending confirmation.`
            : "We'll be in touch to confirm your booking."}
          {' '}You'll hear back within the hour.
        </p>
      </div>
      {messages.length > 0 && (
        <div className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left">
          <p className="text-sm text-slate-300">{messages[messages.length - 1]?.content}</p>
        </div>
      )}
    </div>
  )
}
