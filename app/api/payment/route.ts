// app/api/payment/route.ts
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import connectMongodb from '@/lib/mongodb';
import Wallet from '@/models/Wallet';
import Payment from '@/models/Payment';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  await connectMongodb();

  try {
    const { fare, driverId, driverName, riderId, riderName } = await req.json();
console.log("fare: " + fare +" driverId: "+driverId + " drivername: "+ driverName + "  riderId: " + riderId +" riderName " +riderName)
    // Validate required fields
    if (!fare || !driverId || !driverName || !riderId || !riderName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check rider's wallet balance
    const riderWallet = await Wallet.findOne({ userId: riderId });
    if (!riderWallet || riderWallet.balance < fare) {
      return NextResponse.json(
        { error: 'Insufficient balance in wallet' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(fare * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Create payment record with proper validation
    const paymentData = {
      orderId: order.id,
      amount: fare,
      currency: 'INR',
      riderId,
      riderName,
      driverId,
      driverName,
      status: 'pending',
    };

    // Validate before saving
    const payment = new Payment(paymentData);
    const validationError = payment.validateSync();
    
    if (validationError) {
      console.error('Validation error:', validationError.errors);
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: Object.values(validationError.errors).map(e => e.message)
        },
        { status: 400 }
      );
    }

    await payment.save();

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });

  } catch (error: any) {
    console.error('Payment error:', error);
    
    // Handle Razorpay errors specifically
    if (error.error?.description) {
      return NextResponse.json(
        { error: `Payment gateway error: ${error.error.description}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to process payment',
        details: error.message 
      },
      { status: 500 }
    );
  }
}