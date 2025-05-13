// data/CarList.ts
export interface CarItem {
  id: number;
  name: string;
  image: string;
  type: 'VEHICLE' | 'PRIORITY';
  value: string; // Will match your enum values
}

export const CarList: CarItem[] = [
  // Vehicle Types
  {
    id: 1,
    name: "Bike",
    image: "/bike.jpg",
    type: "VEHICLE",
    value: "BIKE"
  },
  {
    id: 2,
    name: "Auto",
    image: "/auto.jpg",
    type: "VEHICLE",
    value: "AUTO"
  },
  {
    id: 3,
    name: "Car",
    image: "/2.jpg", 
    type: "VEHICLE",
    value: "CAR"
  },
  // Priority Types
  {
    id: 4,
    name: "Least Time",
    image: "/Least.jpg",
    type: "PRIORITY",
    value: "LEAST_TIME"
  },
  {
    id: 5,
    name: "High Rating",
    image: "/High.jpg",
    type: "PRIORITY",
    value: "HIGH_RATING"
  }
];