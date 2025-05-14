'use client'

import { useUser, useClerk } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

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
    <div className="container flex text-white">
      <aside className="sidebar w-1/4 bg-gray-800 p-4 min-h-screen">
        <h2 className="text-xl font-bold mb-4">Welcome, {user.firstName || 'User'}!</h2>
      </aside>

      <main className="main-content w-3/4 bg-gray-900 p-6">
        <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

        <div className="profile-info space-y-6">
          {/* Existing profile fields... */}

          <div>
            <label className="block font-medium mb-1">Full Name:</label>
            <input
              type="text"
              value={user.fullName || ''}
              readOnly
              className="w-full bg-gray-800 p-2 rounded text-white border border-gray-600"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Email:</label>
            <input
              type="text"
              value={user.primaryEmailAddress?.emailAddress || ''}
              readOnly
              className="w-full bg-gray-800 p-2 rounded text-white border border-gray-600"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Date of Birth:</label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full bg-gray-800 p-2 rounded text-white border border-gray-600"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">User Type:</label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="w-full bg-gray-800 p-2 rounded text-white border border-gray-600"
            >
              <option value="Rider">Rider</option>
              <option value="Driver">Driver</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Home Location:</label>
            <input
              type="text"
              value={homeLocation}
              onChange={(e) => setHomeLocation(e.target.value)}
              className="w-full bg-gray-800 p-2 rounded text-white border border-gray-600"
            />
          </div>

          <button
            onClick={handleSaveChanges}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          >
            Save Changes
          </button>
        
          {/* Wallet Section */}
          <div className="wallet-section border-t border-gray-700 pt-6">
            <h2 className="text-xl font-bold mb-4">Wallet</h2>
            
            {walletError && (
              <div className="mb-4 p-3 bg-red-900 text-red-100 rounded">
                {walletError}
              </div>
            )}

            {walletBalance === null ? (
              <div className="mb-4">
                <p className="mb-2">You don't have a wallet yet.</p>
                <button
                  onClick={handleCreateWallet}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
                >
                  {isProcessing ? 'Creating...' : 'Create Wallet'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="balance-display bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-medium mb-1">Current Balance:</h3>
                  <p className="text-2xl font-bold">₹{walletBalance.toFixed(2)}</p>
                </div>

                <div className="add-money-form">
                  <h3 className="font-medium mb-2">Add Money to Wallet</h3>
                  <div className="gap-10">
                    <input
                      type="number"
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="flex-5 bg-gray-800 p-2 rounded text-white border border-gray-600"
                      min="1"
                      step="0.01"
                    />
                    <button
                      onClick={handleAddMoney}
                      disabled={isProcessing || !addAmount}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
                    >
                      {isProcessing ? 'Adding...' : 'Add Money'}
                    </button>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">Minimum amount: ₹1.00</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSaveChanges}
            className="mt-4 bg-red-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          >
            Save Changes
          </button>
        </div>
      </main>
    </div>
  )
}