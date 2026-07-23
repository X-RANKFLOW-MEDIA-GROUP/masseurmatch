'use client';

import { useState } from 'react';
import { AlertCircle, Loader } from 'lucide-react';
import type { AuditLogEntry } from '@/types/audit';

interface RollbackModalProps {
  entry: AuditLogEntry;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RollbackModal({ entry, onClose, onSuccess }: RollbackModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRollback() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/admin/profile-cms/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audit_log_id: entry.id,
          profile_id: entry.profile_id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Rollback failed');
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg">
        <div className="flex gap-3 mb-4">
          <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
          <div>
            <h2 className="font-semibold text-gray-900">Confirm Rollback</h2>
            <p className="text-sm text-gray-600 mt-1">
              Revert <strong>{entry.field_name}</strong> to previous value?
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg mb-4 space-y-2 text-sm">
          <div>
            <p className="text-gray-600">Old value:</p>
            <p className="font-mono text-gray-900 break-words">
              {JSON.stringify(entry.old_value)}
            </p>
          </div>
          <div className="border-t pt-2">
            <p className="text-gray-600">New value:</p>
            <p className="font-mono text-gray-900 break-words">
              {JSON.stringify(entry.new_value)}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleRollback}
            disabled={loading}
            className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader size={16} className="animate-spin" />}
            Rollback
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          This action creates a new audit log entry recording the rollback.
        </p>
      </div>
    </div>
  );
}
