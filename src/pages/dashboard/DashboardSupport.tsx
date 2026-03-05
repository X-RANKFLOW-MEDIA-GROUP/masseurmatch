import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Loader2, TicketCheck, Plus, ArrowLeft, MessageSquare } from "lucide-react";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
}

interface Reply {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
}

const statusColors: Record<string, string> = {
  open: "bg-warning/20 text-warning border-warning/30",
  in_progress: "bg-primary/20 text-primary border-primary/30",
  resolved: "bg-success/20 text-success border-success/30",
  closed: "bg-muted text-muted-foreground border-border",
};

const DashboardSupport = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: "", message: "", priority: "normal" });
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.subject.trim() || !form.message.trim()) return;
    setSending(true);
    const { error } = await supabase.from("support_tickets").insert({
      user_id: user.id,
      subject: form.subject.trim(),
      message: form.message.trim(),
      priority: form.priority,
    });
    setSending(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Ticket submitted", description: "Our team will review it shortly." });
      setForm({ subject: "", message: "", priority: "normal" });
      setShowForm(false);
      loadTickets();
    }
  };

  const sendReply = async () => {
    if (!user || !selectedTicket || !replyText.trim()) return;
    setSendingReply(true);
    const { error } = await supabase.from("ticket_replies").insert({
      ticket_id: selectedTicket.id,
      user_id: user.id,
      message: replyText.trim(),
      is_admin: false,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setReplyText("");
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
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={statusColors[selectedTicket.status] || ""}>{selectedTicket.status.replace("_", " ")}</Badge>
                <Badge variant="outline" className="capitalize">{selectedTicket.priority}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm whitespace-pre-wrap">{selectedTicket.message}</p>
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
              <div className="flex justify-end">
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
                <Input
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="Brief description of your issue"
                  required
                  maxLength={200}
                />
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
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
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={sending}>
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
              onClick={() => { setSelectedTicket(t); setReplyText(""); }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">{t.subject}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={statusColors[t.status] || ""}>{t.status.replace("_", " ")}</Badge>
                    <Badge variant="outline" className="capitalize">{t.priority}</Badge>
                  </div>
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

export default DashboardSupport;
