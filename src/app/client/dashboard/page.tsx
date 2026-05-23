import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getRequestSession } from '@/app/api/_lib/session'
import { createSupabaseAdminClient } from '@/app/api/_lib/supabase-server'

export const metadata = { robots: 'noindex, nofollow' }

async function getSession() {
  const cookieStore = await cookies()
  return getRequestSession(
    new Request('http://localhost/client/dashboard', {
      headers: { cookie: cookieStore.toString() },
    })
  )
}

export default async function ClientDashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login?redirect=/client/dashboard')

  const supabase = createSupabaseAdminClient()
  const [{ data: upcomingAppts }, { data: pastAppts }, { data: transactions }] = await Promise.all([
    supabase
      .from('appointments')
      .select('id, therapist_id, start_time, end_time, service_type, status')
      .eq('client_id', session.userId)
      .in('status', ['pending', 'confirmed'])
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(5),
    supabase
      .from('appointments')
      .select('id, therapist_id, start_time, end_time, service_type, status')
      .eq('client_id', session.userId)
      .in('status', ['completed', 'cancelled'])
      .order('start_time', { ascending: false })
      .limit(10),
    supabase
      .from('payment_transactions')
      .select('id, amount_cents, status, created_at')
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  // Collect unique therapist IDs and fetch profiles in one query
  const therapistIds = [...new Set([
    ...(upcomingAppts ?? []).map(a => a.therapist_id as string),
    ...(pastAppts ?? []).map(a => a.therapist_id as string),
  ].filter(Boolean))]

  const profilesById: Record<string, { id: string; full_name: string | null; avatar_url: string | null; slug: string | null }> = {}
  if (therapistIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, slug')
      .in('id', therapistIds)
    profiles?.forEach(p => { profilesById[p.id] = p })
  }

  type Appt = { id: string; therapist_id: string; start_time: string; service_type: string; status: string }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Dashboard</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { href: '/client/bookings', label: '📅 My Bookings' },
            { href: '/client/messages', label: '💬 Messages' },
            { href: '/client/payments', label: '💳 Payments' },
            { href: '/client/favorites', label: '❤️ Favorites' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100 font-medium text-gray-700"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <section className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Upcoming Appointments</h2>
            <Link href="/client/bookings" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          {!upcomingAppts?.length ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-3">No upcoming appointments</p>
              <Link href="/search" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Find a Therapist</Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {(upcomingAppts as Appt[]).map(appt => {
                const therapist = profilesById[appt.therapist_id] ?? null
                return (
                  <li key={appt.id} className="py-3 flex items-center gap-4">
                    {therapist?.avatar_url && (
                      <img src={therapist.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{therapist?.full_name ?? 'Therapist'}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(appt.start_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        {' at '}
                        {new Date(appt.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      appt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {appt.status}
                    </span>
                    <Link href={`/client/bookings/${appt.id}`} className="text-sm text-blue-600 hover:underline">View</Link>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Payments</h2>
            <Link href="/client/payments" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          {!transactions?.length ? (
            <p className="text-gray-500 text-sm py-4">No payment history yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {(transactions as { id: string; amount_cents: number; status: string; created_at: string }[]).map(tx => (
                <li key={tx.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">${(tx.amount_cents / 100).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    tx.status === 'succeeded' ? 'bg-green-100 text-green-700' :
                    tx.status === 'refunded' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-700'
                  }`}>
                    {tx.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Past Sessions</h2>
            <Link href="/client/bookings?status=completed" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          {!pastAppts?.length ? (
            <p className="text-gray-500 text-sm py-4">No past sessions yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {(pastAppts as Appt[]).map(appt => {
                const therapist = profilesById[appt.therapist_id] ?? null
                return (
                  <li key={appt.id} className="py-3 flex items-center gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{therapist?.full_name ?? 'Therapist'}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(appt.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {' · '}{appt.service_type}
                      </p>
                    </div>
                    {appt.status === 'completed' && therapist?.slug && (
                      <Link
                        href={`/therapists/${therapist.slug}?review=1&appointment=${appt.id}`}
                        className="text-sm text-yellow-600 hover:underline font-medium"
                      >
                        ⭐ Leave Review
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
