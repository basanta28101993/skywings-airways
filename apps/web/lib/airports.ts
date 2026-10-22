export interface Airport {
  code: string;
  city: string;
  country: string;
  countryCode: string;
  flag: string;
}

export const AIRPORTS: Airport[] = [
  // 🇮🇳 India
  { code: 'DEL', city: 'Delhi', country: 'India', countryCode: 'IN', flag: '🇮🇳' },
  { code: 'BOM', city: 'Mumbai', country: 'India', countryCode: 'IN', flag: '🇮🇳' },
  { code: 'BLR', city: 'Bangalore', country: 'India', countryCode: 'IN', flag: '🇮🇳' },
  { code: 'MAA', city: 'Chennai', country: 'India', countryCode: 'IN', flag: '🇮🇳' },
  { code: 'CCU', city: 'Kolkata', country: 'India', countryCode: 'IN', flag: '🇮🇳' },
  { code: 'HYD', city: 'Hyderabad', country: 'India', countryCode: 'IN', flag: '🇮🇳' },
  { code: 'GOA', city: 'Goa', country: 'India', countryCode: 'IN', flag: '🇮🇳' },

  // 🇯🇵 Japan
  { code: 'NRT', city: 'Tokyo Narita', country: 'Japan', countryCode: 'JP', flag: '🇯🇵' },
  { code: 'HND', city: 'Tokyo Haneda', country: 'Japan', countryCode: 'JP', flag: '🇯🇵' },
  { code: 'KIX', city: 'Osaka', country: 'Japan', countryCode: 'JP', flag: '🇯🇵' },
  { code: 'NGO', city: 'Nagoya', country: 'Japan', countryCode: 'JP', flag: '🇯🇵' },

  // 🇩🇪 Germany
  { code: 'FRA', city: 'Frankfurt', country: 'Germany', countryCode: 'DE', flag: '🇩🇪' },
  { code: 'MUC', city: 'Munich', country: 'Germany', countryCode: 'DE', flag: '🇩🇪' },
  { code: 'BER', city: 'Berlin', country: 'Germany', countryCode: 'DE', flag: '🇩🇪' },
  { code: 'DUS', city: 'Düsseldorf', country: 'Germany', countryCode: 'DE', flag: '🇩🇪' },

  // 🇦🇪 UAE
  { code: 'DXB', city: 'Dubai', country: 'UAE', countryCode: 'AE', flag: '🇦🇪' },
  { code: 'AUH', city: 'Abu Dhabi', country: 'UAE', countryCode: 'AE', flag: '🇦🇪' },
  { code: 'SHJ', city: 'Sharjah', country: 'UAE', countryCode: 'AE', flag: '🇦🇪' },

  // 🇺🇸 USA
  { code: 'JFK', city: 'New York', country: 'USA', countryCode: 'US', flag: '🇺🇸' },
  { code: 'LAX', city: 'Los Angeles', country: 'USA', countryCode: 'US', flag: '🇺🇸' },
  { code: 'SFO', city: 'San Francisco', country: 'USA', countryCode: 'US', flag: '🇺🇸' },

  // 🇧🇩 Bangladesh
  { code: 'DAC', city: 'Dhaka', country: 'Bangladesh', countryCode: 'BD', flag: '🇧🇩' },
  { code: 'CGP', city: 'Chittagong', country: 'Bangladesh', countryCode: 'BD', flag: '🇧🇩' },
];

export function findAirport(code: string): Airport | undefined {
  return AIRPORTS.find((a) => a.code === code.toUpperCase());
}

export function searchAirports(query: string): Airport[] {
  const q = query.toLowerCase().trim();
  if (!q) return AIRPORTS;

  return AIRPORTS.filter((a) =>
    a.code.toLowerCase().includes(q) ||
    a.city.toLowerCase().includes(q) ||
    a.country.toLowerCase().includes(q)
  );
}

export function groupAirportsByCountry(airports: Airport[]): Record<string, Airport[]> {
  return airports.reduce((acc, airport) => {
    if (!acc[airport.country]) acc[airport.country] = [];
    acc[airport.country].push(airport);
    return acc;
  }, {} as Record<string, Airport[]>);
}
