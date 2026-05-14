'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Appointment = {
  id: string
  start_time: string
  end_time: string
  status: string
  service_type: string
  therapist: { id: string; full_name: string; avatar_url: string; slug: string } | null
}

export default function ClientBookingsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('upcoming')

  useEffect(() => {
    const params = filter === 'upcoming'
      ? '?status=confirmed'
      : filter === 'pending'
      ? '?status=pending'
      : '?status=completed'

    fetch(`/api/appointments${params}`)
      .then(r => r.json())
      .then(d => setAppointments(d.appointments ?? []))
      .finally(() => setLoading(false))
  }, [filter])

  const cancelAppointment = async (id: string) => {
    if (!confirm('Cancel this appointment?')) return
    await fetch(`/api/appointments/${id}`, { method: 'DELETE' })
    setAppointments(prev => prev.filter(a => a.id !== id))
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/client/dashboard" className="text-gray-500 hover:text-gray-700">← Dashboard</Link>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['upcoming', 'pending', 'past'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === tab ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">No {filter} appointments</p>
            <Link href="/search" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Find a Therapist</Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {appointments.map(appt => (
              <li key={appt.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {appt.therapist?.avatar_url && (
                      <img src={appt.therapist.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-800">{appt.therapist?.full_name}</p>
                      <p className="text-sm text-gray-500 capitalize">{appt.service_type}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    appt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    appt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    appt.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {appt.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    📅 {new Date(appt.start_time).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    {' '}
                    🕐 {new Date(appt.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    {' – '}
                    {new Date(appt.end_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                  {(appt.status === 'pending' || appt.status === 'confirmed') && (
                    <button
                      onClick={() => cancelAppointment(appt.id)}
                      className="text-sm text-red-500 hover:text-red-700 font-medium"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
