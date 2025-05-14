'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import * as StompJs from '@stomp/stompjs';

const MapView = dynamic(() => import('../components/Booking/MapView'), { ssr: false });
import Booking from '../components/Booking/Booking';
import SearchingView from '../components/Booking/SearchingView';
import DriverInfo from '../components/Booking/DriverInfo';
import RatingView from '../components/Booking/RatingView';
import Car from '../components/Booking/Car';
import { useUser } from '@clerk/nextjs';
  type FareBreakdown = {
  baseFare: number;
  distanceCost: number;
  timeCost: number;
  peakMultiplier: number;
  zoneMultiplier: number;
  totalFare: number;
};
export default function Home() {

const [fareOutput, setFareOutput] = useState<FareBreakdown | null>(null);

  const [fromLocation, setFromLocation] = useState({ lat: null, lon: null, name: '' });
  const [toLocation, setToLocation] = useState({ lat: null, lon: null, name: '' });
  const [messages, setMessages] = useState<string[]>([]);
  const [rideStarted, setRideStarted] = useState(false);
  const [input, setInput] = useState('');

  const [uiStep, setUiStep] = useState<'booking' | 'searching' | 'driverInfo' | 'rating'>('booking');
const [driverName, setDriverName] = useState('');
const [driverId, setDriverId] = useState('');
const [fare, setFare] = useState(0);
const [selectedCarType, setSelectedCarType] = useState<string | null>(null);

const [driverLocation, setDriverLocation] = useState<{ lat: number | null, lon: number | null }>(
  { lat: null, lon: null }
);

    const [Distance, setDistance] = useState<string>('');
  const [Duration, setDuration] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);


   const { user } = useUser()
   const D_name = user?.fullName ||'';
