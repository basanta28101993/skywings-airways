'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FraudResult {
  is_fraud: boolean;
  fraud_probability: number;
  risk_level: string;
  message?: string;
  error?: string;
}

export default function FraudCheckDashboard() {
  const [formData, setFormData] = useState({
    amount: 150000,
    paymentMethod: 'card',
    ipCountry: 'RU',
    billingCountry: 'IN',
    deviceType: 'unknown',
    bookingHour: 3,
  });
  
  const [result, setResult] = useState<FraudResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'amount' || name === 'bookingHour' ? Number(value) : value }));
  };

  const handleCheckFraud = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/payment/check-fraud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ is_fraud: false, fraud_probability: 0, risk_level: 'Error', error: 'Failed to connect to API' });
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
            <span className="text-4xl">🛡️</span> Fraud Detection System
          </h1>
          <p className="text-gray-500 mt-2">Test the ML model by simulating a transaction.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Form Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Transaction Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Amount (INR)</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="w-full border p-2 rounded" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">IP Country</label>
                  <select name="ipCountry" value={formData.ipCountry} onChange={handleChange} className="w-full border p-2 rounded">
                    <option value="IN">India (IN)</option>
                    <option value="RU">Russia (RU)</option>
                    <option value="US">USA (US)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Billing Country</label>
                  <select name="billingCountry" value={formData.billingCountry} onChange={handleChange} className="w-full border p-2 rounded">
                    <option value="IN">India (IN)</option>
                    <option value="RU">Russia (RU)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Payment Method</label>
                  <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="w-full border p-2 rounded">
                    <option value="card">Credit Card</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Device Type</label>
                  <select name="deviceType" value={formData.deviceType} onChange={handleChange} className="w-full border p-2 rounded">
                    <option value="web">Web Browser</option>
                    <option value="android">Android</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Booking Hour (0-23)</label>
                <input type="number" name="bookingHour" value={formData.bookingHour} onChange={handleChange} className="w-full border p-2 rounded" min="0" max="23" />
              </div>

              <button onClick={handleCheckFraud} disabled={loading} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition">
                {loading ? 'Analyzing...' : '🔍 Check Transaction'}
              </button>
            </div>
          </div>

          {/* Result Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col justify-center">
            {!result && !loading && (
              <div className="text-center text-gray-400">
                <p className="text-5xl mb-4">📊</p>
                <p>Enter transaction details and click check.</p>
              </div>
            )}

            {loading && (
              <div className="text-center text-blue-500">
                <p className="text-4xl mb-4 animate-spin">⏳</p>
                <p>Checking for fraud patterns...</p>
              </div>
            )}

            {result && !loading && (
              <div className={`text-center p-6 rounded-xl ${result.is_fraud ? 'bg-red-50 border-red-200 border' : 'bg-green-50 border-green-200 border'}`}>
                <p className="text-6xl mb-4">{result.is_fraud ? '🚨' : '✅'}</p>
                <h3 className={`text-2xl font-bold mb-2 ${result.is_fraud ? 'text-red-700' : 'text-green-700'}`}>
                  {result.is_fraud ? 'FRAUD DETECTED' : 'GENUINE'}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  Risk Probability: <strong>{(result.fraud_probability * 100).toFixed(2)}%</strong>
                </p>
                
                <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${
                  result.risk_level === 'High' ? 'bg-red-200 text-red-800' : 
                  result.risk_level === 'Medium' ? 'bg-yellow-200 text-yellow-800' : 
                  'bg-green-200 text-green-800'
                }`}>
                  {result.risk_level} RISK
                </span>

                {result.message && (
                  <p className="mt-4 text-sm text-red-600 font-medium">{result.message}</p>
                )}
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
