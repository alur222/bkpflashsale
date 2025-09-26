import { useState } from 'react';
import { getUserPurchase } from '../api.js';

function MyPurchase() {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [purchaseData, setPurchaseData] = useState(null);
  const [error, setError] = useState(null);

  const handleCheck = async (e) => {
    e.preventDefault();
    
    if (!userId.trim()) {
      setError('Please enter a User ID');
      return;
    }

    setLoading(true);
    setError(null);
    setPurchaseData(null);

    try {
      const data = await getUserPurchase(userId.trim());
      setPurchaseData(data);
    } catch (err) {
      setError(err.message || 'Failed to check purchase status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-bold text-center mb-4">Check My Purchase</h2>
      
      <form onSubmit={handleCheck} className="space-y-4">
        <div>
          <label htmlFor="checkUserId" className="block text-sm font-medium text-gray-700 mb-2">
            User ID
          </label>
          <input
            type="text"
            id="checkUserId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter your user ID"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={loading}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md font-medium text-white transition-colors ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500'
          }`}
        >
          {loading ? 'Checking...' : 'Check Status'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 rounded bg-red-100 text-red-700 border border-red-400">
          {error}
        </div>
      )}

      {purchaseData && (
        <div className="mt-4 p-4 rounded bg-gray-50 border border-gray-200">
          {purchaseData.purchased ? (
            <div className="text-center">
              <div className="mb-2">
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  ✓ Purchased
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Purchased at: {new Date(purchaseData.at).toLocaleString()}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <span className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                Not Purchased
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MyPurchase;