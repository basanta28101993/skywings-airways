'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  fromCode: string;
  fromCity: string;
  toCode: string;
  toCity: string;
  departureTime: string;
  arrivalTime: string;
  basePrice: string;
  currency: string;
  aircraft: string;
  seatsAvailable: number;
}

export default function SearchPage() {
  const [from, setFrom] = useState('DEL');
  const [to, setTo] = useState('BOM');
  const [date, setDate] = useState('2026-12-01');
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchFlights = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `/api/flights/search?from=${from}&to=${to}&date=${date}`
      );
      const data = await res.json();
      setFlights(data.flights || []);
    } catch (err) {
      console.error(err);
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            ✈️ SkyWings
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        {/* Search Form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Search Flights</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input
                value={from}
                onChange={(e) => setFrom(e.target.value.toUpperCase())}
                placeholder="DEL"
                maxLength={3}
                className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input
                value={to}
                onChange={(e) => setTo(e.target.value.toUpperCase())}
                placeholder="BOM"
                maxLength={3}
                className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={searchFlights}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Try: DEL → BOM, BOM → GOA, DEL → BLR, BLR → BOM
          </p>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {loading && (
            <div className="text-center py-12 text-gray-500">Loading flights...</div>
          )}

          {!loading && searched && flights.length === 0 && (
            <div className="bg-white p-8 rounded-lg shadow-md text-center text-gray-500">
              No flights found for this route. Try DEL → BOM.
            </div>
          )}

          {!loading &&
            flights.map((f) => (
              <div
                key={f.id}
                className="bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-center gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 text-blue-700 font-bold px-3 py-2 rounded">
                    {f.flightNumber}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{f.airline}</div>
                    <div className="text-sm text-gray-500">{f.aircraft}</div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="font-bold text-xl text-gray-800">
                      {new Date(f.departureTime).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })}
                    </div>
                    <div className="text-gray-500 text-sm">{f.fromCode}</div>
                  </div>
                  <div className="text-gray-400 text-xl">→</div>
                  <div className="text-center">
                    <div className="font-bold text-xl text-gray-800">
                      {new Date(f.arrivalTime).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })}
                    </div>
                    <div className="text-gray-500 text-sm">{f.toCode}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-2xl text-blue-600">
                    ₹{parseInt(f.basePrice).toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {f.seatsAvailable} seats left
                  </div>
                  <Link
                    href={`/booking/${f.id}`}
                    className="inline-block bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700 transition"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </div>
    </main>
  );
}
