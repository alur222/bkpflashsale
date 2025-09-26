const API_BASE = import.meta.env.VITE_API_URL;

export async function getSaleStatus() {
  const response = await fetch(`${API_BASE}/api/sale/status`);
  if (!response.ok) {
    throw new Error('Failed to fetch sale status');
  }
  return response.json();
}

export async function purchaseItem(userId) {
  const response = await fetch(`${API_BASE}/api/sale/purchase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.code || data.error || 'Purchase failed');
  }
  
  return data;
}

export async function getUserPurchase(userId) {
  const response = await fetch(`${API_BASE}/api/sale/purchase/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch purchase status');
  }
  return response.json();
}