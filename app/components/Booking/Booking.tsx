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
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Booking</h2>
      <div className="border-[1px] p-5 rounded-md" style={{ height: screenHeight }}>
        <AutocompleteAddress
          label="Where from?"
          value={fromLocation}
          onChange={setFromLocation}
        />
        <AutocompleteAddress
          label="Where to?"
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
  );
};

export default Booking;