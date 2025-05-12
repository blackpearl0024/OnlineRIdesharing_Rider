'use client';
import Script from 'next/script';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import * as StompJs from '@stomp/stompjs';
type Props = {
  fare:number
  stompClient: StompJs.Client | null;
};

export default function RiderPage( {fare, stompClient }: Props) {
  const [isPaying, setIsPaying] = useState(false);
  const { user } = useUser();
  const D_name = user?.fullName ||'';

  const D_email = user?.emailAddresses?.[0]?.emailAddress || '';
  const D_phone = user?.phoneNumbers?.[0]?.phoneNumber || '';
  
  const handlePayment = async () => {
    setIsPaying(true);
    const res = await fetch('/api/payment', { method: 'POST' });
    const data = await res.json();

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // from .env.local
      amount: fare * 100,
      currency: 'INR',
      name: 'My Project',
      description: 'Test Payment',
      order_id: data.id,
      handler: function (response: any) {
        if (stompClient && stompClient.connected) {
          stompClient.publish({
            destination: '/app/paymentReceived',
            body: JSON.stringify({}),
          });
          console.log("api call is maked from payment");
        } else {
          console.warn('STOMP client is not connected.');
        }},
      prefill: {
        name: D_name,
        email: D_email,
        contact: D_phone,
      },
      theme: {
        color: '#3399cc',
      },
      method: {
        upi: true,        // ✅ enable UPI
        card: true,
        netbanking: true,
        wallet: true,
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
    setIsPaying(false);
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="p-6">
        <h1 className="text-xl mb-4">Rider Payment Page</h1>
        <button
          onClick={handlePayment}
          className="px-4 py-2 bg-blue-600 text-white rounded"
          disabled={isPaying}
        >
          {isPaying ? 'Processing...' : 'Pay ₹500'}
        </button>
      </div>
    </>
  );
}
