// components/WalletBalance.tsx
'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Loader2, PlusCircle } from 'lucide-react';

export default function WalletBalance() {
  const { user } = useUser();
  const userId = user?.id;
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [addAmount, setAddAmount] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!userId) return;
      
      try {
        const res = await fetch('/api/wallet/balance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });
        const data = await res.json();
        setBalance(data.balance);
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [userId]);

  const handleAddMoney = async () => {
    if (!addAmount || isNaN(Number(addAmount))) return;
    
    setIsAdding(true);
    try {
      const amount = Number(addAmount);
      const res = await fetch('/api/wallet/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, amount }),
      });
      
      const data = await res.json();
      if (data.success) {
        setBalance(data.newBalance);
        setAddAmount('');
      }
    } catch (error) {
      console.error('Failed to add money:', error);
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Loading wallet...</span>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <h3 className="font-medium text-lg mb-2">Your Wallet</h3>
      <div className="text-2xl font-bold mb-4">
        ₹{balance?.toFixed(2) || '0.00'}
      </div>
      
      <div className="flex gap-2">
        <input
          type="number"
          value={addAmount}
          onChange={(e) => setAddAmount(e.target.value)}
          placeholder="Amount to add"
          className="border rounded px-3 py-2 flex-1"
          min="1"
        />
        <button
          onClick={handleAddMoney}
          disabled={isAdding || !addAmount}
          className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 disabled:bg-green-400"
        >
          {isAdding ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <PlusCircle className="w-4 h-4" />
          )}
          Add
        </button>
      </div>
    </div>
  );
}