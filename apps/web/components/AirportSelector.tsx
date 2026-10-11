'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import {
  AIRPORTS,
  searchAirports,
  groupAirportsByCountry,
} from '@/lib/airports';

interface AirportSelectorProps {
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
  label?: string;
}

export default function AirportSelector({
  value,
  onChange,
  placeholder = 'Search airport...',
  label,
}: AirportSelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  const selectedAirport = AIRPORTS.find((a) => a.code === value);

  // Filter airports + flatten list for keyboard navigation
  const { filtered, flatList } = useMemo(() => {
    const f = query ? searchAirports(query) : AIRPORTS;
    return { filtered: f, flatList: f };
  }, [query]);

  const grouped = groupAirportsByCountry(filtered);

  // 🔹 FIX 1: Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🔹 FIX 2: Focus input + auto-scroll to selected when opened
  useEffect(() => {
    if (open) {
      // Focus input
      setTimeout(() => inputRef.current?.focus(), 50);

      // Auto-scroll to selected item (only when no query typed)
      if (!query && selectedItemRef.current) {
        setTimeout(() => {
          selectedItemRef.current?.scrollIntoView({
            block: 'center',
            behavior: 'instant' as ScrollBehavior,
          });
        }, 100);
      }
    } else {
      setQuery('');
      setHighlightedIndex(0);
    }
  }, [open, query]);

  // 🔹 FIX 3: Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % flatList.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(
        (prev) => (prev - 1 + flatList.length) % flatList.length
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatList[highlightedIndex]) {
        handleSelect(flatList[highlightedIndex].code);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  };

  const handleSelect = (code: string) => {
    onChange(code);
    setOpen(false);
    setQuery('');
    setHighlightedIndex(0);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      {/* Display button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500 font-semibold text-left flex items-center justify-between hover:border-blue-400 transition bg-white"
      >
        <span className="flex items-center gap-2 min-w-0">
          {selectedAirport ? (
            <>
              <span className="text-xl flex-shrink-0">
                {selectedAirport.flag}
              </span>
              <span className="font-bold flex-shrink-0">
                {selectedAirport.code}
              </span>
              <span className="text-gray-500 text-sm font-normal truncate">
                {selectedAirport.city}
              </span>
            </>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${
            open ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          ></div>
          <div className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
            {/* 🔹 FIX 4: Search input with autoComplete OFF */}
            <div className="p-2 border-b border-gray-100 bg-gray-50">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search city, code, or country..."
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  name={`airport-search-${label || 'default'}-${value}`}
                  data-form-type="other"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>
            </div>

            {/* Airport list */}
            <div ref={listRef} className="max-h-72 overflow-y-auto">
              {Object.keys(grouped).length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  <div className="text-3xl mb-2">🔍</div>
                  <div>No airports found for &quot;{query}&quot;</div>
                </div>
              ) : (
                Object.entries(grouped).map(([country, airports]) => (
                  <div key={country}>
                    {/* Country header */}
                    <div className="px-4 py-1.5 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 border-b border-gray-100">
                      {airports[0].flag} {country}
                    </div>

                    {/* Airport options */}
                    {airports.map((airport) => {
                      const isSelected = value === airport.code;
                      const isHighlighted =
                        flatList[highlightedIndex]?.code === airport.code;

                      return (
                        <button
                          key={airport.code}
                          ref={isSelected ? selectedItemRef : null}
                          type="button"
                          onClick={() => handleSelect(airport.code)}
                          onMouseEnter={() =>
                            setHighlightedIndex(
                              flatList.findIndex(
                                (a) => a.code === airport.code
                              )
                            )
                          }
                          className={`w-full flex items-center gap-3 px-4 py-2 transition text-left ${
                            isSelected
                              ? 'bg-blue-100'
                              : isHighlighted
                              ? 'bg-blue-50'
                              : 'hover:bg-blue-50'
                          }`}
                        >
                          <span className="text-xl flex-shrink-0">
                            {airport.flag}
                          </span>
                          <div className="flex-1 min-w-0 flex items-center gap-2">
                            <span className="font-bold text-gray-800 flex-shrink-0">
                              {airport.code}
                            </span>
                            <span className="text-sm text-gray-600 truncate">
                              {airport.city}
                            </span>
                          </div>
                          {isSelected && (
                            <svg
                              className="w-4 h-4 text-blue-600 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Close</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
