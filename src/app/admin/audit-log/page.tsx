import { Suspense } from 'react';
import { AuditTrailViewer } from '@/components/profile-cms/AuditTrailViewer';

export const metadata = {
  title: 'Audit Log | Admin',
  robots: { index: false, follow: false },
};

export default function AdminAuditLogPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-gray-600 mt-2">Complete history of all profile changes across the system</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading audit log...</div>}>
            <AuditTrailViewer className="p-8" />
          </Suspense>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Changes</h3>
            <p className="text-3xl font-bold text-gray-600">—</p>
            <p className="text-sm text-gray-500 mt-1">All-time profile edits</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">This Month</h3>
            <p className="text-3xl font-bold text-gray-600">—</p>
            <p className="text-sm text-gray-500 mt-1">Recent activity</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Retention</h3>
            <p className="text-3xl font-bold text-gray-600">—</p>
            <p className="text-sm text-gray-500 mt-1">GDPR/LGPD compliant</p>
          </div>
        </div>
      </div>
    </div>
  );
}
