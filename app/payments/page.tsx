'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function PaymentHistory() {
  const { user, isLoaded } = useUser()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user?.id) return
      
      try {
        const res = await fetch(`/api/payment/history?userId=${user.id}`)
        const data = await res.json()
        setPayments(data.payments || [])
      } catch (error) {
        console.error('Failed to fetch payments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [user?.id])

  if (!isLoaded || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Payment History</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        {payments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No payment history found</p>
            <Link href="/" className="text-blue-600 hover:underline mt-2 inline-block">
              Go back home
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map(payment => (
              <div key={payment.id} className="border-b pb-4 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      {payment.type === 'sent' ? 'Paid to' : 'Received from'} {payment.counterparty.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(payment.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      payment.type === 'sent' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {payment.type === 'sent' ? '-' : '+'}{payment.amount} {payment.currency}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      payment.status === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : payment.status === 'failed' 
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}