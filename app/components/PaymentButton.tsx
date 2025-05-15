'use client';
import Script from 'next/script';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import * as StompJs from '@stomp/stompjs';
import { Loader2, CreditCard } from 'lucide-react';

type PaymentButtonProps = {

  fare: number;
  stompClient: StompJs.Client | null;
  onSuccess: () => void;
  driverId: string;
  driverName: string;
  className?: string;
};

export default function PaymentButton({
  fare,
  stompClient,
  onSuccess,
  driverId,
  driverName,
  className = '',
}: PaymentButtonProps) {
  const [isPaying, setIsPaying] = useState(false);
  const { user } = useUser();
  const D_name = user?.fullName || '';
  const D_email = user?.emailAddresses?.[0]?.emailAddress || '';
  const D_phone = user?.phoneNumbers?.[0]?.phoneNumber || '';
  const D_id = user?.id || '';

  const handlePayment = async () => {
    setIsPaying(true);
    
    try {
      // 1. First create Razorpay order
      const orderRes = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fare,
           driverId:driverId,
          driverName:driverName,
          riderId: D_id,
          riderName: D_name,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create payment order');

      // 2. Show Razorpay UI
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: fare * 100,
        currency: 'INR',
        name: 'Ride Payment',
        description: `Payment for ride with ${driverName}`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            // 3. Verify payment on server
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                fare,
                 driverId:driverId,
          driverName:driverName,
                riderId: D_id,
                riderName: D_name,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || 'Payment verification failed');

            // 4. Deduct from rider's wallet (now that real money was received)
            const deductRes = await fetch('/api/wallet/deduct', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: D_id,
                amount: fare,
              }),
            });

            if (!deductRes.ok) throw new Error('Failed to deduct from wallet');

            // 5. Add to driver's wallet
            const addRes = await fetch('/api/wallet/add', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
               
              body: JSON.stringify({
                userId:driverId,
                amount: fare,
              }),
            });

            if (!addRes.ok) throw new Error('Failed to add to driver wallet');

            // 6. Create payment record
            await fetch('/api/payment/record', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                fare,
               driverId:driverId,
          driverName:driverName,
                riderId: D_id,
                riderName: D_name,
                status: 'completed',
                paymentMethod: 'razorpay',
                transactionId: response.razorpay_payment_id,
              }),
            });

            // 7. Notify driver
            if (stompClient && stompClient.connected) {
              stompClient.publish({
                destination: '/app/paymentReceived',
                body: JSON.stringify({
                  amount: fare,
                  driverId:driverName,
                  riderId: D_id,
                }),
              });
            }

            onSuccess();
          } catch (error) {
            console.error('Post-payment processing error:', error);
            alert(error instanceof Error ? error.message : 'Payment processing failed');
          }
        },
        prefill: {
          name: D_name,
          email: D_email,
          contact: D_phone,
        },
        theme: {
          color: '#3399cc',
        },
        modal: {
          ondismiss: () => {
            setIsPaying(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert(error instanceof Error ? error.message : 'Payment failed');
      setIsPaying(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <button
        onClick={handlePayment}
        className={`px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${className}`}
        disabled={isPaying}
      >
        {isPaying ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Pay ₹{fare.toFixed(2)}
          </>
        )}
      </button>
    </>
  );
}