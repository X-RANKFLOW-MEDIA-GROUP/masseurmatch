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

export default async function ClientFavoritesPage() {
  const session = await getSession()
  if (!session) redirect('/login?redirect=/client/favorites')

  const supabase = createSupabaseAdminClient()
  const { data: favorites } = await supabase
    .from('favorites')
    .select('*, therapist:therapist_id(id, full_name, avatar_url, slug, city, state, rating, review_count)')
    .eq('user_id', session.userId)
    .order('created_at', { ascending: false })

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
            {favorites.map((fav: Record<string, unknown>) => {
              const therapist = fav.therapist as Record<string, unknown> | null
              return (
                <div key={fav.id as string} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                  {Boolean(therapist?.avatar_url) && (
                    <img src={String(therapist!.avatar_url)} alt="" className="w-14 h-14 rounded-full object-cover" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{String(therapist?.full_name ?? '')}</p>
                    <p className="text-sm text-gray-500">{String(therapist?.city ?? '')}, {String(therapist?.state ?? '')}</p>
                    {Boolean(therapist?.rating) && (
                      <p className="text-sm text-yellow-600">⭐ {(therapist!.rating as number).toFixed(1)} ({therapist!.review_count as number} reviews)</p>
                    )}
                  </div>
                  <Link
                    href={`/therapists/${therapist?.slug as string}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                  >
                    View Profile
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
