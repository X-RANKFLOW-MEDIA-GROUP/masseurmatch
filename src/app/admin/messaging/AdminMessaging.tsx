"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Bot,
  CirclePause,
  CirclePlay,
  Clock3,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  ShieldOff,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { requestJson } from "@/app/_lib/request";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type Contact = {
  id: string;
  phone_e164: string;
  name: string | null;
  city: string | null;
  state: string | null;
  lifecycle_status: string;
  knotty_enabled: boolean;
  opted_out: boolean;
  last_activity_at: string | null;
};

type Conversation = {
  id: string;
  contact_id: string;
  current_channel: string;
  unread_count: number;
  last_message_at: string | null;
  messaging_contacts?: Contact | Contact[] | null;
};

type Message = {
  id: string;
  direction: "inbound" | "outbound";
  sender_type: string;
  body: string;
  channel: string;
  delivery_status: string;
  created_at: string;
};

type QueueItem = {
  id: string;
  status: string;
  body: string;
  attempts: number;
  max_attempts: number;
  scheduled_for: string;
  last_error: string | null;
  messaging_contacts?: { id: string; name: string | null; phone_e164: string; city: string | null; state: string | null } | null;
};

type Campaign = {
  id: string;
  name: string;
  status: string;
  transport_preference: string;
  created_at: string;
};

type SummaryCard = [label: string, value: number, icon: LucideIcon];

type Snapshot = {
  ok: boolean;
  settings: {
    receiving_number: string;
    transport_mode: string;
    knotty_enabled: boolean;
    global_pause: boolean;
  } | null;
  contacts: Contact[];
  conversations: Conversation[];
  campaigns: Campaign[];
  queue: QueueItem[];
  messages: Message[];
  counts: {
    contacts: number;
    optedOut: number;
    pending: number;
    failed: number;
    openConversations: number;
  };
};

function getConversationContact(conversation: Conversation): Contact | null {
  const value = conversation.messaging_contacts;
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
}

