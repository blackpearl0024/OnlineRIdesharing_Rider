import React from 'react';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function NavBar() {
  return (
   <header className="bg-white shadow-sm w-full h-auto">

      <div className="p-3 px-10 flex justify-between items-center">
        <nav className="flex items-center space-x-1">
          <Link 
            className="text-gray-700 font-medium rounded-md px-4 py-2 transition-all hover:bg-gray-100 hover:text-blue-600" 
            href="/"
          >
            Home
          </Link>
          <Link 
            className="text-gray-700 font-medium rounded-md px-4 py-2 transition-all hover:bg-gray-100 hover:text-blue-600" 
            href="/profile"
          >
            Profile
          </Link>
          <Link 
            className="text-gray-700 font-medium rounded-md px-4 py-2 transition-all hover:bg-gray-100 hover:text-blue-600" 
            href="/history"
          >
            History
          </Link>
        </nav>
        <div className="flex items-center">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}