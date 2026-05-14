'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Transaction = {
  id: string
  amount_cents: number
  currency: string
  status: string
  created_at: string
  appointment: {
    start_time: string
    service_type: string
    therapist: { full_name: string; avatar_url: string } | null
  } | null
}

export default function ClientPaymentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stripe/payment-history')
      .then(r => r.json())
      .then(d => setTransactions(d.transactions ?? []))
      .finally(() => setLoading(false))
  }, [])

  const total = transactions
    .filter(t => t.status === 'succeeded')
    .reduce((sum, t) => sum + t.amount_cents, 0)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/client/dashboard" className="text-gray-500 hover:text-gray-700">← Dashboard</Link>
          <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl p-5 shadow-sm mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Spent</p>
            <p className="text-3xl font-bold text-gray-900">${(total / 100).toFixed(2)}</p>
          </div>
          <p className="text-sm text-gray-400">{transactions.filter(t => t.status === 'succeeded').length} payments</p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No payments yet</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {transactions.map(tx => (
              <li key={tx.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {tx.appointment?.therapist?.avatar_url && (
                      <img src={tx.appointment.therapist.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-800">{tx.appointment?.therapist?.full_name ?? 'Subscription'}</p>
                      {tx.appointment && (
                        <p className="text-sm text-gray-500 capitalize">
                          {tx.appointment.service_type} · {new Date(tx.appointment.start_time).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${(tx.amount_cents / 100).toFixed(2)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      tx.status === 'succeeded' ? 'bg-green-100 text-green-700' :
                      tx.status === 'refunded' ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-600'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">{new Date(tx.created_at).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