function when(value: string | null) {
  if (!value) return "No activity";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AdminMessaging() {
  const [data, setData] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      setError("");
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (selectedConversationId) params.set("conversationId", selectedConversationId);
      const next = await requestJson<Snapshot>(`/api/admin/messaging?${params.toString()}`);
      setData(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messaging dashboard");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [query, selectedConversationId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const timer = window.setInterval(() => void load(true), 5000);
    return () => window.clearInterval(timer);
  }, [load]);

  const selectedConversation = useMemo(
    () => data?.conversations.find((item) => item.id === selectedConversationId) || null,
    [data?.conversations, selectedConversationId],
  );

  const selectedConversationContact = selectedConversation ? getConversationContact(selectedConversation) : null;
  const activeContactId = selectedConversationContact?.id || selectedContactId;
  const activeContact = data?.contacts.find((item) => item.id === activeContactId) || selectedConversationContact || null;

  async function post(body: Record<string, unknown>) {
    setSaving(true);
    try {
      setError("");
      await requestJson("/api/admin/messaging", {
        method: "POST",
        body: JSON.stringify(body),
      });
      await load(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Messaging action failed");
    } finally {
      setSaving(false);
    }
  }

  async function sendMessage() {
    if (!activeContact || !draft.trim()) return;
    await post({ action: "queue_message", contactId: activeContact.id, body: draft.trim() });
    setDraft("");
  }

  if (loading && !data) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">Loading messaging operations...</div>;
  }

  const counts = data?.counts || { contacts: 0, optedOut: 0, pending: 0, failed: 0, openConversations: 0 };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Messaging</h1>
          <p className="text-sm text-slate-500">Campaign queue, inbox, KNOTTY controls and delivery operations.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{data?.settings?.receiving_number || "No line"}</Badge>
          <Badge variant="outline">Transport: {data?.settings?.transport_mode || "unknown"}</Badge>
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />Refresh
          </Button>
          <Button
            size="sm"
            variant={data?.settings?.global_pause ? "default" : "destructive"}
            disabled={saving}
            onClick={() => void post({ action: "update_settings", globalPause: !data?.settings?.global_pause })}
          >
            {data?.settings?.global_pause ? <CirclePlay className="mr-2 h-4 w-4" /> : <CirclePause className="mr-2 h-4 w-4" />}
            {data?.settings?.global_pause ? "Resume" : "Pause all"}
          </Button>
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />{error}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {([
          ["Contacts", counts.contacts, Users],
          ["Open chats", counts.openConversations, MessageSquare],
          ["Queued", counts.pending, Clock3],
          ["Failed", counts.failed, AlertCircle],
          ["Opted out", counts.optedOut, ShieldOff],
        ] satisfies SummaryCard[]).map(([label, value, Icon]) => (
          <Card key={String(label)}>
            <CardContent className="flex items-center justify-between p-4">
              <div><p className="text-xs font-medium uppercase tracking-wide text-slate-500">{String(label)}</p><p className="mt-1 text-2xl font-bold">{String(value)}</p></div>
              <Icon className="h-5 w-5 text-slate-400" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="inbox" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="queue">Queue</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="inbox">
          <div className="grid min-h-[620px] gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
            <Card className="overflow-hidden">
              <CardHeader className="border-b p-4"><CardTitle className="text-base">Conversations</CardTitle></CardHeader>
              <CardContent className="max-h-[700px] space-y-1 overflow-y-auto p-2">
                {(data?.conversations || []).length === 0 ? <p className="p-4 text-sm text-slate-500">No conversations yet.</p> : null}
                {(data?.conversations || []).map((conversation) => {
                  const contact = getConversationContact(conversation);
                  const active = conversation.id === selectedConversationId;
                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => {
                        setSelectedConversationId(conversation.id);
                        if (conversation.unread_count > 0) void post({ action: "mark_read", conversationId: conversation.id });
                      }}
                      className={`w-full rounded-lg p-3 text-left transition ${active ? "bg-slate-900 text-white" : "hover:bg-slate-50"}`}
                    >
                      <div className="flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold">{contact?.name || contact?.phone_e164 || "Unknown"}</span>{conversation.unread_count > 0 ? <Badge>{conversation.unread_count}</Badge> : null}</div>
                      <p className={`mt-1 truncate text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>{contact?.city || "Unknown city"} · {conversation.current_channel}</p>
                      <p className={`mt-2 text-[11px] ${active ? "text-slate-400" : "text-slate-400"}`}>{when(conversation.last_message_at)}</p>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="flex min-h-[620px] flex-col overflow-hidden">
              <CardHeader className="border-b p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">{activeContact?.name || activeContact?.phone_e164 || "Select a conversation"}</CardTitle>
                    {activeContact ? <p className="mt-1 text-xs text-slate-500">{activeContact.phone_e164} · {activeContact.city || "Unknown city"}</p> : null}
                  </div>
                  {activeContact ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" disabled={saving || activeContact.opted_out} onClick={() => void post({ action: "update_contact", contactId: activeContact.id, knottyEnabled: !activeContact.knotty_enabled })}>
                        <Bot className="mr-2 h-4 w-4" />KNOTTY {activeContact.knotty_enabled ? "On" : "Off"}
                      </Button>
                      <Button size="sm" variant="outline" disabled={saving} onClick={() => void post({ action: "update_contact", contactId: activeContact.id, optedOut: !activeContact.opted_out, optedOutReason: activeContact.opted_out ? null : "admin" })}>
                        {activeContact.opted_out ? "Restore" : "Opt out"}
                      </Button>
                    </div>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col p-0">
                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {!selectedConversationId ? <p className="text-sm text-slate-500">Choose a conversation to view its history.</p> : null}
                  {(data?.messages || []).map((message) => (
                    <div key={message.id} className={`flex ${message.direction === "outbound" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm ${message.direction === "outbound" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-900"}`}>
                        <p className="whitespace-pre-wrap">{message.body}</p>
                        <div className={`mt-2 flex flex-wrap gap-2 text-[10px] ${message.direction === "outbound" ? "text-slate-300" : "text-slate-500"}`}>
                          <span>{message.sender_type}</span><span>{message.channel}</span><span>{message.delivery_status}</span><span>{when(message.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={activeContact?.opted_out ? "Contact is opted out" : "Write a manual message..."} disabled={!activeContact || activeContact.opted_out || saving} className="min-h-[84px]" />
                    <Button className="self-end" disabled={!activeContact || activeContact.opted_out || !draft.trim() || saving} onClick={() => void sendMessage()}><Send className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contacts">
          <Card>
            <CardHeader className="gap-3 md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-base">Contacts</CardTitle>
              <div className="flex w-full gap-2 md:w-auto"><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, phone or city" className="md:w-80" /><Button variant="outline" onClick={() => void load()}><Search className="h-4 w-4" /></Button></div>
            </CardHeader>
            <CardContent className="space-y-2">
              {(data?.contacts || []).map((contact) => (
                <div key={contact.id} className="flex flex-col gap-3 rounded-lg border p-3 md:flex-row md:items-center md:justify-between">
                  <div><p className="font-medium">{contact.name || "Unnamed contact"}</p><p className="text-sm text-slate-500">{contact.phone_e164} · {contact.city || "Unknown city"}{contact.state ? `, ${contact.state}` : ""}</p></div>
                  <div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{contact.lifecycle_status}</Badge>{contact.opted_out ? <Badge variant="destructive">Opted out</Badge> : null}<Button size="sm" variant="outline" onClick={() => { setSelectedContactId(contact.id); setSelectedConversationId(null); }}>Open</Button></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue">
          <Card><CardHeader><CardTitle className="text-base">Outbound queue</CardTitle></CardHeader><CardContent className="space-y-2">{(data?.queue || []).map((item) => <div key={item.id} className="rounded-lg border p-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-medium">{item.messaging_contacts?.name || item.messaging_contacts?.phone_e164 || "Unknown contact"}</p><Badge variant="outline">{item.status}</Badge></div><p className="mt-2 line-clamp-2 text-sm text-slate-600">{item.body}</p><p className="mt-2 text-xs text-slate-400">Scheduled {when(item.scheduled_for)} · attempts {item.attempts}/{item.max_attempts}{item.last_error ? ` · ${item.last_error}` : ""}</p></div>)}</CardContent></Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card><CardHeader><CardTitle className="text-base">Campaigns</CardTitle></CardHeader><CardContent className="space-y-2">{(data?.campaigns || []).length === 0 ? <p className="text-sm text-slate-500">No campaigns created yet.</p> : null}{(data?.campaigns || []).map((campaign) => <div key={campaign.id} className="flex flex-col gap-2 rounded-lg border p-3 md:flex-row md:items-center md:justify-between"><div><p className="font-medium">{campaign.name}</p><p className="text-xs text-slate-500">Created {when(campaign.created_at)} · {campaign.transport_preference}</p></div><Badge variant="outline">{campaign.status}</Badge></div>)}</CardContent></Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card><CardHeader><CardTitle className="text-base">Messaging controls</CardTitle></CardHeader><CardContent className="space-y-4"><div className="rounded-lg border p-4"><p className="font-medium">Global sending</p><p className="mt-1 text-sm text-slate-500">Stops or resumes the outbound queue without deleting pending messages.</p><Button className="mt-3" variant={data?.settings?.global_pause ? "default" : "destructive"} onClick={() => void post({ action: "update_settings", globalPause: !data?.settings?.global_pause })}>{data?.settings?.global_pause ? "Resume all sending" : "Pause all sending"}</Button></div><div className="rounded-lg border p-4"><p className="font-medium">KNOTTY global switch</p><p className="mt-1 text-sm text-slate-500">Master control for automated reply eligibility. Contact opt outs remain blocking.</p><Button className="mt-3" variant="outline" onClick={() => void post({ action: "update_settings", knottyEnabled: !data?.settings?.knotty_enabled })}>KNOTTY {data?.settings?.knotty_enabled ? "Enabled" : "Disabled"}</Button></div></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
