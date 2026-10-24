'use client';

import { useState } from 'react';
import Link from 'next/link';

interface AnomalyResult {
  is_anomaly: boolean;
  anomaly_score: number;
  status: string;
  error?: string;
}

export default function AnomalyDashboard() {
  const [metrics, setMetrics] = useState({
    cpuUsage: 45,
    memoryUsage: 60,
    latency: 120,
    errorRate: 0.5,
  });
  const [result, setResult] = useState<AnomalyResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMetrics(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/anomaly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics),
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
            <span className="text-4xl">📈</span> System Anomaly Detection
          </h1>
          <p className="text-gray-500 mt-2">Monitor system health and detect anomalies using Isolation Forest.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Sliders Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">System Metrics</h2>
            
            <div className="space-y-6">
              <div>
                <label className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>CPU Usage (%)</span>
                  <span className="font-bold text-blue-600">{metrics.cpuUsage}%</span>
                </label>
                <input type="range" name="cpuUsage" min="0" max="100" value={metrics.cpuUsage} onChange={handleChange} className="w-full" />
              </div>

              <div>
                <label className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Memory Usage (%)</span>
                  <span className="font-bold text-blue-600">{metrics.memoryUsage}%</span>
                </label>
                <input type="range" name="memoryUsage" min="0" max="100" value={metrics.memoryUsage} onChange={handleChange} className="w-full" />
              </div>

              <div>
                <label className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Latency (ms)</span>
                  <span className="font-bold text-blue-600">{metrics.latency} ms</span>
                </label>
                <input type="range" name="latency" min="50" max="2000" value={metrics.latency} onChange={handleChange} className="w-full" />
              </div>

              <div>
                <label className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Error Rate (%)</span>
                  <span className="font-bold text-blue-600">{metrics.errorRate}%</span>
                </label>
                <input type="range" name="errorRate" min="0" max="50" step="0.5" value={metrics.errorRate} onChange={handleChange} className="w-full" />
              </div>

              <button onClick={handleAnalyze} disabled={loading} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition">
                {loading ? 'Analyzing...' : '🔍 Check System Health'}
              </button>
            </div>
          </div>

          {/* Result Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col justify-center">
            {!result && !loading && (
              <div className="text-center text-gray-400">
                <p className="text-5xl mb-4">🖥️</p>
                <p>Adjust the sliders and check system health.</p>
              </div>
            )}

            {loading && (
              <div className="text-center text-blue-500">
                <p className="text-4xl mb-4 animate-spin">⏳</p>
                <p>Analyzing metrics...</p>
              </div>
            )}

            {result && !loading && (
              <div className={`text-center p-6 rounded-xl ${result.is_anomaly ? 'bg-red-50 border-red-200 border' : 'bg-green-50 border-green-200 border'}`}>
                <p className="text-6xl mb-4">{result.is_anomaly ? '🚨' : '✅'}</p>
                <h3 className={`text-2xl font-bold mb-2 ${result.is_anomaly ? 'text-red-700' : 'text-green-700'}`}>
                  {result.is_anomaly ? 'SYSTEM ANOMALY DETECTED' : 'SYSTEM HEALTHY'}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  Anomaly Score: <strong>{result.anomaly_score}</strong>
                </p>
                
                <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${
                  result.is_anomaly ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'
                }`}>
                  {result.status}
                </span>
              </div>
            )}
          </div>

        </div>

        <div className="mt-8">
          <Link href="/in" className="text-blue-600 hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
