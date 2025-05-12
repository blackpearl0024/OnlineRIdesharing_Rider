// app/api/user/route.ts
import { NextResponse } from 'next/server'
import connectMongodb from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(req: Request) {
  try {
    const { clerkId, name, email, phone, role, homeLocation, birthday, vehicleNumber } = await req.json()
    await connectMongodb()

    const existingUser = await User.findOne({ clerkId })

    if (existingUser) {
      // Update the existing user
      await User.updateOne({ clerkId }, {
        name,
        email,
        phone,
        role:role.toLowerCase(),
        homeLocation,
        birthday,
        vehicleNumber,
      })
    } else {
      // Insert new user
      await User.create({
        clerkId,
        name,
        email,
        phone,
        role:role.toLowerCase(),
        homeLocation,
        birthday,
        vehicleNumber,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error saving user:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
