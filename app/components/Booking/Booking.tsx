// components/Booking.tsx
'use client';

import { useEffect, useState } from 'react';
import AutocompleteAddress from './AutocompleteAddress';
import Car from './Car';

const Booking = ({
  fromLocation,
  toLocation,
  setFromLocation,
  setToLocation,
  selectedVehicle,
  setSelectedVehicle,
  selectedPriority,
  setSelectedPriority,
}: {
  fromLocation: any;
  toLocation: any;
  setFromLocation: (location: any) => void;
  setToLocation: (location: any) => void;
  selectedVehicle: string | null;
  setSelectedVehicle: (type: string) => void;
  selectedPriority: string | null;
  setSelectedPriority: (type: string) => void;
}) => {
  const [screenHeight, setScreenHeight] = useState(0);

  useEffect(() => {
    setScreenHeight(window.innerHeight * 0.7);
  }, []);

  return (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-800">Book Your Ride</h2>
    <div className="border border-gray-200 p-6 rounded-lg bg-white shadow-sm">
      <div className="space-y-4">
        <AutocompleteAddress
          label="Pickup Location"
          value={fromLocation}
          onChange={setFromLocation}
        />
        <AutocompleteAddress
          label="Destination"
          value={toLocation}
          onChange={setToLocation}
        />
        <Car 
          selectedVehicle={selectedVehicle}
          setSelectedVehicle={setSelectedVehicle}
          selectedPriority={selectedPriority}
          setSelectedPriority={setSelectedPriority}
        />
      </div>
    </div>
  </div>
);
};

export default Booking;