'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ForecastResult {
  route: string;
  targetDate: string;
  predictedBookings: number;
  confidence: string;
  recentAverage: number;
}

export default function DemandForecastDashboard() {
  const [route, setRoute] = useState('DEL-BOM');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [result, setResult] = useState<ForecastResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const routes = [
    'DEL-BOM', 'BOM-DEL', 'DEL-NRT', 'NRT-DEL', 
    'DEL-DXB', 'DXB-DEL', 'BOM-LHR', 'DEL-FRA'
  ];

  const handleForecast = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/demand/forecast?route=${route}&date=${date}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch forecast');
      
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-4xl">📊</span> Demand Forecasting
          </h1>
          <p className="text-gray-500 mt-2">Predict future bookings for any route using our ML model.</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Route</label>
              <select 
                value={route} 
                onChange={(e) => setRoute(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {routes.map(r => <option key={r} value={r}>{r.replace('-', ' → ')}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <button 
              onClick={handleForecast} 
              disabled={loading}
              className="bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Predicting...
                </>
              ) : (
                <>🔮 Predict Demand</>
              )}
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            ❌ {error}
          </div>
        )}

        {/* Result Card */}
        {result && !loading && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <h2 className="text-xl font-bold">Forecast for {result.route}</h2>
              <p className="text-blue-100">{result.targetDate}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
              
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Predicted Bookings</p>
                <p className="text-6xl font-black text-gray-800">{result.predictedBookings}</p>
                <div className="mt-3 inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {result.confidence === 'high' ? 'High Confidence' : 'Low Confidence'}
                </div>
              </div>

              <div className="border-l pl-8">
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Recent Average</p>
                <p className="text-4xl font-bold text-gray-400">{result.recentAverage}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {result.predictedBookings > result.recentAverage 
                    ? `📈 Forecast is ${Math.round(((result.predictedBookings - result.recentAverage) / result.recentAverage) * 100)}% higher than recent average.`
                    : `📉 Forecast is ${Math.round(((result.recentAverage - result.predictedBookings) / result.recentAverage) * 100)}% lower than recent average.`}
                </p>
              </div>

            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8">
          <Link href="/in" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
        
      </div>
    </div>
  );
}
