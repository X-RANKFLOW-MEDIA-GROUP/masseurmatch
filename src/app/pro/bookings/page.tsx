'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { LucideIcon } from 'lucide-react'
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  Hotel,
  MessageSquare,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type { BookingInquiry } from '@/lib/booking/types'

const supabase = createClient()

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  checking: { label: 'In Review', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  pending_approval: { label: 'Pending Approval', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  approved: { label: 'Confirmed', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  denied: { label: 'Denied', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  completed: { label: 'Completed', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
  cancelled: { label: 'Cancelled', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
}

export default function ProBookingsPage() {
  const [inquiries, setInquiries] = useState<BookingInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [therapistId, setTherapistId] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get therapist profile id
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!profile) return
      setTherapistId(profile.id)

      // Load inquiries for this therapist
      const { data } = await supabase
        .from('booking_inquiries')
        .select('*')
        .eq('therapist_id', profile.id)
        .order('created_at', { ascending: false })

      setInquiries((data ?? []) as unknown as BookingInquiry[])
      setLoading(false)
    }

    init()

    // Real-time updates
    const channel = supabase
      .channel('booking_inquiries_pro')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'booking_inquiries' }, () => {
        init()
      })
      .subscribe()

    return () => { channel.unsubscribe() }
  }, [])

  const pending = inquiries.filter(i => i.status === 'pending_approval')
  const upcoming = inquiries.filter(i => i.status === 'approved')
  const recent = inquiries.filter(i => !['pending_approval', 'approved'].includes(i.status))

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1A1A1A]">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" strokeWidth={2} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#FF8A1F]">Your Dashboard</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-white">Bookings</h1>
          <p className="mt-1 text-sm text-slate-400">Incoming booking inquiries for your massage services.</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <StatCard label="Awaiting Approval" value={pending.length} color="orange" />
          <StatCard label="Confirmed" value={upcoming.length} color="emerald" />
          <StatCard label="Total Inquiries" value={inquiries.length} color="slate" />
        </div>

        {/* Pending approval */}
        {pending.length > 0 && (
          <section className="mb-8">
            <SectionHeader icon={AlertCircle} label="Awaiting Admin Approval" color="orange" />
            <div className="flex flex-col gap-3">
              {pending.map(inq => (
                <InquiryCard key={inq.id} inquiry={inq} expanded={expandedId === inq.id} onToggle={() => setExpandedId(expandedId === inq.id ? null : inq.id)} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming confirmed */}
        {upcoming.length > 0 && (
          <section className="mb-8">
            <SectionHeader icon={Calendar} label="Confirmed Bookings" color="emerald" />
            <div className="flex flex-col gap-3">
              {upcoming.map(inq => (
                <InquiryCard key={inq.id} inquiry={inq} expanded={expandedId === inq.id} onToggle={() => setExpandedId(expandedId === inq.id ? null : inq.id)} />
              ))}
            </div>
          </section>
        )}

        {/* Recent */}
        {recent.length > 0 && (
          <section>
            <SectionHeader icon={Clock} label="Recent Activity" color="slate" />
            <div className="flex flex-col gap-3">
              {recent.slice(0, 20).map(inq => (
                <InquiryCard key={inq.id} inquiry={inq} expanded={expandedId === inq.id} onToggle={() => setExpandedId(expandedId === inq.id ? null : inq.id)} />
              ))}
            </div>
          </section>
        )}

        {inquiries.length === 0 && (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-20 text-center text-sm text-slate-500">
            No booking inquiries yet. They'll show up here when clients reach out.
          </div>
        )}
      </div>
    </div>
  )
}

const COLOR_TEXT: Record<string, string> = {
  orange: 'text-red-400',
  emerald: 'text-emerald-400',
  slate: 'text-slate-400',
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const textCls = COLOR_TEXT[color] ?? 'text-slate-400'
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <p className={`text-2xl font-bold ${textCls}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  )
}

function SectionHeader({ icon: Icon, label, color }: { icon: LucideIcon; label: string; color: string }) {
  const textCls = COLOR_TEXT[color] ?? 'text-slate-400'
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon className={`h-4 w-4 ${textCls}`} strokeWidth={2.25} />
      <p className={`font-mono text-[10px] uppercase tracking-[0.18em] ${textCls}`}>{label}</p>
    </div>
  )
}

function InquiryCard({ inquiry: inq, expanded, onToggle }: { inquiry: BookingInquiry; expanded: boolean; onToggle: () => void }) {
  const statusCfg = STATUS_LABELS[inq.status] ?? STATUS_LABELS.new

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <button onClick={onToggle} className="flex w-full items-start gap-4 p-4 text-left hover:bg-white/[0.02] transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-white">{inq.client_name ?? 'Unknown'}</span>
            <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${statusCfg.color}`}>
              {statusCfg.label}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-400">
            {inq.client_phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" strokeWidth={2.25} />
                {inq.client_phone}
              </span>
            )}
            {inq.client_hotel && (
              <span className="flex items-center gap-1">
                <Hotel className="h-3 w-3" strokeWidth={2.25} />
                {inq.client_hotel}
              </span>
            )}
            {inq.confirmed_date && (
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="h-3 w-3" strokeWidth={2.25} />
                {inq.confirmed_date} @ {inq.confirmed_time}
              </span>
            )}
            <span className="text-slate-600">{format(parseISO(inq.created_at), 'MMM d, h:mm a')}</span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-slate-500 mt-1" strokeWidth={2.25} />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-500 mt-1" strokeWidth={2.25} />
        )}
      </button>

      {expanded && (
        <div className="border-t border-white/[0.06] p-4 flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            {inq.client_email && <InfoRow label="Email" value={inq.client_email} />}
            {inq.service_type && <InfoRow label="Service" value={`${inq.service_type} · ${inq.duration_minutes}min`} />}
            {inq.message && <InfoRow label="Message" value={inq.message} className="sm:col-span-2" />}
          </div>

          {/* AI conversation */}
          {inq.ai_conversation?.length > 0 && (
            <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
              <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-slate-500">AI Chat Transcript</p>
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                {inq.ai_conversation.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-xl px-3 py-1.5 text-xs ${msg.role === 'user' ? 'bg-[#FF8A1F]/20 text-orange-100' : 'bg-white/[0.06] text-slate-300'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-0.5 text-xs text-slate-300">{value}</p>
    </div>
  )
}
