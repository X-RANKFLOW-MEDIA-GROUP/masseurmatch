import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || '7'; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    // Get total inquiries
    const { count: totalInquiries } = await supabase
      .from('contact_inquiries')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Get inquiries by status
    const { data: inquiriesByStatus } = await supabase
      .from('contact_inquiries')
      .select('status')
      .gte('created_at', startDate.toISOString());

    const statusCounts = {
      pending: inquiriesByStatus?.filter(i => i.status === 'pending').length || 0,
      responded: inquiriesByStatus?.filter(i => i.status === 'responded').length || 0,
      archived: inquiriesByStatus?.filter(i => i.status === 'archived').length || 0,
    };

    // Get total reviews
    const { count: totalReviews } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Get average rating
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .gte('created_at', startDate.toISOString());

    const avgRating = reviews && reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
      : 0;

    // Get total therapists
    const { count: totalTherapists } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'therapist');

    // Get total clients
    const { count: totalClients } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'client');

    // Get favorites count
    const { count: totalFavorites } = await supabase
      .from('client_favorites')
      .select('*', { count: 'exact', head: true });

    // Get daily inquiries for chart
    const { data: dailyInquiries } = await supabase
      .from('contact_inquiries')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    const groupedByDay = {} as Record<string, number>;
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
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
