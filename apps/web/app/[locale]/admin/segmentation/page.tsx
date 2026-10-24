'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SegmentResult {
  email: string;
  segment_id: number;
  segment_name: string;
  recency: number;
  frequency: number;
  monetary: number;
  recommendation: string;
  error?: string;
}

export default function SegmentationDashboard() {
  const [email, setEmail] = useState('customer2@example.com'); // Default email from our generated data
  const [result, setResult] = useState<SegmentResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/segmentation/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: 'Failed to connect to API' } as any);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-4xl">🎯</span> Customer Segmentation
          </h1>
          <p className="text-gray-500 mt-2">Identify customer personas and get marketing recommendations using K-Means clustering.</p>
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
            onClick={handleAnalyze} 
            disabled={loading || !email}
            className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : '🔍 Analyze Customer'}
          </button>
        </div>

        {result && !loading && (
          result.error ? (
            <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-200">
              <h3 className="text-xl font-bold mb-2">Error</h3>
              <p>{result.error}</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                <h2 className="text-xl font-bold">Customer Profile</h2>
                <p className="text-indigo-100">{result.email}</p>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-3 gap-6 mb-8 text-center">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Recency</p>
                    <p className="text-2xl font-bold">{result.recency} <span className="text-sm font-normal text-gray-400">days</span></p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Frequency</p>
                    <p className="text-2xl font-bold">{result.frequency} <span className="text-sm font-normal text-gray-400">bookings</span></p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Monetary</p>
                    <p className="text-2xl font-bold">₹{result.monetary.toLocaleString()}</p>
                  </div>
                </div>

                <div className="border-t pt-8 text-center">
                  <p className="text-sm text-gray-500 uppercase tracking-widest mb-2">Identified Segment</p>
                  <h3 className="text-4xl font-black text-indigo-600 mb-4">{result.segment_name}</h3>
                  
                  <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl mt-6 inline-block text-left w-full">
                    <p className="font-semibold text-blue-800 mb-1">💡 Marketing Recommendation:</p>
                    <p className="text-blue-700">{result.recommendation}</p>
                  </div>
                </div>
              </div>
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
