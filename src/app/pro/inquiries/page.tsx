'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, Mail, Phone, MessageCircle, Archive, Eye, EyeOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ContactInquiry {
  id: string;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  message: string | null;
  preferred_contact: string | null;
  status: string | null;
  created_at: string;
}

const supabase = createClient();

export default function InquiriesDashboard() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('new');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInquiries();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('contact_inquiries_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contact_inquiries',
        },
        () => {
          loadInquiries();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  async function loadInquiries() {
    try {
      setError('');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError('Not authenticated'); setLoading(false); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (!profile) { setLoading(false); return; }

      const { data, error: err } = await supabase
        .from('contact_inquiries')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false });

      if (err) throw err;
      setInquiries(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const { error: err } = await supabase
        .from('contact_inquiries')
        .update({ status })
        .eq('id', id);

      if (err) throw err;
      loadInquiries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  }

  const statusCounts = {
    new: inquiries.filter((i) => i.status === 'new').length,
    viewed: inquiries.filter((i) => i.status === 'viewed').length,
    responded: inquiries.filter((i) => i.status === 'responded').length,
    archived: inquiries.filter((i) => i.status === 'archived').length,
  };

  const filteredInquiries = inquiries.filter((i) => {
    if (selectedTab === 'all') return true;
    return i.status === selectedTab;
  });

  const getStatusBadge = (status: string | null) => {
    const variants: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      viewed: 'bg-purple-100 text-purple-800',
      responded: 'bg-emerald-100 text-emerald-800',
      archived: 'bg-gray-100 text-gray-800',
    };
    const s = status ?? 'new';
    return (
      <Badge className={variants[s] ?? 'bg-gray-100 text-gray-800'}>
        {s.charAt(0).toUpperCase() + s.slice(1)}
      </Badge>
    );
  };

  const getContactIcon = (method: string) => {
    switch (method) {
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4" />;
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Contact Inquiries</h1>
          <p className="text-muted-foreground">Manage client inquiries and messages</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'New', count: statusCounts.new, color: 'bg-blue-50 border-blue-200' },
            { label: 'Viewed', count: statusCounts.viewed, color: 'bg-purple-50 border-purple-200' },
            { label: 'Responded', count: statusCounts.responded, color: 'bg-emerald-50 border-emerald-200' },
            { label: 'Archived', count: statusCounts.archived, color: 'bg-gray-50 border-gray-200' },
          ].map((stat) => (
            <Card key={stat.label} className={stat.color}>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stat.count}</div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="new">New ({statusCounts.new})</TabsTrigger>
            <TabsTrigger value="viewed">Viewed ({statusCounts.viewed})</TabsTrigger>
            <TabsTrigger value="responded">Responded ({statusCounts.responded})</TabsTrigger>
            <TabsTrigger value="archived">Archived ({statusCounts.archived})</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-4">
            {filteredInquiries.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No inquiries in this category</p>
                </CardContent>
              </Card>
            ) : (
              filteredInquiries.map((inquiry) => (
                <Card key={inquiry.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{inquiry.client_name}</h3>
                          {getStatusBadge(inquiry.status)}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          {getContactIcon(inquiry.preferred_contact ?? 'email')}
                          {inquiry.client_email}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </CardHeader>

                  {expandedId === inquiry.id && (
                    <CardContent className="space-y-4">
                      {/* Message */}
                      <div>
                        <label className="text-sm font-medium">Message</label>
                        <p className="mt-1 p-3 rounded bg-muted text-sm">{inquiry.message}</p>
                      </div>

                      {/* Contact Info */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Email</label>
                          <a href={`mailto:${inquiry.client_email}`} className="mt-1 text-sm text-blue-600 hover:underline block">
                            {inquiry.client_email}
                          </a>
                        </div>
                        {inquiry.client_phone && (
                          <div>
                            <label className="text-sm font-medium">Phone</label>
                            <a href={`tel:${inquiry.client_phone}`} className="mt-1 text-sm text-blue-600 hover:underline block">
                              {inquiry.client_phone}
                            </a>
                          </div>
                        )}
                      </div>


                      {/* Actions */}
                      <div className="flex gap-2 flex-wrap">
                        {inquiry.status !== 'viewed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(inquiry.id, 'viewed')}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Mark as Viewed
                          </Button>
                        )}
                        {inquiry.status !== 'responded' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(inquiry.id, 'responded')}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Mark as Responded
                          </Button>
                        )}
                        {inquiry.status !== 'archived' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(inquiry.id, 'archived')}
                          >
                            <Archive className="w-4 h-4 mr-1" />
                            Archive
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  )}

                  <div className="px-6 py-3 border-t flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {(inquiry.message ?? '').substring(0, 100)}...
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setExpandedId(expandedId === inquiry.id ? null : inquiry.id)
                      }
                    >
                      {expandedId === inquiry.id ? 'Hide' : 'View'}
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
