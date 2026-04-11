import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let queryBuilder = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('account_type', 'therapist')
      .eq('is_published', true);

    // Text search
    if (query) {
      queryBuilder = queryBuilder.or(
        `first_name.ilike.%${query}%,last_name.ilike.%${query}%,bio.ilike.%${query}%,specialty.ilike.%${query}%`
      );
    }

    // Price range filter
    if (minPrice) {
      queryBuilder = queryBuilder.gte('price_from', parseInt(minPrice));
    }
    if (maxPrice) {
      queryBuilder = queryBuilder.lte('price_from', parseInt(maxPrice));
    }

    // Specialties filter
    if (specialties.length > 0) {
      queryBuilder = queryBuilder.in('specialty', specialties);
    }

    // Verification filter
    if (verified === 'true') {
      queryBuilder = queryBuilder.or('verified_status.eq.verified,verified_status.eq.elite');
    }

    // Availability filter
    if (available === 'true') {
      queryBuilder = queryBuilder.eq('available_now', true);
    }

    // Service mode filters
    if (incall === 'true') {
      queryBuilder = queryBuilder.eq('incall', true);
    }
    if (outcall === 'true') {
      queryBuilder = queryBuilder.eq('outcall', true);
    }

    // Sorting
    switch (sortBy) {
      case 'price':
        queryBuilder = queryBuilder.order('price_from', { ascending: true });
        break;
      case 'rating':
        queryBuilder = queryBuilder.order('rating', { ascending: false });
        break;
      case 'distance':
        // TODO: Implement geo-distance sorting
        queryBuilder = queryBuilder.order('featured', { ascending: false });
        break;
      default:
        queryBuilder = queryBuilder.order('featured', { ascending: false });
    }

    // Pagination
    queryBuilder = queryBuilder.range(page * limit, page * limit + limit - 1);

    const { data, error, count } = await queryBuilder;

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log search history if user is authenticated
    if (user && query) {
      await supabase.from('search_history').insert({
        user_id: user.id,
        query,
        filters: {
          minPrice,
          maxPrice,
          specialties,
          verified,
          available,
        },
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
