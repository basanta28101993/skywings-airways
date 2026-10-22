'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import AirportSelector from '@/components/AirportSelector';

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
  dynamicPrice?: number;
  priceMultiplier?: number;
  surgeReason?: string;
  priceConfidence?: string;
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

  const swapCities = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
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

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            {/* From */}
            <div className="md:col-span-4 relative">
              <AirportSelector
                value={from}
                onChange={setFrom}
                label={t('search.from')}
                placeholder="Select origin"
              />
            </div>

            {/* Swap button */}
            <div className="md:col-span-1 flex justify-center md:pb-1">
              <button
                type="button"
                onClick={swapCities}
                className="bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full p-2.5 transition"
                title="Swap cities"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </button>
            </div>

            {/* To */}
            <div className="md:col-span-4">
              <AirportSelector
                value={to}
                onChange={setTo}
                label={t('search.to')}
                placeholder="Select destination"
              />
            </div>

            {/* Date */}
            <div className="md:col-span-3">
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
          </div>

          {/* Search button */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={searchFlights}
              disabled={loading || from === to}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? t('search.searching') : t('search.button')}
            </button>
          </div>

          {from === to && (
            <p className="text-sm text-red-500 mt-2">
              Origin and destination must be different
            </p>
          )}
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
            flights.map((f) => {
              const basePriceNum = parseFloat(f.basePrice);
              const finalPrice = f.dynamicPrice || basePriceNum;
              const multiplier = f.priceMultiplier || 1.0;
              const priceChanged = Math.abs(multiplier - 1.0) > 0.02;

              return (
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
                      {f.currency} {Math.round(finalPrice).toLocaleString('en-IN')}
                    </div>

                    {priceChanged && (
                      <div className="text-xs text-gray-500 mt-1">
                        <span className="line-through mr-2">
                          {f.currency} {Math.round(basePriceNum).toLocaleString('en-IN')}
                        </span>
                        <span
                          className={`font-semibold ${
                            multiplier > 1.15
                              ? 'text-red-600'
                              : multiplier > 1.0
                              ? 'text-orange-500'
                              : 'text-green-600'
                          }`}
                        >
                          {multiplier > 1 ? '↑' : '↓'}{' '}
                          {Math.abs((multiplier - 1) * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}

                    {f.surgeReason && f.surgeReason !== 'Standard pricing' && (
                      <div className="text-xs text-orange-600 mt-1 font-medium">
                        ⚡ {f.surgeReason}
                      </div>
                    )}

                    <div className="text-xs text-gray-500 mt-2">
                      {f.seatsAvailable} {t('search.seatsLeft')}
                    </div>

                    <Link
                      href={`/booking/${f.id}`}
                      className="inline-block mt-2 bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                      {t('search.bookNow')}
                    </Link>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </main>
  );
}
