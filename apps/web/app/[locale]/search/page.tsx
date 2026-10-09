'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';

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
  const t = useTranslations();
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
      const res = await fetch(`/api/flights/search?from=${from}&to=${to}&date=${date}`);
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
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            ✈️ SkyWings
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/search"
              className="text-gray-700 hover:text-blue-600 font-medium hidden md:inline"
            >
              {t('nav.search')}
            </Link>
            <Link
              href="/login"
              className="text-gray-700 hover:text-blue-600 font-medium hidden md:inline"
            >
              {t('nav.login')}
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        {/* Search Form */}
        <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">{t('search.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('search.from')}
              </label>
              <input
                value={from}
                onChange={(e) => setFrom(e.target.value.toUpperCase())}
                placeholder="DEL"
                maxLength={3}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('search.to')}
              </label>
              <input
                value={to}
                onChange={(e) => setTo(e.target.value.toUpperCase())}
                placeholder="BOM"
                maxLength={3}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('search.date')}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500 font-semibold"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={searchFlights}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? t('search.searching') : t('search.button')}
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-3">{t('search.tryThese')}</p>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {loading && (
            <div className="text-center py-12 text-gray-500">{t('search.searching')}</div>
          )}

          {!loading && searched && flights.length === 0 && (
            <div className="bg-white p-8 rounded-2xl shadow-md text-center text-gray-500">
              {t('search.noResults')}
            </div>
          )}

          {!loading &&
            flights.map((f) => (
              <div
                key={f.id}
                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition flex flex-col md:flex-row justify-between items-center gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 text-blue-700 font-bold px-3 py-2 rounded-lg">
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
                    {f.seatsAvailable} {t('search.seatsLeft')}
                  </div>
                  <Link
                    href={`/booking/${f.id}`}
                    className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    {t('search.bookNow')}
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </div>
    </main>
  );
}
