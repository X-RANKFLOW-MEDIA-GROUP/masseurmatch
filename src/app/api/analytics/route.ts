import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession, createSupabaseAdminClient } from '@/app/api/_lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession(request as unknown as Request);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || '7';
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const [
      { count: totalInquiries },
      { data: inquiriesByStatus },
      { count: totalReviews },
      { data: reviews },
      { count: totalTherapists },
      { count: totalClients },
      { count: totalFavorites },
      { data: dailyInquiries },
    ] = await Promise.all([
      supabase.from('contact_inquiries').select('*', { count: 'exact', head: true }).gte('created_at', startDate.toISOString()),
      supabase.from('contact_inquiries').select('status').gte('created_at', startDate.toISOString()),
      supabase.from('reviews').select('*', { count: 'exact', head: true }).gte('created_at', startDate.toISOString()),
      supabase.from('reviews').select('rating').gte('created_at', startDate.toISOString()),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'therapist'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
      supabase.from('client_favorites').select('*', { count: 'exact', head: true }),
      supabase.from('contact_inquiries').select('created_at').gte('created_at', startDate.toISOString()).order('created_at', { ascending: true }),
    ]);

    const statusCounts = {
      pending: inquiriesByStatus?.filter(i => i.status === 'new').length || 0,
      responded: inquiriesByStatus?.filter(i => i.status === 'responded').length || 0,
      archived: inquiriesByStatus?.filter(i => i.status === 'archived').length || 0,
    };

    const avgRating = reviews && reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length).toFixed(2)
      : 0;

    const groupedByDay: Record<string, number> = {};
    dailyInquiries?.forEach(inquiry => {
      const day = new Date(inquiry.created_at).toLocaleDateString();
      groupedByDay[day] = (groupedByDay[day] || 0) + 1;
    });

    const chartData = Object.entries(groupedByDay).map(([date, count]) => ({
      date,
      inquiries: count,
    }));

    return NextResponse.json({
      metrics: {
        totalInquiries,
        totalReviews,
        avgRating,
        totalTherapists,
        totalClients,
        totalFavorites,
      },
      inquiriesByStatus: statusCounts,
      chartData,
      timeRange: parseInt(timeRange),
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
