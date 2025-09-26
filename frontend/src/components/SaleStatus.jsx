import { useState, useEffect } from 'react';
import { getSaleStatus } from '../api.js';

function SaleStatus() {
  const [status, setStatus] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Poll every 2 seconds
    const fetchStatus = async () => {
      try {
        const data = await getSaleStatus();
        setStatus(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchStatus(); // Initial fetch
    const interval = setInterval(fetchStatus, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!status) return;

    // Update countdown every second
    const updateCountdown = () => {
      const now = new Date();
      let targetTime;
      
      if (status.status === 'upcoming') {
        targetTime = new Date(status.startsAt);
      } else if (status.status === 'active') {
        targetTime = new Date(status.endsAt);
      } else {
        setTimeLeft('');
        return;
      }

      const timeDiff = targetTime - now;
      
      if (timeDiff <= 0) {
        setTimeLeft('');
        return;
      }

      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown(); // Initial update
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [status]);

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  if (!status) {
    return (
      <div className="bg-gray-100 text-gray-600 px-4 py-3 rounded">
        Loading...
      </div>
    );
  }

  const getStatusDisplay = () => {
    switch (status.status) {
      case 'upcoming':
        return (
          <div className="text-center">
            <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
              Upcoming
            </span>
            <p className="text-lg font-mono">{timeLeft}</p>
            <p className="text-sm text-gray-600">until sale starts</p>
          </div>
        );
      case 'active':
        return (
          <div className="text-center">
            <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
              Active
            </span>
            <p className="text-lg font-bold">{status.remaining} remaining</p>
            {timeLeft && <p className="text-sm text-gray-600">{timeLeft} left</p>}
          </div>
        );
      case 'ended':
        return (
          <div className="text-center">
            <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
              Ended
            </span>
          </div>
        );
      case 'sold_out':
        return (
          <div className="text-center">
            <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
              Sold Out
            </span>
          </div>
        );
      default:
        return (
          <div className="text-center">
            <span className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
              Unknown
            </span>
          </div>
        );
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <h2 className="text-xl font-bold text-center mb-4">Sale Status</h2>
      {getStatusDisplay()}
    </div>
  );
}

export default SaleStatus;