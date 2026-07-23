import { FileJson } from 'lucide-react';

export const metadata = {
  title: 'A/B Tests | Admin',
  robots: { index: false, follow: false },
};

export default function ABTestsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <FileJson className="text-accent" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">A/B Testing</h1>
            <p className="text-gray-600 mt-1">Test profile field changes with segment control</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-lg mb-4">
              <FileJson className="text-accent" size={32} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">A/B Testing Framework</h2>
            <p className="text-gray-600 mb-6 max-w-md">
              Create experiments on profile fields. Test value is applied to X% of segment, control group remains unchanged.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-2">Create Test</h3>
                <p className="text-sm text-gray-600">Select field, set test value, choose segment %</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-2">Track Metrics</h3>
                <p className="text-sm text-gray-600">Monitor impact: profile views, clicks, completion</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-2">Roll Out</h3>
                <p className="text-sm text-gray-600">Apply to 100% or revert if needed</p>
              </div>
            </div>

            <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-2">Quick Start</h4>
              <p className="text-sm text-gray-600">
                A/B testing framework is ready. Use the admin dashboard to create and manage profile field experiments.
              </p>
              <div className="mt-4 text-sm font-mono bg-white p-3 rounded border border-blue-200 text-gray-700">
                POST /api/admin/ab-tests/create {"{"} field_name, test_value, segment_percent {"}"}<br/>
                POST /api/admin/ab-tests/finalize {"{"} test_id {"}"}<br/>
                GET /api/admin/ab-tests/results {"{"} test_id {"}"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
