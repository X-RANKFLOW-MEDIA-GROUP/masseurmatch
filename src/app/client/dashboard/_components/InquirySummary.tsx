'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle2, Clock3, AlertCircle, ArrowRight } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Inquiry = Pick<
  Tables<'contact_inquiries'>,
  'id' | 'therapist_name' | 'therapist_id' | 'status' | 'message' | 'created_at' | 'responded_at'
>;

export function InquirySummary({ userId }: { userId: string }) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadInquiries() {
      const { data, error } = await supabase
        .from('contact_inquiries')
        .select('id, therapist_name, therapist_id, status, message, created_at, responded_at')
        .eq('client_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setInquiries(data);
      }
      setLoading(false);
    }

    loadInquiries();
  }, [userId, supabase]);

  const stats = {
    total: inquiries.length,
    new: inquiries.filter(i => i.status === 'new').length,
    responded: inquiries.filter(i => i.status === 'responded').length,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-sky-500" />
          Your Inquiries
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-gradient-to-br from-sky-50 to-sky-100 p-4">
            <div className="text-2xl font-bold text-sky-900">{stats.total}</div>
            <div className="text-sm text-sky-700">Total Sent</div>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 p-4">
            <div className="text-2xl font-bold text-amber-900">{stats.new}</div>
            <div className="text-sm text-amber-700">Pending</div>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 p-4">
            <div className="text-2xl font-bold text-emerald-900">{stats.responded}</div>
            <div className="text-sm text-emerald-700">Responded</div>
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900">Recent Inquiries</h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-sky-500" />
            </div>
          ) : inquiries.length > 0 ? (
            <div className="space-y-2">
              {inquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="flex items-start justify-between rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                >
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">
                      {inquiry.therapist_name}
                    </div>
                    <div className="line-clamp-1 text-sm text-slate-600">
                      {inquiry.message}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {new Date(inquiry.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="ml-2 flex items-center gap-2">
                    {inquiry.status === 'responded' && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    )}
                    {inquiry.status === 'new' && (
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    )}
                    {inquiry.status === 'viewed' && (
                      <Clock3 className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
              <Mail className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-2 text-sm text-slate-600">
                No inquiries yet. Start exploring therapists!
              </p>
              <Button asChild className="mt-4">
                <Link href="/explore">Explore Therapists</Link>
              </Button>
            </div>
          )}
        </div>

        <Button variant="outline" asChild className="w-full">
          <Link href="/client/inquiries">
            View All Inquiries <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
