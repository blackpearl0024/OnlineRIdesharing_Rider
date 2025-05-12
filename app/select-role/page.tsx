'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SelectRolePage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [role, setRole] = useState('rider');
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      const existingRole = user.unsafeMetadata?.role;

      if (existingRole === 'rider') {
        router.push('/rider');
      } else if (existingRole === 'driver') {
        router.push('/driver');
      }
    }
  }, [isLoaded, isSignedIn, user, router]);

  const handleContinue = () => {
    sessionStorage.setItem('selectedRole', role);
    console.log(role);
    console.log("signup is called");
    router.push('/sign-up');
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Choose Your Role</h1>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="border p-2"
      >
        <option value="rider">Rider</option>
        <option value="driver">Driver</option>
      </select>
      <button
        onClick={handleContinue}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Continue to Sign Up
      </button>
    </div>
  );
}
