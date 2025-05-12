'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push('/sign-in'); // fallback
      return;
    }

    const role = user?.publicMetadata?.role;

    if (role === 'rider') {
      router.push('/rider');
    } else if (role === 'driver') {
      router.push('/driver');
    } else {
      // 🚨 No role stored → user is new or role missing → ask role
      router.push('/select-role');
    }
  }, [isLoaded, isSignedIn, user, router]);

  return <p className="p-6">Checking role...</p>;
}
