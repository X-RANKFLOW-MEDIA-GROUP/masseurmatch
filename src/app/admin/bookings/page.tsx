'use client'

import { useEffect, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  User,
  Phone,
  Hotel,
  MessageSquare,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type { BookingInquiry } from '@/lib/booking/types'

// Light-surface, sober status palette (brand red for "needs approval",
// success green for approved/clean, red for denied/flagged, neutral otherwise).
const STATUS_CONFIG = {
  new:              { label: 'New',            icon: Clock,        iconBg: 'bg-slate-100',            iconText: 'text-slate-600',      badge: 'bg-slate-100 text-slate-700 border-slate-200' },
  checking:         { label: 'Reviewing',      icon: AlertCircle,  iconBg: 'bg-slate-100',            iconText: 'text-slate-600',      badge: 'bg-slate-100 text-slate-700 border-slate-200' },
  pending_approval: { label: 'Needs Approval', icon: AlertCircle,  iconBg: 'bg-brand-secondary/10',   iconText: 'text-brand-secondary', badge: 'bg-brand-secondary/10 text-brand-secondary border-brand-secondary/25' },
  approved:         { label: 'Approved',       icon: CheckCircle2, iconBg: 'bg-[#EFF6F1]',            iconText: 'text-[#1E7A46]',      badge: 'bg-[#EFF6F1] text-[#1E7A46] border-[#1E7A46]/30' },
  denied:           { label: 'Denied',         icon: XCircle,      iconBg: 'bg-red-50',              iconText: 'text-red-700',        badge: 'bg-red-50 text-red-700 border-red-200' },
  completed:        { label: 'Completed',      icon: CheckCircle2, iconBg: 'bg-slate-50',            iconText: 'text-slate-500',      badge: 'bg-slate-50 text-slate-600 border-slate-200' },
  cancelled:        { label: 'Cancelled',      icon: XCircle,      iconBg: 'bg-slate-50',            iconText: 'text-slate-500',      badge: 'bg-slate-50 text-slate-600 border-slate-200' },
} as const

const INTEL_CONFIG = {
  pending:      { label: 'Pending',      icon: Clock,        iconBg: 'bg-slate-100', iconText: 'text-slate-600', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
  running:      { label: 'Checking',     icon: Loader2,      iconBg: 'bg-slate-100', iconText: 'text-slate-600', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
  clean:        { label: 'Clean',        icon: ShieldCheck,  iconBg: 'bg-[#EFF6F1]', iconText: 'text-[#1E7A46]', badge: 'bg-[#EFF6F1] text-[#1E7A46] border-[#1E7A46]/30' },
  flagged:      { label: 'Flagged',      icon: ShieldAlert,  iconBg: 'bg-red-50',   iconText: 'text-red-700',   badge: 'bg-red-50 text-red-700 border-red-200' },
  inconclusive: { label: 'Inconclusive', icon: AlertCircle,  iconBg: 'bg-slate-100', iconText: 'text-slate-600', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
} as const

type FilterType = 'all' | BookingInquiry['status']

function riskBadge(riskLevel?: string) {
  if (!riskLevel) return null
  const colors: Record<string, string> = {
    low: 'bg-[#EFF6F1] text-[#1E7A46] border-[#1E7A46]/30',
    medium: 'bg-slate-100 text-slate-700 border-slate-200',
    high: 'bg-red-50 text-red-700 border-red-200',
    unknown: 'bg-slate-50 text-slate-600 border-slate-200',
  }
  return (
    <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${colors[riskLevel] ?? colors.unknown}`}>
      {riskLevel} risk
    </span>
  )
}

export default function AdminBookingsPage() {
  const [inquiries, setInquiries] = useState<BookingInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('pending_approval')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({})

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [filter])

  function load() {
    setLoading(true)
    const params = filter === 'all' ? '' : `?status=${filter}`
    fetch(`/api/booking/inquire${params}`)
      .then(r => r.json())
      .then((data: { inquiries?: BookingInquiry[] }) => {
        setInquiries(data.inquiries ?? [])
      })
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }

  async function handleAction(inquiryId: string, action: 'approve' | 'deny') {
    setActionLoading(inquiryId + action)
    try {
      const res = await fetch('/api/booking/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiry_id: inquiryId,
          action,
          admin_notes: adminNotes[inquiryId] ?? '',
        }),
      })
      const data = await res.json() as { ok: boolean }
      if (data.ok) load()
    } catch {
      // noop
    } finally {
      setActionLoading(null)
    }
  }

  const filters: { value: FilterType; label: string }[] = [
    { value: 'pending_approval', label: 'Needs Approval' },
    { value: 'new', label: 'New' },
    { value: 'checking', label: 'In Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'denied', label: 'Denied' },
    { value: 'all', label: 'All' },
  ]

  return (
    <div className="min-h-full bg-bg-subtle p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8B1E2D]">Admin</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-slate-900">
            Booking Inquiries
          </h1>
          <p className="mt-1 text-sm text-slate-500">Review and approve massage booking requests.</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                filter === f.value
                  ? 'bg-[#8B1E2D] text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" strokeWidth={2} />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
            No inquiries match this filter.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {inquiries.map(inq => {
              const statusCfg = STATUS_CONFIG[inq.status] ?? STATUS_CONFIG.new
              const intelCfg = INTEL_CONFIG[inq.intelligence_status] ?? INTEL_CONFIG.pending
              const StatusIcon = statusCfg.icon
              const isExpanded = expandedId === inq.id

              return (
                <div
                  key={inq.id}
                  className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                >
                  {/* Header row */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : inq.id)}
                    className="flex w-full items-start gap-4 p-5 text-left transition-colors hover:bg-slate-50"
                  >
                    {/* Status indicator */}
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${statusCfg.iconBg}`}>
                      <StatusIcon className={`h-4 w-4 ${statusCfg.iconText}`} strokeWidth={2.25} />
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900">{inq.client_name ?? 'Unknown Client'}</span>
                        <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest border ${statusCfg.badge}`}>
                          {statusCfg.label}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest border ${intelCfg.badge}`}>
                          {intelCfg.label}
                        </span>
                        {riskBadge(inq.intelligence_report?.riskLevel)}
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-slate-500">
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
                          <span className="flex items-center gap-1 text-[#1E7A46]">
                            <CalendarCheck className="h-3 w-3" strokeWidth={2.25} />
                            {inq.confirmed_date} @ {inq.confirmed_time}
                          </span>
                        )}
                        <span className="text-slate-400">
                          {format(parseISO(inq.created_at), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      {inq.message && (
                        <p className="mt-1 text-xs text-slate-400 line-clamp-1">"{inq.message}"</p>
                      )}
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2.25} />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2.25} />
                    )}
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 px-5 pb-5 pt-4 flex flex-col gap-5">
                      {/* Client details */}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Detail icon={User} label="Name" value={inq.client_name} />
                        <Detail icon={Phone} label="Phone" value={inq.client_phone} />
                        <Detail icon={Hotel} label="Hotel" value={inq.client_hotel} />
                        <Detail icon={MessageSquare} label="Service" value={`${inq.service_type ?? 'massage'} · ${inq.duration_minutes}min`} />
                        {inq.confirmed_date && (
                          <Detail icon={CalendarCheck} label="Requested Slot" value={`${inq.confirmed_date} @ ${inq.confirmed_time}`} />
                        )}
                      </div>

                      {/* Intelligence report */}
                      {inq.intelligence_report && Object.keys(inq.intelligence_report).length > 0 && (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Intelligence Report</p>
                          <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                            {inq.intelligence_report.carrier && <span>Carrier: {inq.intelligence_report.carrier}</span>}
                            {inq.intelligence_report.lineType && <span>Line: {inq.intelligence_report.lineType}</span>}
                            <span className={inq.intelligence_report.riskLevel === 'low' ? 'text-[#1E7A46]' : inq.intelligence_report.riskLevel === 'high' ? 'text-red-600' : 'text-slate-600'}>
                              Risk: {inq.intelligence_report.riskLevel}
                            </span>
                          </div>
                          {inq.intelligence_report.spamReports?.length > 0 && (
                            <div className="mt-3">
                              <p className="mb-1 text-[11px] text-red-600">Spam indicators found:</p>
                              <ul className="space-y-1">
                                {inq.intelligence_report.spamReports.slice(0, 3).map((r, i) => (
                                  <li key={i} className="text-[11px] text-slate-500 line-clamp-2">• {r}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* AI Conversation */}
                      {inq.ai_conversation?.length > 0 && (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">AI Conversation</p>
                          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                            {inq.ai_conversation.map((msg, i) => (
                              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${msg.role === 'user' ? 'bg-brand-secondary/10 text-brand-secondary' : 'bg-white text-slate-700 border border-slate-200'}`}>
                                  {msg.content}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Admin notes + Actions */}
                      {inq.status === 'pending_approval' && (
                        <div className="flex flex-col gap-3">
                          <textarea
                            rows={2}
                            placeholder="Admin notes (optional)…"
                            value={adminNotes[inq.id] ?? ''}
                            onChange={e => setAdminNotes(prev => ({ ...prev, [inq.id]: e.target.value }))}
                            className="resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-secondary/50 focus:outline-none"
                          />
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleAction(inq.id, 'approve')}
                              disabled={!!actionLoading}
                              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-700 disabled:opacity-60"
                            >
                              {actionLoading === inq.id + 'approve' ? (
                                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" strokeWidth={2.25} />
                              )}
                              Approve Booking
                            </button>
                            <button
                              onClick={() => handleAction(inq.id, 'deny')}
                              disabled={!!actionLoading}
                              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition-all hover:bg-red-100 disabled:opacity-60"
                            >
                              {actionLoading === inq.id + 'deny' ? (
                                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
                              ) : (
                                <XCircle className="h-4 w-4" strokeWidth={2.25} />
                              )}
                              Deny
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function Detail({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" strokeWidth={2.25} />
      <div>
        <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500">{label}</p>
        <p className="text-xs text-slate-700">{value}</p>
      </div>
    </div>
  )
}
