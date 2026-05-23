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
      .select('*, therapist:therapist_id(id, full_name, avatar_url, slug)')
      .eq('client_id', session.userId)
      .in('status', ['pending', 'confirmed'])
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(5),
    supabase
      .from('appointments')
      .select('*, therapist:therapist_id(id, full_name, avatar_url, slug)')
      .eq('client_id', session.userId)
      .in('status', ['completed', 'cancelled'])
      .order('start_time', { ascending: false })
      .limit(10),
    supabase
      .from('payment_transactions')
      .select('*')
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

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
              {upcomingAppts.map((appt: Record<string, unknown>) => {
                const therapist = appt.therapist as Record<string, unknown> | null
                return (
                  <li key={appt.id as string} className="py-3 flex items-center gap-4">
                    {Boolean(therapist?.avatar_url) && (
                      <img src={String(therapist!.avatar_url)} alt="" className="w-10 h-10 rounded-full object-cover" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{therapist?.full_name as string}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(appt.start_time as string).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        {' at '}
                        {new Date(appt.start_time as string).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      appt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {appt.status as string}
                    </span>
                    <Link href={`/client/bookings/${appt.id as string}`} className="text-sm text-blue-600 hover:underline">View</Link>
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
              {transactions.map((tx: Record<string, unknown>) => (
                <li key={tx.id as string} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">${((tx.amount_cents as number) / 100).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{new Date(tx.created_at as string).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    tx.status === 'succeeded' ? 'bg-green-100 text-green-700' :
                    tx.status === 'refunded' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-700'
                  }`}>
                    {tx.status as string}
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
              {pastAppts.map((appt: Record<string, unknown>) => {
                const therapist = appt.therapist as Record<string, unknown> | null
                return (
                  <li key={appt.id as string} className="py-3 flex items-center gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{therapist?.full_name as string}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(appt.start_time as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {' · '}{appt.service_type as string}
                      </p>
                    </div>
                    {appt.status === 'completed' && (
                      <Link
                        href={`/therapists/${therapist?.slug as string}?review=1&appointment=${appt.id as string}`}
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
