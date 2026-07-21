import { NextRequest, NextResponse } from 'next/server';
import { getRequestSession } from '@/app/api/_lib/session';
import { createSupabaseAdminClient } from '@/app/api/_lib/supabase-server';
import { assertRateLimit } from '@/app/_lib/security';
import { RouteError } from '@/app/api/_lib/http';

// Never use SELECT * for a public response. This list deliberately excludes contact
// details, precise location, admin/moderation state, billing, identity, and analytics.
const PUBLIC_PROFILE_COLUMNS = 'id,slug,display_name,full_name,avatar_url,photo_url,headline,tagline,bio,city,state,neighborhood,neighborhood_name,primary_area,country,service_categories,massage_techniques,specialties,specialty,modalities,modality,incall_price,outcall_price,starting_price,starting_rate,price_min,price_max,rates,pricing_sessions,offers_incall,offers_outcall,incall,outcall,outcall_radius_miles,service_radius_miles,years_experience,languages,languages_spoken,lgbtq_affirming,verification_status,is_verified_profile,is_verified_photos,subscription_tier,is_featured,featured_until,available_now,available_now_expires,traveling,visiting,travel_schedule,review_count,average_rating,rating_average,photo_limit,updated_at';

export async function GET(request: NextRequest) {
  try {
    assertRateLimit(request, 'search-therapists', { limit: 40, windowMs: 60_000 });
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
    const page = Math.max(0, parseInt(searchParams.get('page') || '0', 10) || 0);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20));

    const supabase = createSupabaseAdminClient();
    const session = getRequestSession(request);

    let queryBuilder = supabase
      .from('profiles')
      .select(PUBLIC_PROFILE_COLUMNS, { count: 'exact' })
      .eq('visibility_status', 'public')
      .eq('profile_status', 'approved')
      .eq('is_suspended', false)
      .eq('is_banned', false)
      .eq('is_demo', false);

    if (query) {
      queryBuilder = queryBuilder.or(
        `display_name.ilike.%${query}%,full_name.ilike.%${query}%,bio.ilike.%${query}%,headline.ilike.%${query}%`
      );
    }
    if (minPrice) queryBuilder = queryBuilder.gte('starting_price', parseInt(minPrice, 10));
    if (maxPrice) queryBuilder = queryBuilder.lte('starting_price', parseInt(maxPrice, 10));
    if (specialties.length > 0) queryBuilder = queryBuilder.contains('specialties', specialties);
    if (verified === 'true') {
      queryBuilder = queryBuilder.or('verification_status.eq.verified,subscription_tier.eq.elite,subscription_tier.eq.pro');
    }
    if (available === 'true') {
      const nowIso = new Date().toISOString();
      queryBuilder = queryBuilder.eq('available_now', true).or(`available_now_expires.is.null,available_now_expires.gt.${nowIso}`);
    }
    if (incall === 'true') queryBuilder = queryBuilder.not('incall_price', 'is', null);
    if (outcall === 'true') queryBuilder = queryBuilder.not('outcall_price', 'is', null);

    switch (sortBy) {
      case 'price': queryBuilder = queryBuilder.order('starting_price', { ascending: true }); break;
      case 'rating': queryBuilder = queryBuilder.order('review_count', { ascending: false }); break;
      default: queryBuilder = queryBuilder.order('is_featured', { ascending: false }); break;
    }

    const { data, error, count } = await queryBuilder.range(page * limit, page * limit + limit - 1);
    if (error) {
      console.error('Search error:', error);
      return NextResponse.json({ error: 'Search unavailable' }, { status: 400 });
    }

    if (session && query) {
      await supabase.from('search_history').insert({
        user_id: session.userId,
        query,
        filters: { minPrice, maxPrice, specialties, verified, available },
        results_count: count || 0,
      });
    }

    return NextResponse.json({ results: data || [], total: count || 0, page, limit });
  } catch (error) {
    if (error instanceof RouteError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
