"use client";

import { useEffect, useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MapPin, 
  DollarSign,
} from "lucide-react";
import { DashboardSkeleton } from "@/app/_components/DashboardSkeleton";

// Cleaned up the types to remove 'any'
interface AnalyticsData {
  stats: {
    totalTherapists: number;
    pendingReviews: number;
    verifiedIdentity: number;
  };
  topCities: Array<{ name: string; count: number }>;
  revenueByTier: Record<string, number>;
  signupsByDay?: Array<{ date: string; count: number }>;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then(res => res.json())
      .then(json => {
        if (json.ok && json.stats) setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8"><DashboardSkeleton /></div>;
  if (!data) return <div className="p-8">Failed to load analytics.</div>;

  const { stats, revenueByTier, topCities } = data;

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900">Analytics Overview</h1>
        <p className="text-slate-500">Real-time performance metrics for MasseurMatch.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Therapists</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalTherapists}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Reviews</p>
              <p className="text-2xl font-bold text-slate-900">{stats.pendingReviews}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Verified Identity</p>
              <p className="text-2xl font-bold text-slate-900">{stats.verifiedIdentity}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Top Cities */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-slate-900">Top Cities</h2>
            <MapPin className="h-5 w-5 text-slate-400" />
          </div>
          <div className="space-y-4">
            {topCities.map((city) => (
              <div key={city.name} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{city.name}</span>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-32 rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500" 
                      style={{ width: `${stats.totalTherapists > 0 ? (city.count / stats.totalTherapists) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-900">{city.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Tier */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-slate-900">Subscription Tiers</h2>
            <BarChart3 className="h-5 w-5 text-slate-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(revenueByTier).map(([tier, count]) => (
              <div key={tier} className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{tier}</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
