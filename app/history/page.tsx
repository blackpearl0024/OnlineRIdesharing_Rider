'use client'

import React, { useEffect, useState } from 'react'
import ReverseGeocode from '../components/ReverseGeocode'

type Location = {
  latitude: number
  longitude: number
}

type Trip = {
  _id: string
  tripId: string
  fare: number
  status: string
  srcLoc: Location
  dstLoc: Location
  rider: {
    _id: string
    name: string
    rating: string
  }
  driver: {
    _id: string
    name: string
    rating: string
    vehicleType: string
    location: Location
  }
}

export default function TripHistoryPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const clerkId = '1' // replace with dynamic id if needed

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await fetch(`/api/history?clerkId=${clerkId}`)
        const data = await res.json()
        if (res.ok) {
          setTrips(data.user) // users = array of trips
        } else {
          console.error(data.error)
        }
      } catch (error) {
        console.error('Failed to fetch trip history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrips()
  }, [])

  if (loading) return <div>Loading...</div>

  if (trips.length === 0) return <div>No trips found.</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Trip History</h1>
      <ul className="space-y-4">
        {trips.map((trip) => (
          <li key={trip._id} className="border p-4 rounded shadow">
            <p><strong>Trip ID:</strong> {trip.tripId}</p>
            <p><strong>Fare:</strong> ₹{trip.fare.toFixed(2)}</p>
            
            <p><strong>Driver:</strong> {trip.driver.name} ({trip.driver.vehicleType})</p>
            <p><strong>Rider:</strong> {trip.rider.name} </p>
            <p>
              <strong>From:</strong>{' '}
              <ReverseGeocode lat={trip.srcLoc.latitude} lon={trip.srcLoc.longitude} />
            </p>
            <p>
              <strong>To:</strong>{' '}
              <ReverseGeocode lat={trip.dstLoc.latitude} lon={trip.dstLoc.longitude} />
            </p>
          </li>
        ))}
      </ul>
    </div>
  )

}
