import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Send, Loader2, MessageSquare } from "lucide-react";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  user_id: string | null;
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

const AdminMailbox = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    let query = supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter);
    const { data } = await query;
    setTickets(data || []);
  };

  const loadReplies = async (ticketId: string) => {
    const { data } = await supabase
      .from("ticket_replies")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });
    setReplies((data as Reply[]) || []);
  };

  useEffect(() => { load(); }, [filter]);

  useEffect(() => {
    if (selectedTicket) loadReplies(selectedTicket.id);
  }, [selectedTicket]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("support_tickets").update({ status }).eq("id", id);
    toast({ title: `Ticket updated to ${status}` });
    load();
    if (selectedTicket?.id === id) setSelectedTicket((t) => t ? { ...t, status } : null);
  };

  const sendReply = async () => {
    if (!user || !selectedTicket || !replyText.trim()) return;
    setSending(true);
    const { error } = await supabase.from("ticket_replies").insert({
      ticket_id: selectedTicket.id,
      user_id: user.id,
      message: replyText.trim(),
      is_admin: true,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setReplyText("");
      loadReplies(selectedTicket.id);
      // Auto-set to in_progress if still open
      if (selectedTicket.status === "open") {
        updateStatus(selectedTicket.id, "in_progress");
      }
    }
    setSending(false);
  };

  const openTicket = (t: Ticket) => {
    setSelectedTicket(t);
    setReplyText("");
  };

  // Detail view
  if (selectedTicket) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(null)} className="gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Mailbox
        </Button>

        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{selectedTicket.subject}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(selectedTicket.created_at).toLocaleString()} · User: {selectedTicket.user_id?.slice(0, 8)}…
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={statusColors[selectedTicket.status]}>{selectedTicket.status}</Badge>
                <Badge variant="outline">{selectedTicket.priority}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-4 mb-4">
              <p className="text-sm whitespace-pre-wrap">{selectedTicket.message}</p>
            </div>

            <div className="flex items-center gap-2 mb-4">
              {selectedTicket.status !== "resolved" && (
                <Button size="sm" variant="outline" onClick={() => updateStatus(selectedTicket.id, "resolved")}>Mark Resolved</Button>
              )}
              {selectedTicket.status !== "closed" && (
                <Button size="sm" variant="ghost" onClick={() => updateStatus(selectedTicket.id, "closed")}>Close</Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Conversation thread */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Conversation ({replies.length})
          </h3>

          {replies.map((r) => (
            <div
              key={r.id}
              className={`p-3 rounded-lg text-sm ${
                r.is_admin
                  ? "bg-primary/10 border border-primary/20 ml-8"
                  : "bg-muted/50 border border-border mr-8"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">
                  {r.is_admin ? "Admin" : "User"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleString()}
                </span>
              </div>
              <p className="whitespace-pre-wrap">{r.message}</p>
            </div>
          ))}

          {replies.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No replies yet. Write the first response below.</p>
          )}
        </div>

        {/* Reply input */}
        {selectedTicket.status !== "closed" && (
          <Card className="border-primary/30">
            <CardContent className="pt-4">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your reply to the user..."
                className="min-h-[100px] mb-3"
                maxLength={5000}
              />
              <div className="flex justify-end">
                <Button onClick={sendReply} disabled={sending || !replyText.trim()}>
                  {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Send Reply
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Mailbox</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {tickets.length === 0 ? (
        <p className="text-muted-foreground">No tickets found.</p>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <Card
              key={t.id}
              className="bg-card border-border cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() => openTicket(t)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">{t.subject}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={statusColors[t.status]}>{t.status}</Badge>
                    <Badge variant="outline">{t.priority}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-1 line-clamp-2">{t.message}</p>
                <p className="text-xs text-muted-foreground">
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

export default AdminMailbox;
