import { useState } from 'react';
import { purchaseItem } from '../api.js';

function BuyForm() {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userId.trim()) {
      setMessage({ type: 'error', text: 'Please enter a User ID' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await purchaseItem(userId.trim());
      setMessage({ 
        type: 'success', 
        text: `Purchase successful! Purchased at ${new Date(result.purchasedAt).toLocaleString()}` 
      });
      // Don't clear userId on success so user can check their purchase status
    } catch (error) {
      let errorText = 'Purchase failed';
      
      switch (error.message) {
        case 'SALE_NOT_ACTIVE':
          errorText = 'Sale is not currently active';
          break;
        case 'ALREADY_PURCHASED':
          errorText = 'You have already purchased this item';
          break;
        case 'SOLD_OUT':
          errorText = 'Sorry, this item is sold out';
          break;
        default:
          errorText = error.message || 'Purchase failed';
      }
      
      setMessage({ type: 'error', text: errorText });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-center mb-4">Purchase Item</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
            User ID
          </label>
          <input
            type="text"
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter your user ID"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
          }`}
        >
          {loading ? 'Processing...' : 'Buy Now'}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-400'
            : 'bg-red-100 text-red-700 border border-red-400'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
}

export default BuyForm;