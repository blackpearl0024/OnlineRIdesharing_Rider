'use client';

import { useEffect, useState } from 'react';
import AutocompleteAddress from './AutocompleteAddress';
import Car from './Car';



const Booking = ({
  fromLocation,
  toLocation,
  setFromLocation,
  setToLocation,
  selectedCarType,
  setSelectedCarType,
}: any) => {
  const [screenHeight, setScreenHeight] = useState(0);

  useEffect(() => {
    // This code runs only in the browser
    setScreenHeight(window.innerHeight);
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
        <Car selectedType={selectedCarType} setSelectedType={setSelectedCarType} />
      </div>
    </div>
  );
};

export default Booking;
