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

    // Atualizado para os nomes de colunas do novo Schema
    let queryBuilder = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('visibility_status', 'public')
      .eq('profile_status', 'approved')
      .eq('is_suspended', false)
      .eq('is_banned', false);

    // Text search atualizado para display_name e full_name
    if (query) {
      queryBuilder = queryBuilder.or(
        `display_name.ilike.%${query}%,full_name.ilike.%${query}%,bio.ilike.%${query}%,headline.ilike.%${query}%`
      );
    }

    // Price range filter atualizado para starting_price
    if (minPrice) {
      queryBuilder = queryBuilder.gte('starting_price', parseInt(minPrice));
    }
    if (maxPrice) {
      queryBuilder = queryBuilder.lte('starting_price', parseInt(maxPrice));
    }

    // Specialties filter atualizado para buscar dentro do array (contains)
    if (specialties.length > 0) {
      queryBuilder = queryBuilder.contains('specialties', specialties);
    }

    // Verification filter atualizado para verification_status e subscription_tier
    if (verified === 'true') {
      queryBuilder = queryBuilder.or('verification_status.eq.verified,subscription_tier.eq.elite,subscription_tier.eq.pro');
    }

    // Availability filter
    if (available === 'true') {
      const nowIso = new Date().toISOString();
      queryBuilder = queryBuilder.eq('available_now', true).or(`available_now_expires.is.null,available_now_expires.gt.${nowIso}`);
    }

    // Service mode filters (Atualizado para buscar por preços não nulos, igual no public-profiles.ts)
    if (incall === 'true') {
      queryBuilder = queryBuilder.not('incall_price', 'is', null);
    }
    if (outcall === 'true') {
      queryBuilder = queryBuilder.not('outcall_price', 'is', null);
    }

    // Sorting
    switch (sortBy) {
      case 'price':
        queryBuilder = queryBuilder.order('starting_price', { ascending: true });
        break;
      case 'rating':
        // Se rating não existe diretamente em profiles, ordena por tier/reviews
        queryBuilder = queryBuilder.order('review_count', { ascending: false });
        break;
      case 'distance':
        // Fallback igual o original, usa is_featured
        queryBuilder = queryBuilder.order('is_featured', { ascending: false });
        break;
      default:
        queryBuilder = queryBuilder.order('is_featured', { ascending: false });
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
