// components/Car.tsx
import React from 'react';
import Image from 'next/image';
import { CarList } from '../data/Carlist'; // Import CarList instead of CarItem

type Props = {
  selectedVehicle: string | null;
  setSelectedVehicle: (type: string) => void;
  selectedPriority: string | null;
  setSelectedPriority: (type: string) => void;
}

function Car({ 
  selectedVehicle, 
  setSelectedVehicle,
  selectedPriority,
  setSelectedPriority
}: Props) {
  return (
    <div className='mt-3'>
      <h2 className='font-semibold'>Select Vehicle</h2>
      <div className='flex gap-4 mt-2'>
        {CarList.filter(item => item.type === 'VEHICLE').map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedVehicle(item.value)}
            className={`cursor-pointer p-2 rounded-lg border ${
              selectedVehicle === item.value ? 'border-blue-500' : 'border-gray-300'
            }`}
          >
            <Image
              src={item.image}
              width={75}
              height={90}
              alt={item.name}
            />
            <p className='text-center text-sm mt-1'>{item.name}</p>
          </div>
        ))}
      </div>

      <h2 className='font-semibold mt-6'>Select Priority</h2>
      <div className='flex gap-4 mt-2'>
        {CarList.filter(item => item.type === 'PRIORITY').map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedPriority(item.value)}
            className={`cursor-pointer p-2 rounded-lg border ${
              selectedPriority === item.value ? 'border-blue-500' : 'border-gray-300'
            }`}
          >
            <Image
              src={item.image}
              width={75}
              height={90}
              alt={item.name}
            />
            <p className='text-center text-sm mt-1'>{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Car;