const D_id = user?.id;

 const [vehicleNumber, setVehicleNumber] = useState<string>('');
  const [rating, setrating] =useState<number>(0);
 
  const stompClientRef = useRef<StompJs.Client | null>(null);

  const sendObj = (destination: string, data: any) => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      const toSend = typeof data === 'string' ? data : JSON.stringify(data);
      stompClientRef.current.publish({
        destination,
        body: toSend,
      });
    } else {
      console.warn("STOMP client not connected.");
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return
  
      try {
        const res = await fetch(`/api/user/get?clerkId=${user.id}`) // assumes GET route
        if (!res.ok) throw new Error('Failed to fetch user data')
        
        const data = await res.json()
        if (data.user) {
         setVehicleNumber(data.user.vehicleNumber || '') // e.g., "rider" → "Rider"
          setrating(data.user.rating || '')
          
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }
  
    fetchUserData()
  }, [user])
  useEffect(() => {
   console.log(rideStarted)
  console.log('Selected Vehicle:', selectedVehicle);
          console.log('Selected Priority:', selectedPriority);
   
  }, [selectedVehicle,selectedPriority]);

  useEffect(() => {
   console.log(rideStarted)
  
   
  }, [rideStarted]);
  useEffect(() => {
    const client = new StompJs.Client({
      brokerURL: 'ws://localhost:9090/gs-guide-websocket', // Same as your Spring endpoint
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('STOMP Connected');

        // Send rider identity or auth if needed
        // sendObj('/app/rider/init', { name: 'Imayavaramban', role: 'RIDER', id: 'R001' });

        // // Subscribe to messages from backend
        // client.subscribe('/topic/greetings', (message) => {
        //   const msg = message.body;
        //   console.log("message",message.body)
        //   setMessages(prev => [...prev, msg]);
        //   if (msg.includes('accepted')) setRideStarted(true);
        // });

        client.subscribe('/topic/greetings', (message) => {
          try {
            const data = JSON.parse(message.body);
            let infoText =null;
            // Logging raw driver info
            if (data.driverInfo) {
              const infoText = data.driverInfo || '';
              console.log("Driver Info:", infoText);
            
              const nameMatch = infoText.match(/Driver matched: (.*?)(,|$)/);
              const name_d = nameMatch?.[1] || 'Unknown';

               const IDMatch = infoText.match(/DriverId:\s*(\S+)(?=\s+Fare)/);

              const ID_d = IDMatch?.[1] || 'Unknown';
            
              const fareMatch = infoText.match(/Fare: \$([0-9.]+)/);
              const fare_t = parseFloat(fareMatch?.[1] || '0');
            
              const driverLocMatch = infoText.match(/Latitude:\s*([0-9.]+),\s*Longitude:\s*([0-9.]+)/);
              if (driverLocMatch) {
                const lat = parseFloat(driverLocMatch[1]);
                const lon = parseFloat(driverLocMatch[2]);
                setDriverLocation({ lat, lon }); // ✅ NEW
              }
            setDriverId(ID_d)
              setDriverName(name_d);
              setFare(fare_t);
            }
            
        
            // When ride has started
            if (data.rideStatus === 'Driver accepted the ride. Trip started.') {
              console.log("Driver Info:", data.driverInfo);
              setRideStarted(true);
        
              
              setUiStep('driverInfo'); // Show driver info UI
            }
        
            // Log any other messages
            if (data.message) {
              console.log("Message:", data.message);
              if(data.message ==='Ride ended' )
              {
                setUiStep('rating');
              }
            }
        
          } catch (error) {
            console.error("Failed to parse message:", error);
          }
        });
        
        client.subscribe('/topic/FareBill', (message) => {
  try {
    const data = JSON.parse(message.body);
    let infoText = null;

    // If server sends the object directly, no need to parse string
    if (data) {
      const totalFare = data.totalFare ?? 'Unknown';
      const baseFare = data.baseFare ?? 'Unknown';
      const distanceCost = data.distanceCost ?? 'Unknown';
      const timeCost = data.timeCost ?? 'Unknown';
      const peakMultiplier = data.peakMultiplier ?? 'Unknown';
      const zoneMultiplier = data.zoneMultiplier ?? 'Unknown';

      console.log("Fare Breakdown:");
      console.log("Base Fare:", baseFare);
      console.log("Distance Cost:", distanceCost);
      console.log("Time Cost:", timeCost);
      console.log("Peak Multiplier:", peakMultiplier);
      console.log("Zone Multiplier:", zoneMultiplier);
      console.log("Total Fare:", totalFare);

      // Example usage
      const fareString = `Total Fare: ₹${totalFare}`;
      setFareOutput(data); // Suppose you store it in React state
    }

  } catch (err) {
    console.error("Failed to parse message body:", err);
  }
});

        
      },
      onDisconnect: () => {
        console.log('Disconnected');
      },
      onStompError: (frame) => {
        console.error('Broker error: ', frame.headers['message']);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, []);

  const handleCreateTrip = () => {
    console.log("button is pressed")
    console.log("fromlat:" + fromLocation.lat +
      "fromlon:" + fromLocation.lon,)
    setUiStep('searching'); // ⬅️ Show searching view after button press
    sendObj('/app/createTrip', {
      
     name: D_name,
      id:D_id ,
      fromlat: fromLocation.lat,
      fromlon: fromLocation.lon,
      tolat: toLocation.lat,
      tolon:toLocation.lon,
distance: parseFloat(Distance),
duration: parseFloat(Duration) ,
      preference: selectedPriority,
      Vehiclepreference:selectedVehicle,
    });
  };

  const endRide = () => {
    sendObj('/app/endTrip', { id: 'R001' });
    setRideStarted(false);
     // ⬅️ Show rating view
  };
  
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 text-black">
      <div className="bg-blue-100 p-4">
        {uiStep === 'booking' && (
          <>
            {/* <Booking
              fromLocation={fromLocation}
              toLocation={toLocation}
              setFromLocation={setFromLocation}
              setToLocation={setToLocation}
            /> */}
              <Booking
        fromLocation={fromLocation}
        toLocation={toLocation}
        setFromLocation={setFromLocation}
        setToLocation={setToLocation}
        selectedVehicle={selectedVehicle}
        setSelectedVehicle={setSelectedVehicle}
        selectedPriority={selectedPriority}
        setSelectedPriority={setSelectedPriority}
      />
            

            <button
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              onClick={handleCreateTrip}
            >
              Create Trip
            </button>
          </>
        )}

        {uiStep === 'searching' && <SearchingView />}

        {uiStep === 'driverInfo' && fareOutput&&(
          <DriverInfo 
            name={driverName} 
            fare={fare} 
            fareBreakdown={fareOutput}
            vehicleNumber={vehicleNumber}
            rating={rating}
            stompClient={stompClientRef.current}
          />
         
        )}
        {uiStep === 'rating' && (
          <RatingView
            name={driverName}
             driverId={driverId}
            stompClient={stompClientRef.current}
            defaultValue={0}
            onChange={(rating) => {
              console.log("Rated:", rating);
              // Optional: move to next step or update UI
            }}
          />
        )}


        {/* Message log section - Optional */}
        <div className="bg-gray-100 mt-4 p-4 rounded shadow max-w-xl">
          <h2 className="font-bold mb-2">Messages:</h2>
          {messages.map((msg, i) => (
            <div key={i} className="text-sm border-b py-1">{msg}</div>
          ))}
        </div>
</div>

        <div className="col-span-2 bg-red-100 order-first md:order-last text-black">
          <MapView
            fromLocation={fromLocation}
            toLocation={toLocation}
            onFromDrag={setFromLocation}
            onToDrag={setToLocation}
            onInitFromLocation={setFromLocation}
            driverLocation={driverLocation}
            rideStarted={rideStarted}
            setRideStarted={setRideStarted}
            setDistance={setDistance}
            setDuration={setDuration}
          />
        </div>
      </div>
    </div>
  );
}
