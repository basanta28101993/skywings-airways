'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
}

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [flightId, setFlightId] = useState<string>('');
  const [flight, setFlight] = useState<Flight | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingFlight, setLoadingFlight] = useState(true);

  useEffect(() => {
    params.then((p) => setFlightId(p.id));
  }, [params]);

  useEffect(() => {
    if (!flightId) return;
    const fetchFlight = async () => {
      try {
        const routes = [
          ['DEL', 'BOM'], ['BOM', 'GOA'], ['DEL', 'BLR'], ['BLR', 'BOM'], ['BOM', 'DEL']
        ];
        for (const [from, to] of routes) {
          const res = await fetch(`/api/flights/search?from=${from}&to=${to}`);
          const data = await res.json();
          const found = data.flights?.find((f: Flight) => f.id === flightId);
          if (found) { setFlight(found); break; }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingFlight(false);
      }
    };
    fetchFlight();
  }, [flightId]);

  const confirmBooking = async () => {
    if (!name || !email) { alert('Please fill name and email'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightId, passengerName: name, passengerEmail: email, passengerPhone: phone }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Booking Confirmed!\n\nPNR: ${data.booking.pnr}\nPassenger: ${data.booking.passengerName}\nTotal: ₹${data.booking.totalPrice}`);
        router.push('/');
      } else {
        alert('❌ ' + (data.error || 'Booking failed'));
      }
    } catch {
      alert('❌ Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingFlight) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading flight details...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600">✈️ SkyWings</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto p-6">
        {flight && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-sm opacity-90">{flight.airline}</div>
                <div className="font-bold text-xl">{flight.flightNumber}</div>
              </div>
              <div className="text-sm opacity-90">{flight.aircraft}</div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-3xl font-bold">
                  {new Date(flight.departureTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </div>
                <div className="opacity-90">{flight.fromCity} ({flight.fromCode})</div>
              </div>
              <div className="text-2xl">✈️</div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {new Date(flight.arrivalTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </div>
                <div className="opacity-90">{flight.toCity} ({flight.toCode})</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/30 text-right">
              <div className="text-sm opacity-90">Total Price</div>
              <div className="text-2xl font-bold">₹{parseInt(flight.basePrice).toLocaleString('en-IN')}</div>
            </div>
          </div>
        )}

        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Passenger Details</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Basanta Das"
                className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9999999999"
                className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <button onClick={confirmBooking} disabled={loading || !name || !email}
            className="w-full mt-6 bg-green-600 text-white py-3 rounded font-semibold hover:bg-green-700 disabled:opacity-50 transition">
            {loading ? 'Confirming...' : `Confirm Booking${flight ? ' — ₹' + parseInt(flight.basePrice).toLocaleString('en-IN') : ''}`}
          </button>

          <p className="text-xs text-gray-500 mt-3 text-center">
            * This is a demo project. No real payment will be processed.
          </p>
        </div>
      </div>
    </main>
  );
}
