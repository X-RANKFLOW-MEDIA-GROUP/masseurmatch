'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Wifi,
  WifiOff,
  Send,
  Clock,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  User,
  MapPin,
  DollarSign,
} from 'lucide-react'
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import type { Conversation, SmsFollowUpAlert, SmsProfile } from '@/lib/sms/types'

// ─── Types ───────────────────────────────────────────────────────────────────

interface TwilioStatus {
  connected: boolean
  account_name: string | null
  phone_numbers: Array<{ phone_number: string; friendly_name: string }>
  has_credentials: boolean
}

interface AlertWithMeta extends SmsFollowUpAlert {
  minutes_waiting: number
  sms_profiles?: { twilio_number: string | null; profiles?: { display_name: string | null } | null } | null
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SmsAdminPage() {
  const [tab, setTab] = useState<'conversations' | 'alerts' | 'profiles'>('conversations')
  const [twilio, setTwilio] = useState<TwilioStatus | null>(null)
  const [twilioLoading, setTwilioLoading] = useState(true)
  const [alertCount, setAlertCount] = useState(0)
  const refreshRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    loadStatus()
    // Auto-refresh alerts every 2 min
    refreshRef.current = setInterval(() => loadStatus(), 120000)
    return () => { if (refreshRef.current) clearInterval(refreshRef.current) }
  }, [])

  async function loadStatus() {
    setTwilioLoading(true)
    try {
      const [statusRes, alertsRes] = await Promise.all([
        fetch('/api/sms/status'),
        fetch('/api/sms/alerts'),
      ])
      const statusData = await statusRes.json() as { twilio: TwilioStatus }
      const alertsData = await alertsRes.json() as { total: number }
      setTwilio(statusData.twilio)
      setAlertCount(alertsData.total ?? 0)
    } catch {
      // noop
    } finally {
      setTwilioLoading(false)
    }
  }

  const tabs = [
    { id: 'conversations', label: 'Messages', icon: MessageSquare },
    { id: 'alerts', label: `Alerts${alertCount > 0 ? ` (${alertCount})` : ''}`, icon: AlertTriangle },
    { id: 'profiles', label: 'Profiles', icon: User },
  ] as const

  return (
    <div className="min-h-screen bg-[#111111]">
      {/* Header */}
      <div className="border-b border-white/[0.06] px-6 py-6">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8B1E2D]">Admin</p>
            <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-white">SMS Center</h1>
            <p className="mt-1 text-sm text-slate-400">Automated SMS responses, logs, and follow-up alerts.</p>
          </div>
          {/* Twilio status pill */}
          <div className="flex items-center gap-3">
            {twilioLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-500" strokeWidth={2} />
            ) : twilio?.connected ? (
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400">
                <Wifi className="h-3.5 w-3.5" strokeWidth={2.25} /> Connected
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full border border-slate-500/20 bg-slate-500/10 px-3 py-1.5 text-xs text-slate-400">
                <WifiOff className="h-3.5 w-3.5" strokeWidth={2.25} /> Not configured
              </span>
            )}
            <button
              onClick={loadStatus}
              className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className="h-4 w-4" strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/[0.06] px-6">
        <div className="mx-auto max-w-6xl flex gap-1">
          {tabs.map(t => {
            const Icon = t.icon
            const isAlerts = t.id === 'alerts'
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition-colors ${
                  tab === t.id
                    ? 'border-[#8B1E2D] text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon className={`h-4 w-4 ${isAlerts && alertCount > 0 ? 'text-amber-400' : ''}`} strokeWidth={2.25} />
                {t.label}
                {isAlerts && alertCount > 0 && (
                  <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-black">
                    {alertCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-6 py-6">
        {tab === 'conversations' && <ConversationsTab twilioReady={twilio?.connected ?? false} twilioLoading={twilioLoading} />}
        {tab === 'alerts' && <AlertsTab onResolved={loadStatus} />}
        {tab === 'profiles' && <ProfilesTab />}
      </div>
    </div>
  )
}

// ─── Conversations Tab ────────────────────────────────────────────────────────

function ConversationsTab({ twilioReady, twilioLoading }: { twilioReady: boolean; twilioLoading: boolean }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replySending, setReplySending] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/sms/logs?view=conversations&limit=200')
      .then(r => r.json())
      .then((d: { conversations?: Conversation[] }) => setConversations(d.conversations ?? []))
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  if (!twilioLoading && !twilioReady) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-500/10">
          <MessageSquare className="h-8 w-8 text-slate-400" strokeWidth={2} />
        </div>
        <div>
          <p className="font-semibold text-white">SMS auto-reply is not yet configured</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
            Connect a Twilio account to enable automated SMS responses. Once configured,
            you can manage conversations, set up auto-replies, and receive follow-up alerts here.
          </p>
        </div>
      </div>
    )
  }

  async function sendReply() {
    if (!replyText.trim() || !selectedConv) return
    setReplySending(true)
    try {
      await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedConv.client_phone,
          message: replyText.trim(),
          from_number: selectedConv.our_phone,
          profile_id: selectedConv.profile_id ?? undefined,
        }),
      })
      setReplyText('')
      load()
    } catch {
      // noop
    } finally {
      setReplySending(false)
    }
  }

  if (loading) {
    return <Spinner />
  }

  if (!conversations.length) {
    return <Empty label="No SMS conversations yet." />
  }

  return (
    <div className="flex gap-4 h-[70vh]">
      {/* Conversation list */}
      <div className="w-72 shrink-0 flex flex-col gap-2 overflow-y-auto pr-1">
        {conversations.map(conv => (
          <button
            key={`${conv.client_phone}|${conv.our_phone}`}
            onClick={() => setSelectedConv(conv)}
            className={`w-full rounded-xl border p-3 text-left transition-all ${
              selectedConv?.client_phone === conv.client_phone && selectedConv?.our_phone === conv.our_phone
                ? 'border-red-500/40 bg-red-500/5'
                : conv.unresolved_alert
                ? 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50'
                : 'border-white/[0.06] bg-white/[0.02] hover:border-white/10'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium text-white">{conv.client_phone}</span>
              {conv.unresolved_alert && (
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" strokeWidth={2.25} />
              )}
            </div>
            <p className="mt-1 truncate text-xs text-slate-500">
              {conv.messages[conv.messages.length - 1]?.body}
            </p>
            <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-600">
              <Clock className="h-3 w-3" strokeWidth={2.25} />
              {formatDistanceToNow(parseISO(conv.last_message_at), { addSuffix: true })}
              {conv.unresolved_alert && conv.minutes_since_reply !== null && (
                <span className="text-amber-500">{conv.minutes_since_reply}m no reply</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Conversation detail */}
      <div className="flex-1 flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        {selectedConv ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
              <div>
                <p className="text-sm font-medium text-white">{selectedConv.client_phone}</p>
                <p className="text-xs text-slate-500">via {selectedConv.our_phone}</p>
              </div>
              {selectedConv.unresolved_alert && (
                <span className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-400">
                  <AlertTriangle className="h-3 w-3" strokeWidth={2.25} />
                  {selectedConv.minutes_since_reply}m no reply
                </span>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 flex flex-col gap-2 overflow-y-auto p-4">
              {[...selectedConv.messages].sort((a, b) => a.created_at.localeCompare(b.created_at)).map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.direction === 'inbound' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 ${
                    msg.direction === 'inbound'
                      ? 'bg-white/[0.08] text-slate-200'
                      : msg.is_manual
                      ? 'bg-sky-500/20 text-sky-200'
                      : 'bg-[#8B1E2D]/20 text-red-200'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.body}</p>
                    <p className="mt-1 text-[10px] opacity-50">
                      {format(parseISO(msg.created_at), 'h:mm a')}
                      {msg.direction === 'outbound' && (msg.is_manual ? ' · manual' : ' · ai')}
                      {msg.intent && ` · ${msg.intent}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply box */}
            <div className="border-t border-white/[0.06] p-3 flex gap-2">
              <input
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()}
                placeholder="Manual reply…"
                className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-red-500/50 focus:outline-none"
              />
              <button
                onClick={sendReply}
                disabled={replySending || !replyText.trim()}
                className="flex items-center justify-center rounded-lg bg-[#8B1E2D] px-3 py-2 transition-all hover:bg-red-400 disabled:opacity-60"
              >
                {replySending ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" strokeWidth={2.25} />
                ) : (
                  <Send className="h-4 w-4 text-white" strokeWidth={2.25} />
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Alerts Tab ───────────────────────────────────────────────────────────────

function AlertsTab({ onResolved }: { onResolved: () => void }) {
  const [alerts, setAlerts] = useState<AlertWithMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [resolving, setResolving] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch('/api/sms/alerts')
      .then(r => r.json())
      .then((d: { alerts?: AlertWithMeta[] }) => setAlerts(d.alerts ?? []))
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [])

  async function resolve(alertId: string) {
    setResolving(alertId)
    try {
      await fetch('/api/sms/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alert_id: alertId }),
      })
      setAlerts(prev => prev.filter(a => a.id !== alertId))
      onResolved()
    } catch {
      // noop
    } finally {
      setResolving(null)
    }
  }

  if (loading) return <Spinner />

  if (!alerts.length) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" strokeWidth={2} />
        </div>
        <div>
          <p className="font-semibold text-white">All caught up!</p>
          <p className="mt-1 text-sm text-slate-400">No follow-up alerts right now.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-slate-400">
        {alerts.length} conversation{alerts.length !== 1 ? 's' : ''} waiting 90+ minutes for a reply.
      </p>
      {alerts.map(alert => (
        <div
          key={alert.id}
          className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 flex items-start gap-4"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
            <AlertTriangle className="h-5 w-5 text-amber-400" strokeWidth={2.25} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-white">{alert.client_phone}</span>
              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-amber-400">
                {alert.minutes_waiting}m waiting
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Last outbound: {format(parseISO(alert.last_outbound_at), 'MMM d, h:mm a')}
              {alert.last_inbound_at && ` · Last reply: ${format(parseISO(alert.last_inbound_at), 'MMM d, h:mm a')}`}
            </p>
            {alert.sms_profiles?.profiles?.display_name && (
              <p className="mt-1 text-xs text-slate-500">Profile: {alert.sms_profiles.profiles.display_name}</p>
            )}
          </div>
          <button
            onClick={() => resolve(alert.id)}
            disabled={resolving === alert.id}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-400 transition-all hover:bg-emerald-500/20 disabled:opacity-60"
          >
            {resolving === alert.id ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.25} />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.25} />
            )}
            Resolve
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── Profiles Tab ─────────────────────────────────────────────────────────────

function ProfilesTab() {
  const [profiles, setProfiles] = useState<SmsProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, Partial<SmsProfile>>>({})

  useEffect(() => {
    fetch('/api/sms/profile')
      .then(r => r.json())
      .then((d: { profiles?: SmsProfile[] }) => setProfiles(d.profiles ?? []))
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [])

  async function toggleReady(profile: SmsProfile) {
    setSaving(profile.id)
    try {
      const res = await fetch(`/api/sms/profile?id=${profile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ready_to_reply: !profile.ready_to_reply }),
      })
      const data = await res.json() as { profile?: SmsProfile }
      if (data.profile) {
        setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, ready_to_reply: !p.ready_to_reply } : p))
      }
    } catch {
      // noop
    } finally {
      setSaving(null)
    }
  }

  async function saveProfile(profile: SmsProfile) {
    setSaving(profile.id)
    const draft = drafts[profile.id] ?? {}
    try {
      await fetch(`/api/sms/profile?id=${profile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, ...draft } : p))
      setDrafts(prev => { const n = { ...prev }; delete n[profile.id]; return n })
    } catch {
      // noop
    } finally {
      setSaving(null)
    }
  }

  function patch(profileId: string, key: string, value: unknown) {
    setDrafts(prev => ({ ...prev, [profileId]: { ...(prev[profileId] ?? {}), [key]: value } }))
  }

  if (loading) return <Spinner />

  if (!profiles.length) {
    return <Empty label="No SMS profiles configured. Create therapist profiles first, then add SMS config here." />
  }

  return (
    <div className="flex flex-col gap-3">
      {profiles.map(profile => {
        const draft = drafts[profile.id] ?? {}
        const merged = { ...profile, ...draft }
        const isExpanded = expandedId === profile.id
        const hasDraft = Object.keys(draft).length > 0

        return (
          <div key={profile.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            {/* Profile header row */}
            <div className="flex items-center gap-4 p-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white">
                    {(profile.profiles as { display_name?: string } | undefined)?.display_name ?? 'Profile'}
                  </span>
                  <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
                    merged.availability_mode === 'in_city'
                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                      : merged.availability_mode === 'unavailable'
                      ? 'border-rose-500/20 bg-rose-500/10 text-rose-400'
                      : 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                  }`}>
                    {merged.availability_mode.replace('_', ' ')}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  {profile.twilio_number ?? 'No Twilio number'}
                </p>
              </div>

              {/* Ready-to-reply toggle */}
              <button
                onClick={() => toggleReady(profile)}
                disabled={saving === profile.id}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all"
                style={{
                  borderColor: merged.ready_to_reply ? 'rgb(16 185 129 / 0.3)' : 'rgb(255 255 255 / 0.1)',
                  background: merged.ready_to_reply ? 'rgb(16 185 129 / 0.1)' : 'rgb(255 255 255 / 0.04)',
                  color: merged.ready_to_reply ? 'rgb(52 211 153)' : 'rgb(100 116 139)',
                }}
              >
                {saving === profile.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
                ) : merged.ready_to_reply ? (
                  <ToggleRight className="h-4 w-4" strokeWidth={2.25} />
                ) : (
                  <ToggleLeft className="h-4 w-4" strokeWidth={2.25} />
                )}
                {merged.ready_to_reply ? 'Auto-Reply ON' : 'Auto-Reply OFF'}
              </button>

              <button
                onClick={() => setExpandedId(isExpanded ? null : profile.id)}
                className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-slate-400 hover:text-white transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" strokeWidth={2.25} />
                ) : (
                  <ChevronDown className="h-4 w-4" strokeWidth={2.25} />
                )}
              </button>
            </div>

            {/* Expanded settings */}
            {isExpanded && (
              <div className="border-t border-white/[0.06] p-5 flex flex-col gap-5">
                {/* Availability mode */}
                <div>
                  <Label>Availability Mode</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(['in_city', 'traveling', 'arrival_window', 'unavailable'] as const).map(mode => (
                      <button
                        key={mode}
                        onClick={() => patch(profile.id, 'availability_mode', mode)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all capitalize ${
                          merged.availability_mode === mode
                            ? 'border-red-500/40 bg-red-500/10 text-red-400'
                            : 'border-white/10 bg-white/[0.04] text-slate-400 hover:text-white'
                        }`}
                      >
                        {mode.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                  {merged.availability_mode === 'arrival_window' && (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label>Arrival Date</Label>
                        <input
                          type="date"
                          value={merged.arrival_date ?? ''}
                          onChange={e => patch(profile.id, 'arrival_date', e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <Label>Departure Date</Label>
                        <input
                          type="date"
                          value={merged.departure_date ?? ''}
                          onChange={e => patch(profile.id, 'departure_date', e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Pricing */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <DollarSign className="h-3.5 w-3.5 text-slate-500" strokeWidth={2.25} />
                    <Label>Pricing</Label>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <Label muted>60 min</Label>
                      <input
                        value={merged.pricing_60 ?? ''}
                        onChange={e => patch(profile.id, 'pricing_60', e.target.value)}
                        placeholder="e.g. $150"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <Label muted>90 min</Label>
                      <input
                        value={merged.pricing_90 ?? ''}
                        onChange={e => patch(profile.id, 'pricing_90', e.target.value)}
                        placeholder="e.g. $200"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <Label muted>Couples</Label>
                      <input
                        value={merged.pricing_couples ?? ''}
                        onChange={e => patch(profile.id, 'pricing_couples', e.target.value)}
                        placeholder="e.g. $300"
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div>
                  <Label>Services</Label>
                  <div className="mt-2 flex flex-col gap-3">
                    <ToggleRow
                      label="Outcall available"
                      value={merged.outcall_available}
                      onChange={v => patch(profile.id, 'outcall_available', v)}
                    />
                    {merged.outcall_available && (
                      <div>
                        <Label muted>Outcall Area</Label>
                        <input
                          value={merged.outcall_area ?? ''}
                          onChange={e => patch(profile.id, 'outcall_area', e.target.value)}
                          placeholder="e.g. Midtown, Upper West Side"
                          className={inputCls}
                        />
                      </div>
                    )}
                    <ToggleRow
                      label="Couples sessions"
                      value={merged.couples_available}
                      onChange={v => patch(profile.id, 'couples_available', v)}
                    />
                  </div>
                </div>

                {/* Custom instructions */}
                <div>
                  <Label>Custom AI Instructions</Label>
                  <textarea
                    rows={3}
                    value={merged.custom_instructions ?? ''}
                    onChange={e => patch(profile.id, 'custom_instructions', e.target.value)}
                    placeholder="e.g. Always mention the promo: first session 10% off. Don't mention competitors."
                    className={`${inputCls} resize-none`}
                  />
                </div>

                {/* Alert phone */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Phone className="h-3.5 w-3.5 text-slate-500" strokeWidth={2.25} />
                    <Label>Escalation Alert Phone</Label>
                  </div>
                  <input
                    value={merged.alert_phone ?? ''}
                    onChange={e => patch(profile.id, 'alert_phone', e.target.value)}
                    placeholder="+1 555 000 0000"
                    className={inputCls}
                  />
                  <p className="mt-1 text-[11px] text-slate-500">Receives alerts when ASAP requests come in.</p>
                </div>

                {hasDraft && (
                  <button
                    onClick={() => saveProfile(profile)}
                    disabled={saving === profile.id}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#8B1E2D] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-400 disabled:opacity-60"
                  >
                    {saving === profile.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
                    ) : 'Save Changes'}
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

const inputCls = "mt-1 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-red-500/50 focus:outline-none"

function Label({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <span className={`font-mono text-[10px] uppercase tracking-[0.18em] ${muted ? 'text-slate-600' : 'text-slate-400'}`}>
      {children}
    </span>
  )
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-300">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
          value
            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
            : 'border-white/10 bg-white/[0.04] text-slate-500'
        }`}
      >
        {value ? <ToggleRight className="h-3.5 w-3.5" strokeWidth={2.25} /> : <ToggleLeft className="h-3.5 w-3.5" strokeWidth={2.25} />}
        {value ? 'Yes' : 'No'}
      </button>
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-slate-500" strokeWidth={2} />
    </div>
  )
}

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-16 text-center text-sm text-slate-500">
      {label}
    </div>
  )
}
