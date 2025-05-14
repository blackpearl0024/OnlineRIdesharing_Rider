
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
  const [balance, setBalance] = useState<number | null>(null);
  const { user } = useUser();
  const D_name = user?.fullName || '';
  const D_email = user?.emailAddresses?.[0]?.emailAddress || '';
  const D_phone = user?.phoneNumbers?.[0]?.phoneNumber || '';
  const D_id = user?.id || '';

  // Check wallet balance on component mount
  useEffect(() => {
    const checkBalance = async () => {
      try {
        console.log("inside payment ")
        const res = await fetch('/api/wallet/balance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: D_id }),
        });
        
        const data = await res.json();
        console.log("data received:",data)

        setBalance(data.balance);
      } catch (error) {
        console.error('Failed to check balance:', error);
      }
    };

    if (D_id) checkBalance();
  }, [D_id]);

  const handlePayment = async () => {
    if (balance !== null && balance < fare) {
      alert('Insufficient balance in your wallet. Please add money first.');
      return;
    }

    setIsPaying(true);
    try {
      // First deduct from wallet
       console.log("inside payment ")
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
    const deductData = await deductRes.json();
    console.log("Deduction response:", deductData);

    if (!deductRes.ok) {
      throw new Error(deductData.error || 'Deduction failed');
    }

    // 2. Verify the deduction actually happened
    const verifyRes = await fetch('/api/wallet/balance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: D_id }),
        });
    const verifyData = await verifyRes.json();
    console.log("Verified balance:", verifyData.balance);

    // if (Math.abs(verifyData.balance - (balance! - fare)) > 0.01) {
    //   throw new Error('Balance verification failed');
    // }

      if (!deductRes.ok) {
        const errorData = await deductRes.json();
        throw new Error(errorData.error || 'Deduction failed');
      }

      // Then add to driver's wallet
      const addRes = await fetch('/api/wallet/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: "user_123",
          amount: fare,
        }),
      });

      if (!addRes.ok) {
        // If adding to driver fails, refund the rider
        await fetch('/api/wallet/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: "user_123",
            amount: fare,
          }),
        });
        throw new Error('Failed to complete payment to driver');
      }

      // Create payment record
      const paymentRes = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fare,
          driverId:"user_123",
          driverName:"gopal",
          riderId: D_id,
          riderName: D_name,
          status: 'success',
        }),
      });

      if (!paymentRes.ok) {
        throw new Error('Failed to create payment record');
      }

      // Notify driver via WebSocket
      if (stompClient && stompClient.connected) {
        stompClient.publish({
          destination: '/app/paymentReceived',
          body: JSON.stringify({
            amount: fare,
            driverId,
            riderId: D_id,
          }),
        });
      }

      onSuccess();
      setBalance(prev => (prev !== null ? prev - fare : null));
    } catch (error) {
      console.error('Payment error:', error);
      alert(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="flex flex-col gap-2">
        {balance !== null && (
          <div className="text-sm text-gray-600">
            Wallet Balance: ₹{balance.toFixed(2)}
            {balance < fare && (
              <span className="text-red-500 ml-2">(Insufficient balance)</span>
            )}
          </div>
        )}
        <button
          onClick={handlePayment}
          className={`px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${className}`}
          disabled={isPaying || (balance !== null && balance < fare)}
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
      </div>
    </>
  );
}