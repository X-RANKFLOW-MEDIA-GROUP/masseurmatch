import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getRequestSession } from '@/app/api/_lib/session'
import { createSupabaseAdminClient } from '@/app/api/_lib/supabase-server'

export const metadata = { robots: 'noindex, nofollow' }

async function getSession() {
  const cookieStore = await cookies()
  return getRequestSession(
    new Request('http://localhost/client/favorites', {
      headers: { cookie: cookieStore.toString() },
    })
  )
}

type TherapistProfile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  slug: string | null
  city: string | null
  state: string | null
  average_rating: number
  review_count: number
}

export default async function ClientFavoritesPage() {
  const session = await getSession()
  if (!session) redirect('/login?redirect=/client/favorites')

  const supabase = createSupabaseAdminClient()
  const { data: favorites } = await supabase
    .from('favorites')
    .select('id, therapist_id, created_at')
    .eq('user_id', session.userId)
    .order('created_at', { ascending: false })

  const therapistIds = [...new Set(
    (favorites ?? []).map(f => f.therapist_id as string).filter(Boolean)
  )]

  const profilesById: Record<string, TherapistProfile> = {}
  if (therapistIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, slug, city, state, average_rating, review_count')
      .in('id', therapistIds)
    profiles?.forEach(p => { profilesById[p.id] = p as TherapistProfile })
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/client/dashboard" className="text-gray-500 hover:text-gray-700">← Dashboard</Link>
          <h1 className="text-2xl font-bold text-gray-900">Saved Therapists</h1>
        </div>

        {!favorites?.length ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">No saved therapists yet</p>
            <Link href="/search" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Browse Therapists</Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {favorites.map(fav => {
              const therapist = profilesById[fav.therapist_id as string] ?? null
              return (
                <div key={fav.id as string} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                  {therapist?.avatar_url && (
                    <img src={therapist.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{therapist?.full_name ?? 'Therapist'}</p>
                    {(therapist?.city || therapist?.state) && (
                      <p className="text-sm text-gray-500">
                        {[therapist.city, therapist.state].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {therapist?.average_rating > 0 && (
                      <p className="text-sm text-yellow-600">
                        ⭐ {therapist.average_rating.toFixed(1)} ({therapist.review_count} reviews)
                      </p>
                    )}
                  </div>
                  {therapist?.slug && (
                    <Link
                      href={`/therapists/${therapist.slug}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                    >
                      View Profile
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
