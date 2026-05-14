import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata = { robots: 'noindex, nofollow' }

export default async function ClientFavoritesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/client/favorites')

  const { data: favorites } = await supabase
    .from('favorites')
    .select('*, therapist:therapist_id(id, full_name, avatar_url, slug, city, state, rating, review_count)')
    .eq('user_id', user.id)
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
            {favorites.map((fav: any) => (
              <div key={fav.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                {fav.therapist?.avatar_url && (
                  <img src={fav.therapist.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover" />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{fav.therapist?.full_name}</p>
                  <p className="text-sm text-gray-500">{fav.therapist?.city}, {fav.therapist?.state}</p>
                  {fav.therapist?.rating && (
                    <p className="text-sm text-yellow-600">⭐ {fav.therapist.rating.toFixed(1)} ({fav.therapist.review_count} reviews)</p>
                  )}
                </div>
                <Link
                  href={`/therapists/${fav.therapist?.slug}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                >
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
