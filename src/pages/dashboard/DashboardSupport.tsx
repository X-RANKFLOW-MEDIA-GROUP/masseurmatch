import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Loader2, TicketCheck, Plus, ArrowLeft, MessageSquare, Paperclip, X, FileText } from "lucide-react";

const SUBJECT_OPTIONS = [
  "Account & Login Issues",
  "Profile & Photos",
  "Verification Problems",
  "Subscription & Billing",
  "Bug Report",
  "Feature Request",
  "Safety Concern",
  "Other",
];

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
  attachment_urls?: string[];
}

interface Reply {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
  attachment_urls?: string[];
}

const statusColors: Record<string, string> = {
  open: "bg-warning/20 text-warning border-warning/30",
  in_progress: "bg-primary/20 text-primary border-primary/30",
  resolved: "bg-success/20 text-success border-success/30",
  closed: "bg-muted text-muted-foreground border-border",
};

const MAX_FILES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const DashboardSupport = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: "", message: "" });
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // File attachments
  const [files, setFiles] = useState<File[]>([]);
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replyFileInputRef = useRef<HTMLInputElement>(null);

  const loadTickets = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setTickets(data || []);
    setLoading(false);
  };

  const loadReplies = async (ticketId: string) => {
    const { data } = await supabase
      .from("ticket_replies")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });
    setReplies((data as Reply[]) || []);
  };

  useEffect(() => { loadTickets(); }, [user]);

  useEffect(() => {
    if (selectedTicket) loadReplies(selectedTicket.id);
  }, [selectedTicket]);

  const uploadFiles = async (filesToUpload: File[]): Promise<string[]> => {
    if (!user || filesToUpload.length === 0) return [];
    const urls: string[] = [];
    for (const file of filesToUpload) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("ticket-attachments").upload(path, file);
      if (!error) {
        urls.push(path);
      }
    }
    return urls;
  };

  const getSignedUrl = async (path: string) => {
    const { data } = await supabase.storage.from("ticket-attachments").createSignedUrl(path, 3600);
    return data?.signedUrl || "";
  };

  const addFiles = (newFiles: FileList | null, target: "form" | "reply") => {
    if (!newFiles) return;
    const current = target === "form" ? files : replyFiles;
    const setter = target === "form" ? setFiles : setReplyFiles;
    const remaining = MAX_FILES - current.length;
    const valid: File[] = [];
    for (let i = 0; i < Math.min(newFiles.length, remaining); i++) {
      if (newFiles[i].size <= MAX_FILE_SIZE) {
        valid.push(newFiles[i]);
      } else {
        toast({ title: "File too large", description: `${newFiles[i].name} exceeds 5MB limit.`, variant: "destructive" });
      }
    }
    setter([...current, ...valid]);
  };

  const removeFile = (index: number, target: "form" | "reply") => {
    const setter = target === "form" ? setFiles : setReplyFiles;
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.subject || !form.message.trim()) return;
    setSending(true);
    const attachmentUrls = await uploadFiles(files);
    const { error } = await supabase.from("support_tickets").insert({
      user_id: user.id,
      subject: form.subject,
      message: form.message.trim(),
      priority: "normal",
      attachment_urls: attachmentUrls,
    } as any);
    setSending(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Ticket submitted", description: "Our team will review it shortly." });
      setForm({ subject: "", message: "" });
      setFiles([]);
      setShowForm(false);
      loadTickets();
    }
  };

  const sendReply = async () => {
    if (!user || !selectedTicket || !replyText.trim()) return;
    setSendingReply(true);
    const attachmentUrls = await uploadFiles(replyFiles);
    const { error } = await supabase.from("ticket_replies").insert({
      ticket_id: selectedTicket.id,
      user_id: user.id,
      message: replyText.trim(),
      is_admin: false,
      attachment_urls: attachmentUrls,
    } as any);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setReplyText("");
      setReplyFiles([]);
      loadReplies(selectedTicket.id);
    }
    setSendingReply(false);
  };

  if (loading) return <div className="animate-pulse h-40 bg-muted rounded" />;

  // Detail / conversation view
  if (selectedTicket) {
    return (
      <div className="max-w-3xl space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(null)} className="gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to tickets
        </Button>

        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{selectedTicket.subject}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(selectedTicket.created_at).toLocaleString()}
                </p>
              </div>
              <Badge variant="outline" className={statusColors[selectedTicket.status] || ""}>{selectedTicket.status.replace("_", " ")}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm whitespace-pre-wrap">{selectedTicket.message}</p>
              {selectedTicket.attachment_urls && selectedTicket.attachment_urls.length > 0 && (
                <AttachmentList paths={selectedTicket.attachment_urls} getSignedUrl={getSignedUrl} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Conversation */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Conversation ({replies.length})
          </h3>

          {replies.map((r) => (
            <div
              key={r.id}
              className={`p-3 rounded-lg text-sm ${
                r.is_admin
                  ? "bg-primary/10 border border-primary/20 mr-8"
                  : "bg-muted/50 border border-border ml-8"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">
                  {r.is_admin ? "Support Team" : "You"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleString()}
                </span>
              </div>
              <p className="whitespace-pre-wrap">{r.message}</p>
              {r.attachment_urls && r.attachment_urls.length > 0 && (
                <AttachmentList paths={r.attachment_urls} getSignedUrl={getSignedUrl} />
              )}
            </div>
          ))}

          {replies.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No replies yet. Our team will respond soon.</p>
          )}
        </div>

        {/* User reply */}
        {selectedTicket.status !== "closed" && (
          <Card className="border-primary/30">
            <CardContent className="pt-4">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[80px] mb-3"
                maxLength={5000}
              />
              <FilePreview files={replyFiles} onRemove={(i) => removeFile(i, "reply")} />
              <div className="flex justify-between items-center">
                <div>
                  <input
                    ref={replyFileInputRef}
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={(e) => { addFiles(e.target.files, "reply"); e.target.value = ""; }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => replyFileInputRef.current?.click()}
                    disabled={replyFiles.length >= MAX_FILES}
                  >
                    <Paperclip className="w-4 h-4 mr-1" /> Attach
                  </Button>
                </div>
                <Button onClick={sendReply} disabled={sendingReply || !replyText.trim()}>
                  {sendingReply ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Reply
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // List view
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TicketCheck className="w-6 h-6" /> Support
          </h1>
          <p className="text-sm text-muted-foreground">Submit and track your support tickets</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-1">
          <Plus className="w-4 h-4" /> New Ticket
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-sm">New Support Ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Subject <span className="text-destructive">*</span></Label>
                <Select value={form.subject} onValueChange={(v) => setForm((f) => ({ ...f, subject: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select a topic..." /></SelectTrigger>
                  <SelectContent>
                    {SUBJECT_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Message <span className="text-destructive">*</span></Label>
                <Textarea
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Describe your issue in detail..."
                  required
                  className="min-h-[120px]"
                  maxLength={2000}
                />
              </div>
              <div>
                <Label>Attachments</Label>
                <p className="text-xs text-muted-foreground mb-2">Up to {MAX_FILES} files, max 5MB each (images, PDF, DOC, TXT)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={(e) => { addFiles(e.target.files, "form"); e.target.value = ""; }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={files.length >= MAX_FILES}
                >
                  <Paperclip className="w-4 h-4 mr-1" /> Choose Files
                </Button>
                <FilePreview files={files} onRemove={(i) => removeFile(i, "form")} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setFiles([]); }}>Cancel</Button>
                <Button type="submit" disabled={sending || !form.subject}>
                  {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Submit
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {tickets.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <TicketCheck className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">No tickets yet. Click "New Ticket" to get help.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <Card
              key={t.id}
              className="bg-card border-border cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() => { setSelectedTicket(t); setReplyText(""); setReplyFiles([]); }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">{t.subject}</CardTitle>
                  <Badge variant="outline" className={statusColors[t.status] || ""}>{t.status.replace("_", " ")}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{t.message}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(t.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Small components
const FilePreview = ({ files, onRemove }: { files: File[]; onRemove: (i: number) => void }) => {
  if (files.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {files.map((f, i) => (
        <div key={i} className="flex items-center gap-1 rounded-full bg-secondary border border-border px-3 py-1 text-xs">
          <FileText className="w-3 h-3 text-muted-foreground" />
          <span className="max-w-[120px] truncate">{f.name}</span>
          <button type="button" onClick={() => onRemove(i)}>
            <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
      ))}
    </div>
  );
};

const AttachmentList = ({ paths, getSignedUrl }: { paths: string[]; getSignedUrl: (p: string) => Promise<string> }) => {
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    paths.forEach(async (p) => {
      const url = await getSignedUrl(p);
      setUrls((prev) => ({ ...prev, [p]: url }));
    });
  }, [paths]);

  if (paths.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {paths.map((p) => {
        const name = p.split("/").pop() || "file";
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
        return (
          <a
            key={p}
            href={urls[p] || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded bg-secondary/50 border border-border px-2 py-1 text-xs hover:bg-secondary transition-colors"
          >
            {isImage ? (
              <img src={urls[p]} alt="" className="w-8 h-8 rounded object-cover" />
            ) : (
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
            )}
            <span className="max-w-[100px] truncate">{name}</span>
          </a>
        );
      })}
    </div>
  );
};

export default DashboardSupport;
