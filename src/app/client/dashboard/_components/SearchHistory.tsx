'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Trash2, Clock } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type SearchRecord = Pick<Tables<'search_history'>, 'id' | 'query' | 'results_count' | 'created_at'>;

export function SearchHistory({ userId }: { userId: string }) {
  const [searches, setSearches] = useState<SearchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadSearchHistory() {
      const { data, error } = await supabase
        .from('search_history')
        .select('id, query, results_count, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setSearches(data);
      }
      setLoading(false);
    }

    loadSearchHistory();
  }, [userId, supabase]);

  const deleteSearch = async (searchId: string) => {
    await supabase
      .from('search_history')
      .delete()
      .eq('id', searchId);

    setSearches(searches.filter(s => s.id !== searchId));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-sky-500" />
          Recent Searches
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-sky-500" />
          </div>
        ) : searches.length > 0 ? (
          <div className="space-y-2">
            {searches.map((search) => (
              <div
                key={search.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-2 hover:bg-slate-50"
              >
                <Link
                  href={`/explore?q=${encodeURIComponent(search.query ?? "")}`}
                  className="flex-1 flex items-center gap-2 text-sm text-slate-700 hover:text-sky-600"
                >
                  <Search className="h-4 w-4 text-slate-400" />
                  <span className="truncate">{search.query}</span>
                  {(search.results_count ?? 0) > 0 && (
                    <span className="text-xs text-slate-500">
                      ({search.results_count ?? 0})
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => deleteSearch(search.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Search className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 text-sm text-slate-600">
              Your searches will appear here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
