'use client'

import { useUser, useClerk } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import {
  User,
  History,
  Settings,
  LocateIcon,
  Filter,
  ChevronRight,
  UserIcon,
  HistoryIcon,
  SettingsIcon
} from 'lucide-react';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const clerk = useClerk();
  const [userType, setUserType] = useState<string>('Rider');
  const [homeLocation, setHomeLocation] = useState<string>('');
  const [birthday, setBirthday] = useState<string>('');
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [addAmount, setAddAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletError, setWalletError] = useState<string>('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return
  
      try {
        // Fetch user data
        const userRes = await fetch(`/api/user/get?clerkId=${user.id}`)
        if (!userRes.ok) throw new Error('Failed to fetch user data')
        const userData = await userRes.json()
        
        if (userData.user) {
          setUserType(userData.user.role.charAt(0).toUpperCase() + userData.user.role.slice(1))
          setHomeLocation(userData.user.homeLocation || '')
          setBirthday(userData.user.birthday || '')
        }

        // Fetch wallet balance
        const walletRes = await fetch(`/api/wallet/balance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        });
        
        if (walletRes.ok) {
          const walletData = await walletRes.json();
          setWalletBalance(walletData.balance);
        } else if (walletRes.status === 404) {
          // Wallet doesn't exist yet
          setWalletBalance(null);
        } else {
          throw new Error('Failed to fetch wallet balance');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setWalletError(error instanceof Error ? error.message : 'Failed to load wallet');
      }
    }
  
    fetchUserData();
  }, [user]);

  const handleCreateWallet = async () => {
    if (!user?.id) return;
    setIsProcessing(true);
    setWalletError('');
    try {
      const res = await fetch('/api/wallet/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          initialBalance: 0
        }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setWalletBalance(data.balance);
      } else {
        throw new Error(data.error || 'Failed to create wallet');
      }
    } catch (error) {
      console.error('Wallet creation error:', error);
      setWalletError(error instanceof Error ? error.message : 'Failed to create wallet');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddMoney = async () => {
    if (!user?.id || !addAmount) return;
    setIsProcessing(true);
    setWalletError('');
    try {
      const amount = parseFloat(addAmount);
      if (isNaN(amount)) throw new Error('Invalid amount');

      const res = await fetch('/api/wallet/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          amount: amount
        }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setWalletBalance(data.newBalance);
        setAddAmount('');
      } else {
        throw new Error(data.error || 'Failed to add money');
      }
    } catch (error) {
      console.error('Add money error:', error);
      setWalletError(error instanceof Error ? error.message : 'Failed to add money');
    } finally {
      setIsProcessing(false);
    }
  };
//  useEffect(() => {
//     const fetchUserData = async () => {
//       if (!user) return
  
//       try {
//         const res = await fetch(`/api/user/get?clerkId=${user.id}`) // assumes GET route
//         if (!res.ok) throw new Error('Failed to fetch user data')
        
//         const data = await res.json()
//         if (data.user) {
//           setUserType(data.user.role.charAt(0).toUpperCase() + data.user.role.slice(1)) // e.g., "rider" → "Rider"
//           setHomeLocation(data.user.homeLocation || '')
//           setBirthday(data.user.birthday || '')
//         }
//       } catch (error) {
//         console.error('Error fetching user data:', error)
//       }
//     }
  
//     fetchUserData()
//   }, [user])
  
  const handleSaveChanges = async () => {
    if (!user) return;

    try {
      await clerk.user?.update({
        unsafeMetadata: {
          userType,
          homeLocation,
          birthday,
        },
      });

      const body = {
        clerkId: user.id,
        name: user.fullName,
        email: user.primaryEmailAddress?.emailAddress,
        phone: user.phoneNumbers?.[0]?.phoneNumber || '',
        role: userType,
        homeLocation,
        birthday,
      };

      const res = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(await res.text());

      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating Clerk metadata:', error);
      alert(`Failed to save profile changes.\n\n${error?.message || 'Unknown error'}`);
    }
  };

 
  // ... (keep your existing handleSaveChanges function)

  if (!isLoaded || !user) return <div>Loading...</div>

  return (
    <div className="flex min-h-screen bg-gray-100">
  {/* Sidebar */}
  <aside className="w-64 bg-gradient-to-b from-blue-800 to-blue-900 p-6 text-white shadow-lg">
    <div className="flex items-center space-x-3 mb-8">
      <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold">
        {user.firstName?.charAt(0) || 'U'}
      </div>
      <div>
        <h2 className="text-xl font-bold">Welcome back,</h2>
        <p className="text-blue-200">{user.firstName || 'User'}</p>
      </div>
    </div>
    
    <nav className="space-y-2">
      <button className="w-full text-left px-4 py-3 bg-blue-700 rounded-lg font-medium flex items-center">
        <UserIcon className="mr-3" />
        Profile
      </button>
      <button className="w-full text-left px-4 py-3 hover:bg-blue-700 rounded-lg font-medium flex items-center">
        <HistoryIcon className="mr-3" />
        Trip History
      </button>
      <button className="w-full text-left px-4 py-3 hover:bg-blue-700 rounded-lg font-medium flex items-center">
        <SettingsIcon className="mr-3" />
        Settings
      </button>
    </nav>
  </aside>

  {/* Main Content */}
  <main className="flex-1 p-8">
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Profile Settings</h1>
        <div className="flex space-x-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Edit Profile
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Personal Information */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Personal Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={user.fullName || ''}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="text"
                value={user.primaryEmailAddress?.emailAddress || ''}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Rider">Rider</option>
                <option value="Driver">Driver</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Home Location</label>
              <input
                type="text"
                value={homeLocation}
                onChange={(e) => setHomeLocation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Wallet Section */}
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Wallet</h2>
          
          {walletError && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              <p>{walletError}</p>
            </div>
          )}

          {walletBalance === null ? (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <p className="mb-4 text-gray-600">You don't have a wallet yet.</p>
              <button
                onClick={handleCreateWallet}
                disabled={isProcessing}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Creating...' : 'Create Wallet'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                <h3 className="text-sm font-medium text-blue-800 mb-1">CURRENT BALANCE</h3>
                <p className="text-3xl font-bold text-blue-900">₹{walletBalance.toFixed(2)}</p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Add Money</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="number"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    step="0.01"
                  />
                  <button
                    onClick={handleAddMoney}
                    disabled={isProcessing || !addAmount}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Processing...' : 'Add Money'}
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-500">Minimum amount: ₹1.00</p>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="p-6 bg-gray-50 border-t">
          <button
            onClick={handleSaveChanges}
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </main>
</div>
  )
}