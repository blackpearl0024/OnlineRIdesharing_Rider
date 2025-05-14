// components/Booking/DriverInfo.tsx
import * as StompJs from '@stomp/stompjs';
import { useState } from 'react';
import PaymentButton from '../PaymentButton';
import { CheckCircle, Clock, AlertCircle, CreditCard, User, Car } from 'lucide-react';
type FareBreakdown = {
  baseFare: number;
  distanceCost: number;
  timeCost: number;
  peakMultiplier: number;
  zoneMultiplier: number;
  totalFare: number;
};


type DriverInfoProps = {
  name: string;
    fareBreakdown: FareBreakdown;
  fare: number;
  vehicleNumber?: string;
  rating?: number;
  stompClient: StompJs.Client | null;
};

export default function DriverInfo({ name,fareBreakdown, fare, vehicleNumber, rating = 4.5, stompClient }: DriverInfoProps) {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed'>('pending');
  const [tripStatus, setTripStatus] = useState<'ongoing' | 'completed'>('ongoing');

  const onEndRide = () => {
    console.log("End button pressed");
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: '/app/endTrip',
        body: JSON.stringify({}),
      });
      setTripStatus('completed');
    } else {
      console.warn('STOMP client not connected.');
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentStatus('completed');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-md mx-auto">
      {/* Header */}
      <div className="bg-indigo-600 p-4 text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Car className="w-5 h-5" /> Ride Details
        </h2>
      </div>

      {/* Driver Info */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-indigo-100 p-2 rounded-full">
            <User className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold">{name}</h3>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <span className="text-yellow-500">★ {rating}</span>
              {vehicleNumber && <span>• {vehicleNumber}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Trip Status */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          {tripStatus === 'ongoing' ? (
            <>
              <Clock className="w-5 h-5 text-yellow-500" />
              <span className="font-medium">Trip in progress</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium">Trip completed</span>
            </>
          )}
        </div>
      </div>

      {/* Fare Details */}
       <div className="p-4 border-b">
      <h3 className="font-semibold mb-2">Fare Breakdown</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Base fare</span>
          <span>₹{fareBreakdown.baseFare.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Distance</span>
          <span>₹{fareBreakdown.distanceCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Time</span>
          <span>₹{fareBreakdown.timeCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Peak Multiplier</span>
          <span>x{fareBreakdown.peakMultiplier.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Zone Multiplier</span>
          <span>x{fareBreakdown.zoneMultiplier.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold border-t pt-2 mt-2">
          <span>Total</span>
          <span>₹{fareBreakdown.totalFare.toFixed(2)}</span>
        </div>
      </div>
    </div>

      {/* Payment Status */}
      {tripStatus === 'completed' && (
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            {paymentStatus === 'pending' ? (
              <>
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <span className="font-medium">Payment pending</span>
              </>
            ) : paymentStatus === 'processing' ? (
              <>
                <Clock className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Payment processing</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium">Payment completed</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-4 flex flex-col gap-3">
        {tripStatus === 'ongoing' ? (
          <button
            onClick={onEndRide}
            className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            End Trip
          </button>
        ) : paymentStatus !== 'completed' ? (
          <PaymentButton //add driver id and name
            fare={fare} 
            stompClient={stompClient} 
            onSuccess={handlePaymentSuccess}
            className="w-full"
          />
        ) : (
          <div className="text-center py-4">
            <p className="text-green-600 font-medium flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" /> Payment successful!
            </p>
            <p className="text-sm text-gray-600 mt-1">Receipt sent to your email</p>
          </div>
        )}
      </div>
    </div>
  );
}