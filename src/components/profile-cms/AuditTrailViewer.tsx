'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Filter } from 'lucide-react';
import type { AuditLogEntry, AuditFilterOptions } from '@/types/audit';

interface AuditTrailViewerProps {
  profileId?: string;
  className?: string;
}

export function AuditTrailViewer({ profileId, className = '' }: AuditTrailViewerProps) {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AuditFilterOptions>({});
  const [showFilters, setShowFilters] = useState(false);

  const pageSize = 10;

  const loadAuditLog = async () => {
    try {
      setLoading(true);
      const endpoint = profileId
        ? `/api/pro/profile/audit-logs?profile_id=${profileId}&limit=${pageSize}&offset=${(page - 1) * pageSize}`
        : `/api/admin/audit-log?limit=${pageSize}&offset=${(page - 1) * pageSize}`;

      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Failed to load audit log');
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (error) {
      console.error('Failed to load audit log:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters, profileId]);

  async function exportCSV() {
    const csv = [
      ['Timestamp', 'Field', 'Old Value', 'New Value', 'Reason', 'Editor'],
      ...entries.map(entry => [
        new Date(entry.created_at).toLocaleString(),
        entry.field_name,
        JSON.stringify(entry.old_value),
        JSON.stringify(entry.new_value),
        entry.reason || 'N/A',
        entry.user?.email || 'Unknown'
      ])
    ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Audit Trail</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            title="Filter"
          >
            <Filter size={18} />
          </button>
          <button
            onClick={exportCSV}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            title="Export as CSV"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
              <input
                type="text"
                placeholder="Filter by field name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                onChange={(e) => setFilters({ ...filters, field_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading audit log...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No audit entries found</div>
      ) : (
        <>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Timestamp</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Field</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Change</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {new Date(entry.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{entry.field_name}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-xs truncate">
                      <span className="line-through text-red-600">{JSON.stringify(entry.old_value).slice(0, 30)}</span>
                      {' → '}
                      <span className="text-green-600">{JSON.stringify(entry.new_value).slice(0, 30)}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{entry.reason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {page} · {entries.length} entries shown
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={entries.length < pageSize}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
