import { NextRequest, NextResponse } from 'next/server';
import { getRequestSession } from '@/app/api/_lib/session';
import { createSupabaseAdminClient } from '@/app/api/_lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const specialties = searchParams.getAll('specialties');
    const verified = searchParams.get('verified');
    const available = searchParams.get('available');
    const incall = searchParams.get('incall');
    const outcall = searchParams.get('outcall');
    const sortBy = searchParams.get('sortBy') || 'featured';
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');

    const supabase = createSupabaseAdminClient();
    const session = getRequestSession(request);

    let queryBuilder = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('visibility_status', 'public')
      .eq('profile_status', 'approved')
      .eq('is_suspended', false)
      .eq('is_banned', false);

    if (query) {
      queryBuilder = queryBuilder.or(
        `display_name.ilike.%${query}%,full_name.ilike.%${query}%,bio.ilike.%${query}%,headline.ilike.%${query}%`
      );
    }

    if (minPrice) {
      queryBuilder = queryBuilder.gte('starting_price', parseInt(minPrice));
    }
    if (maxPrice) {
      queryBuilder = queryBuilder.lte('starting_price', parseInt(maxPrice));
    }

    if (specialties.length > 0) {
      queryBuilder = queryBuilder.contains('specialties', specialties);
    }

    if (verified === 'true') {
      queryBuilder = queryBuilder.or('verification_status.eq.verified,subscription_tier.eq.elite,subscription_tier.eq.pro');
    }

    if (available === 'true') {
      const nowIso = new Date().toISOString();
      queryBuilder = queryBuilder.eq('available_now', true).or(`available_now_expires.is.null,available_now_expires.gt.${nowIso}`);
    }

    if (incall === 'true') {
      queryBuilder = queryBuilder.not('incall_price', 'is', null);
    }
    if (outcall === 'true') {
      queryBuilder = queryBuilder.not('outcall_price', 'is', null);
    }

    switch (sortBy) {
      case 'price':
        queryBuilder = queryBuilder.order('starting_price', { ascending: true });
        break;
      case 'rating':
        queryBuilder = queryBuilder.order('review_count', { ascending: false });
        break;
      case 'distance':
        queryBuilder = queryBuilder.order('is_featured', { ascending: false });
        break;
      default:
        queryBuilder = queryBuilder.order('is_featured', { ascending: false });
    }

    queryBuilder = queryBuilder.range(page * limit, page * limit + limit - 1);

    const { data, error, count } = await queryBuilder;

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log search history for authenticated users
    if (session && query) {
      await supabase.from('search_history').insert({
        user_id: session.userId,
        query,
        filters: { minPrice, maxPrice, specialties, verified, available },
        results_count: count || 0,
      });
    }

    return NextResponse.json({
      results: data || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
