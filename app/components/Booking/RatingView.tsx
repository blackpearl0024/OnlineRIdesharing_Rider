import { useState } from 'react';

interface RatingViewProps {
  defaultValue?: number;
  onChange?: (rating: number) => void;
  name?: string;
   driverId?: string;
  stompClient?: any;
}

export default function RatingView({
  defaultValue = 0,
  onChange,
  name,
  driverId,
  stompClient,
}: RatingViewProps) {
  const [rating, setRating] = useState(defaultValue);
  const [submitted, setSubmitted] = useState(false);

  const handleClick = (index: number) => {
    setRating(index);
  };

  const handleSubmit = () => {
    if (!rating || !stompClient) return;
console.log("rating button pressed")
    const payload = {
      rideId: driverId, // Replace with actual ride ID if available
      rating: rating,
    };

    stompClient.publish({
      destination: '/app/rate',
      body: JSON.stringify(payload),
    });
     stompClient.publish({
      destination: '/app/Rating_Trip',
      body: JSON.stringify(payload),
    });
    console.log()
    onChange?.(rating);
    setSubmitted(true);
  };

  
  return (
    <div className="p-4 text-center">
      <h2 className="text-2xl font-bold mb-4">⭐ Rate Your Ride with {name}</h2>
      <div className="flex justify-center gap-2 text-5xl cursor-pointer mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => handleClick(star)}
            className={star <= rating ? 'text-yellow-500' : 'text-gray-300'}
          >
            ★
          </span>
        ))}
      </div>
      {!submitted ? (
        <button
          onClick={handleSubmit}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-xl text-lg shadow-md"
        >
          Submit Rating
        </button>
      ) : (
        <p className="text-green-600 font-semibold text-lg">Thank you for rating!</p>
      )}
    </div>
  );
}
