'use client';

import { SignUp } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { clerkClient } from '@clerk/nextjs/server';

export default function SignUpPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    const storeRoleInClerk = async () => {
      const selectedRole = sessionStorage.getItem('selectedRole');

      if (isSignedIn && selectedRole && user && !user.publicMetadata.role) {
        if (isSignedIn && selectedRole && user && !user.publicMetadata?.role) {
          
          await user.update({
            unsafeMetadata: {
              role: selectedRole,
            },
          });
        }
        // Redirect after setting role
        if (selectedRole === 'rider') {
          router.push('/rider');
        } else if (selectedRole === 'driver') {
          router.push('/driver');
        }
      }
    };

    storeRoleInClerk();
  }, [isSignedIn, isLoaded, user, router]);

  return ( <div className="flex justify-center items-center h-screen bg-gray-100"><SignUp /></div>);
}




