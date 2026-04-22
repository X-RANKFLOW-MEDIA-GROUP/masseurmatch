'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Users, MessageSquare, Star, Heart } from 'lucide-react';
import { toast } from 'sonner';

interface AnalyticsData {
  metrics: {
    totalInquiries: number;
    totalReviews: number;
    avgRating: string;
    totalTherapists: number;
    totalClients: number;
    totalFavorites: number;
  };
  inquiriesByStatus: {
    pending: number;
    responded: number;
    archived: number;
  };
  chartData: Array<{ date: string; inquiries: number }>;
  timeRange: number;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?timeRange=${timeRange}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-slate-600">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total Inquiries',
      value: data.metrics.totalInquiries,
      icon: MessageSquare,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Total Reviews',
      value: data.metrics.totalReviews,
      icon: Star,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      title: 'Average Rating',
      value: `${data.metrics.avgRating}★`,
      icon: TrendingUp,
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      title: 'Therapists',
      value: data.metrics.totalTherapists,
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Clients',
      value: data.metrics.totalClients,
      icon: Users,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      title: 'Favorites',
      value: data.metrics.totalFavorites,
      icon: Heart,
      color: 'bg-pink-100 text-pink-600',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
            <p className="text-slate-600 mt-2">Platform metrics and performance overview</p>
          </div>
          <div className="flex gap-2">
            {[7, 30, 90].map(days => (
              <Button
                key={days}
                variant={timeRange === days ? 'default' : 'outline'}
                onClick={() => setTimeRange(days)}
              >
                {days}d
              </Button>
            ))}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">{metric.title}</p>
                      <p className="text-2xl font-bold text-slate-900 mt-2">{metric.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${metric.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Inquiry Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Inquiry Status Breakdown</CardTitle>
            <CardDescription>Distribution of inquiries by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(data.inquiriesByStatus).map(([status, count]) => (
                <div key={status} className="text-center">
                  <p className="text-3xl font-bold text-slate-900">{count}</p>
                  <p className="text-sm text-slate-600 mt-1 capitalize">{status}</p>
                  <Badge className="mt-2" variant={status === 'pending' ? 'secondary' : 'default'}>
                    {((count / data.metrics.totalInquiries) * 100).toFixed(0)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chart Data */}
        <Card>
          <CardHeader>
            <CardTitle>Inquiries Over Time</CardTitle>
            <CardDescription>Daily inquiry volume for the last {timeRange} days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.chartData.length === 0 ? (
                <p className="text-center text-slate-500">No data available</p>
              ) : (
                <div className="space-y-2">
                  {data.chartData.map((point, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <span className="text-xs font-medium text-slate-600 w-20">{point.date}</span>
                      <div className="flex-1 h-8 bg-slate-100 rounded relative overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{
                            width: `${
                              (point.inquiries /
                                Math.max(
                                  ...data.chartData.map(d => d.inquiries),
                                  1
                                )) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-900 w-12 text-right">
                        {point.inquiries}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
