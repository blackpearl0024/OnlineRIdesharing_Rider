import React from 'react'
import Image from 'next/image'
import CarList from '../data/Carlist'

type Props = {
  selectedType: string | null;
  setSelectedType: (type: string) => void;
}

function Car({ selectedType, setSelectedType }: Props) {
    return (
      <div className='mt-3'>
        <h2 className='font-semibold'>Select Car</h2>
        <div className='flex gap-4 mt-2'>
          {CarList.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedType(item.name)}
              className={`cursor-pointer p-2 rounded-lg border ${selectedType === item.name ? 'border-blue-500' : 'border-gray-300'}`}
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
