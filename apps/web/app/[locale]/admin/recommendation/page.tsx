'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Recommendation {
  item_id: string;
  name: string;
  category: string;
  price: number;
  predicted_score: number;
}

interface RecommendationResult {
  email: string;
  recommendations: Recommendation[];
  error?: string;
}

export default function RecommendationDashboard() {
  const [email, setEmail] = useState('customer2@example.com');
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRecommend = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, top_n: 3 }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: 'Failed to connect to API', email: '', recommendations: [] } as any);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'baggage': return '🧳';
      case 'meal': return '🍱';
      case 'lounge': return '🛋️';
      case 'insurance': return '🛡️';
      default: return '🎁';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-4xl">✨</span> Ancillary Recommendation
          </h1>
          <p className="text-gray-500 mt-2">Suggest add-ons (baggage, meals, lounge) to customers based on their history.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="customer@example.com"
            />
          </div>
          <button 
            onClick={handleRecommend} 
            disabled={loading || !email}
            className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : '✨ Get Recommendations'}
          </button>
        </div>

        {result && !loading && (
          result.error ? (
            <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-200">
              <h3 className="text-xl font-bold mb-2">Error</h3>
              <p>{result.error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Top Add-ons for {result.email}
              </h2>
              
              {result.recommendations.map((rec, index) => (
                <div key={rec.item_id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl bg-gray-50 w-16 h-16 flex items-center justify-center rounded-xl">
                      {getCategoryIcon(rec.category)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{rec.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{rec.category}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600 mb-1">₹{rec.price.toLocaleString()}</p>
                    <span className="inline-block bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
                      {(rec.predicted_score * 100).toFixed(1)}% Match
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        <div className="mt-8">
          <Link href="/in" className="text-blue-600 hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
