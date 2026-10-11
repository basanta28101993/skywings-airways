import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================
// AIRPORTS (25 total across 6 countries)
// ============================================================
interface Airport {
  code: string;
  city: string;
  country: string;
  countryCode: string;
}

const AIRPORTS: Record<string, Airport> = {
  // 🇮🇳 India (7 airports)
  DEL: { code: 'DEL', city: 'Delhi', country: 'India', countryCode: 'IN' },
  BOM: { code: 'BOM', city: 'Mumbai', country: 'India', countryCode: 'IN' },
  BLR: { code: 'BLR', city: 'Bangalore', country: 'India', countryCode: 'IN' },
  MAA: { code: 'MAA', city: 'Chennai', country: 'India', countryCode: 'IN' },
  CCU: { code: 'CCU', city: 'Kolkata', country: 'India', countryCode: 'IN' },
  HYD: { code: 'HYD', city: 'Hyderabad', country: 'India', countryCode: 'IN' },
  GOA: { code: 'GOA', city: 'Goa', country: 'India', countryCode: 'IN' },

  // 🇯🇵 Japan (4 airports)
  NRT: { code: 'NRT', city: 'Tokyo Narita', country: 'Japan', countryCode: 'JP' },
  HND: { code: 'HND', city: 'Tokyo Haneda', country: 'Japan', countryCode: 'JP' },
  KIX: { code: 'KIX', city: 'Osaka', country: 'Japan', countryCode: 'JP' },
  NGO: { code: 'NGO', city: 'Nagoya', country: 'Japan', countryCode: 'JP' },

  // 🇩🇪 Germany (4 airports)
  FRA: { code: 'FRA', city: 'Frankfurt', country: 'Germany', countryCode: 'DE' },
  MUC: { code: 'MUC', city: 'Munich', country: 'Germany', countryCode: 'DE' },
  BER: { code: 'BER', city: 'Berlin', country: 'Germany', countryCode: 'DE' },
  DUS: { code: 'DUS', city: 'Düsseldorf', country: 'Germany', countryCode: 'DE' },

  // 🇦🇪 UAE (3 airports)
  DXB: { code: 'DXB', city: 'Dubai', country: 'UAE', countryCode: 'AE' },
  AUH: { code: 'AUH', city: 'Abu Dhabi', country: 'UAE', countryCode: 'AE' },
  SHJ: { code: 'SHJ', city: 'Sharjah', country: 'UAE', countryCode: 'AE' },

  // 🇺🇸 USA (3 airports)
  JFK: { code: 'JFK', city: 'New York', country: 'USA', countryCode: 'US' },
  LAX: { code: 'LAX', city: 'Los Angeles', country: 'USA', countryCode: 'US' },
  SFO: { code: 'SFO', city: 'San Francisco', country: 'USA', countryCode: 'US' },

  // 🇧🇩 Bangladesh (2 airports)
  DAC: { code: 'DAC', city: 'Dhaka', country: 'Bangladesh', countryCode: 'BD' },
  CGP: { code: 'CGP', city: 'Chittagong', country: 'Bangladesh', countryCode: 'BD' },
};

// ============================================================
// ROUTES (with base prices in USD, will convert to local)
// ============================================================
interface RouteDef {
  from: string;
  to: string;
  baseUSD: number;      // base price in USD
  distanceKm: number;
  type: 'domestic' | 'regional' | 'long-haul';
}

const ROUTES: RouteDef[] = [
  // ==========================================
  // 🇮🇳 INDIA DOMESTIC (10 routes)
  // ==========================================
  { from: 'DEL', to: 'BOM', baseUSD: 60, distanceKm: 1400, type: 'domestic' },
  { from: 'BOM', to: 'DEL', baseUSD: 63, distanceKm: 1400, type: 'domestic' },
  { from: 'DEL', to: 'BLR', baseUSD: 80, distanceKm: 2150, type: 'domestic' },
  { from: 'BLR', to: 'DEL', baseUSD: 82, distanceKm: 2150, type: 'domestic' },
  { from: 'DEL', to: 'GOA', baseUSD: 75, distanceKm: 1900, type: 'domestic' },
  { from: 'GOA', to: 'DEL', baseUSD: 78, distanceKm: 1900, type: 'domestic' },
  { from: 'BOM', to: 'GOA', baseUSD: 35, distanceKm: 590, type: 'domestic' },
  { from: 'GOA', to: 'BOM', baseUSD: 37, distanceKm: 590, type: 'domestic' },
  { from: 'BOM', to: 'BLR', baseUSD: 48, distanceKm: 980, type: 'domestic' },
  { from: 'BLR', to: 'BOM', baseUSD: 50, distanceKm: 980, type: 'domestic' },
  { from: 'BLR', to: 'MAA', baseUSD: 40, distanceKm: 350, type: 'domestic' },
  { from: 'MAA', to: 'BLR', baseUSD: 42, distanceKm: 350, type: 'domestic' },
  { from: 'DEL', to: 'CCU', baseUSD: 70, distanceKm: 1500, type: 'domestic' },
  { from: 'CCU', to: 'DEL', baseUSD: 72, distanceKm: 1500, type: 'domestic' },
  { from: 'BOM', to: 'HYD', baseUSD: 52, distanceKm: 710, type: 'domestic' },
  { from: 'HYD', to: 'BOM', baseUSD: 55, distanceKm: 710, type: 'domestic' },

  // ==========================================
  // 🇯🇵 JAPAN DOMESTIC (4 routes)
  // ==========================================
  { from: 'NRT', to: 'KIX', baseUSD: 90, distanceKm: 500, type: 'domestic' },
  { from: 'KIX', to: 'NRT', baseUSD: 92, distanceKm: 500, type: 'domestic' },
  { from: 'HND', to: 'KIX', baseUSD: 88, distanceKm: 400, type: 'domestic' },
  { from: 'KIX', to: 'HND', baseUSD: 90, distanceKm: 400, type: 'domestic' },
  { from: 'NRT', to: 'NGO', baseUSD: 85, distanceKm: 350, type: 'domestic' },
  { from: 'NGO', to: 'NRT', baseUSD: 87, distanceKm: 350, type: 'domestic' },

  // ==========================================
  // 🇩🇪 GERMANY DOMESTIC (4 routes)
  // ==========================================
  { from: 'FRA', to: 'BER', baseUSD: 120, distanceKm: 435, type: 'domestic' },
  { from: 'BER', to: 'FRA', baseUSD: 125, distanceKm: 435, type: 'domestic' },
  { from: 'FRA', to: 'MUC', baseUSD: 100, distanceKm: 305, type: 'domestic' },
  { from: 'MUC', to: 'FRA', baseUSD: 105, distanceKm: 305, type: 'domestic' },
  { from: 'FRA', to: 'DUS', baseUSD: 110, distanceKm: 210, type: 'domestic' },
  { from: 'DUS', to: 'FRA', baseUSD: 115, distanceKm: 210, type: 'domestic' },
  { from: 'BER', to: 'MUC', baseUSD: 130, distanceKm: 505, type: 'domestic' },
  { from: 'MUC', to: 'BER', baseUSD: 135, distanceKm: 505, type: 'domestic' },

  // ==========================================
  // 🇦🇪 UAE DOMESTIC (2 routes)
  // ==========================================
  { from: 'DXB', to: 'AUH', baseUSD: 70, distanceKm: 160, type: 'domestic' },
  { from: 'AUH', to: 'DXB', baseUSD: 72, distanceKm: 160, type: 'domestic' },
  { from: 'DXB', to: 'SHJ', baseUSD: 65, distanceKm: 30, type: 'domestic' },
  { from: 'SHJ', to: 'DXB', baseUSD: 67, distanceKm: 30, type: 'domestic' },

  // ==========================================
  // 🇺🇸 USA DOMESTIC (4 routes)
  // ==========================================
  { from: 'JFK', to: 'LAX', baseUSD: 350, distanceKm: 3980, type: 'domestic' },
  { from: 'LAX', to: 'JFK', baseUSD: 360, distanceKm: 3980, type: 'domestic' },
  { from: 'JFK', to: 'SFO', baseUSD: 380, distanceKm: 4150, type: 'domestic' },
  { from: 'SFO', to: 'JFK', baseUSD: 390, distanceKm: 4150, type: 'domestic' },
  { from: 'LAX', to: 'SFO', baseUSD: 150, distanceKm: 560, type: 'domestic' },
  { from: 'SFO', to: 'LAX', baseUSD: 155, distanceKm: 560, type: 'domestic' },

  // ==========================================
  // 🇧🇩 BANGLADESH DOMESTIC (1 route)
  // ==========================================
  { from: 'DAC', to: 'CGP', baseUSD: 60, distanceKm: 220, type: 'domestic' },
  { from: 'CGP', to: 'DAC', baseUSD: 62, distanceKm: 220, type: 'domestic' },

  // ==========================================
  // 🌏 INDIA ↔ JAPAN (Long-haul, 6 routes)
  // ==========================================
  { from: 'DEL', to: 'NRT', baseUSD: 750, distanceKm: 5870, type: 'long-haul' },
  { from: 'NRT', to: 'DEL', baseUSD: 770, distanceKm: 5870, type: 'long-haul' },
  { from: 'BOM', to: 'NRT', baseUSD: 780, distanceKm: 6730, type: 'long-haul' },
  { from: 'NRT', to: 'BOM', baseUSD: 800, distanceKm: 6730, type: 'long-haul' },
  { from: 'BLR', to: 'NRT', baseUSD: 820, distanceKm: 6900, type: 'long-haul' },
  { from: 'NRT', to: 'BLR', baseUSD: 840, distanceKm: 6900, type: 'long-haul' },

  // ==========================================
  // 🌏 INDIA ↔ GERMANY (Long-haul, 4 routes)
  // ==========================================
  { from: 'DEL', to: 'FRA', baseUSD: 700, distanceKm: 6100, type: 'long-haul' },
  { from: 'FRA', to: 'DEL', baseUSD: 720, distanceKm: 6100, type: 'long-haul' },
  { from: 'BOM', to: 'FRA', baseUSD: 720, distanceKm: 6570, type: 'long-haul' },
  { from: 'FRA', to: 'BOM', baseUSD: 740, distanceKm: 6570, type: 'long-haul' },

  // ==========================================
  // 🌏 INDIA ↔ UAE (Regional, 8 routes)
  // ==========================================
  { from: 'DEL', to: 'DXB', baseUSD: 250, distanceKm: 2190, type: 'regional' },
  { from: 'DXB', to: 'DEL', baseUSD: 260, distanceKm: 2190, type: 'regional' },
  { from: 'BOM', to: 'DXB', baseUSD: 230, distanceKm: 1930, type: 'regional' },
  { from: 'DXB', to: 'BOM', baseUSD: 240, distanceKm: 1930, type: 'regional' },
  { from: 'BLR', to: 'DXB', baseUSD: 245, distanceKm: 2930, type: 'regional' },
  { from: 'DXB', to: 'BLR', baseUSD: 255, distanceKm: 2930, type: 'regional' },
  { from: 'MAA', to: 'AUH', baseUSD: 240, distanceKm: 2980, type: 'regional' },
  { from: 'AUH', to: 'MAA', baseUSD: 250, distanceKm: 2980, type: 'regional' },

  // ==========================================
  // 🌏 INDIA ↔ USA (Long-haul, 6 routes)
  // ==========================================
  { from: 'DEL', to: 'JFK', baseUSD: 950, distanceKm: 11790, type: 'long-haul' },
  { from: 'JFK', to: 'DEL', baseUSD: 980, distanceKm: 11790, type: 'long-haul' },
  { from: 'BOM', to: 'JFK', baseUSD: 970, distanceKm: 12560, type: 'long-haul' },
  { from: 'JFK', to: 'BOM', baseUSD: 1000, distanceKm: 12560, type: 'long-haul' },
  { from: 'BLR', to: 'SFO', baseUSD: 1050, distanceKm: 14000, type: 'long-haul' },
  { from: 'SFO', to: 'BLR', baseUSD: 1080, distanceKm: 14000, type: 'long-haul' },

  // ==========================================
  // 🌏 INDIA ↔ BANGLADESH (Regional, 4 routes)
  // ==========================================
  { from: 'DEL', to: 'DAC', baseUSD: 180, distanceKm: 1440, type: 'regional' },
  { from: 'DAC', to: 'DEL', baseUSD: 185, distanceKm: 1440, type: 'regional' },
  { from: 'CCU', to: 'DAC', baseUSD: 120, distanceKm: 250, type: 'regional' },
  { from: 'DAC', to: 'CCU', baseUSD: 125, distanceKm: 250, type: 'regional' },

  // ==========================================
  // 🌏 JAPAN ↔ GERMANY (Long-haul, 2 routes)
  // ==========================================
  { from: 'NRT', to: 'FRA', baseUSD: 1000, distanceKm: 9370, type: 'long-haul' },
  { from: 'FRA', to: 'NRT', baseUSD: 1020, distanceKm: 9370, type: 'long-haul' },
  { from: 'HND', to: 'MUC', baseUSD: 1020, distanceKm: 9280, type: 'long-haul' },
  { from: 'MUC', to: 'HND', baseUSD: 1050, distanceKm: 9280, type: 'long-haul' },

  // ==========================================
  // 🌏 JAPAN ↔ UAE (Long-haul, 2 routes)
  // ==========================================
  { from: 'NRT', to: 'DXB', baseUSD: 850, distanceKm: 7920, type: 'long-haul' },
  { from: 'DXB', to: 'NRT', baseUSD: 870, distanceKm: 7920, type: 'long-haul' },

  // ==========================================
  // 🌏 JAPAN ↔ USA (Long-haul, 4 routes)
  // ==========================================
  { from: 'NRT', to: 'JFK', baseUSD: 1200, distanceKm: 10850, type: 'long-haul' },
  { from: 'JFK', to: 'NRT', baseUSD: 1220, distanceKm: 10850, type: 'long-haul' },
  { from: 'HND', to: 'LAX', baseUSD: 1100, distanceKm: 8800, type: 'long-haul' },
  { from: 'LAX', to: 'HND', baseUSD: 1130, distanceKm: 8800, type: 'long-haul' },

  // ==========================================
  // 🌏 GERMANY ↔ UAE (Long-haul, 2 routes)
  // ==========================================
  { from: 'FRA', to: 'DXB', baseUSD: 650, distanceKm: 4820, type: 'long-haul' },
  { from: 'DXB', to: 'FRA', baseUSD: 670, distanceKm: 4820, type: 'long-haul' },

  // ==========================================
  // 🌏 GERMANY ↔ USA (Long-haul, 4 routes)
  // ==========================================
  { from: 'FRA', to: 'JFK', baseUSD: 600, distanceKm: 6200, type: 'long-haul' },
  { from: 'JFK', to: 'FRA', baseUSD: 620, distanceKm: 6200, type: 'long-haul' },
  { from: 'FRA', to: 'LAX', baseUSD: 850, distanceKm: 9310, type: 'long-haul' },
  { from: 'LAX', to: 'FRA', baseUSD: 870, distanceKm: 9310, type: 'long-haul' },

  // ==========================================
  // 🌏 UAE ↔ USA (Long-haul, 2 routes)
  // ==========================================
  { from: 'DXB', to: 'JFK', baseUSD: 900, distanceKm: 11000, type: 'long-haul' },
  { from: 'JFK', to: 'DXB', baseUSD: 920, distanceKm: 11000, type: 'long-haul' },

  // ==========================================
  // 🌏 USA ↔ BANGLADESH (Long-haul, 2 routes)
  // ==========================================
  { from: 'JFK', to: 'DAC', baseUSD: 1100, distanceKm: 12500, type: 'long-haul' },
  { from: 'DAC', to: 'JFK', baseUSD: 1130, distanceKm: 12500, type: 'long-haul' },

  // ==========================================
  // 🌏 UAE ↔ BANGLADESH (Regional, 4 routes)
  // ==========================================
  { from: 'DXB', to: 'DAC', baseUSD: 350, distanceKm: 3540, type: 'regional' },
  { from: 'DAC', to: 'DXB', baseUSD: 360, distanceKm: 3540, type: 'regional' },
  { from: 'SHJ', to: 'CGP', baseUSD: 340, distanceKm: 3670, type: 'regional' },
  { from: 'CGP', to: 'SHJ', baseUSD: 350, distanceKm: 3670, type: 'regional' },
];

// ============================================================
// AIRCRAFT (based on route type)
// ============================================================
const AIRCRAFT = {
  domestic: [
    { name: 'Airbus A320', capacity: 180 },
    { name: 'Boeing 737', capacity: 189 },
    { name: 'ATR 72', capacity: 70 },
    { name: 'Airbus A321', capacity: 220 },
  ],
  regional: [
    { name: 'Boeing 737', capacity: 189 },
    { name: 'Airbus A320', capacity: 180 },
    { name: 'Airbus A330', capacity: 290 },
  ],
  'long-haul': [
    { name: 'Boeing 787', capacity: 296 },
    { name: 'Airbus A350', capacity: 315 },
    { name: 'Boeing 777', capacity: 368 },
    { name: 'Airbus A380', capacity: 575 },
  ],
};

// ============================================================
// Currency exchange rates (relative to USD)
// ============================================================
const FX_RATES: Record<string, number> = {
  INR: 83,
  JPY: 150,
  EUR: 0.92,
  AED: 3.67,
  USD: 1,
  BDT: 110,
};

// Country → Currency
const COUNTRY_CURRENCY: Record<string, string> = {
  IN: 'INR',
  JP: 'JPY',
  DE: 'EUR',
  AE: 'AED',
  US: 'USD',
  BD: 'BDT',
};

// ============================================================
// Flight time slots by route type
// ============================================================
const DEPARTURE_SLOTS: Record<string, number[]> = {
  domestic: [6, 9, 12, 15, 18, 21],
  regional: [7, 11, 15, 19, 23],
  'long-haul': [2, 10, 14, 22], // overnight flights included
};

// ============================================================
// Duration calculation
// ============================================================
function calculateDuration(distanceKm: number, type: string): number {
  // Long-haul: faster per km
  if (type === 'long-haul') {
    return 60 + Math.round((distanceKm / 100) * 8); // 8 min per 100 km
  }
  return 30 + Math.round((distanceKm / 100) * 12);
}

// ============================================================
// Price calculation with dynamic multipliers
// ============================================================
function calculateFlightPrice(
  baseUSD: number,
  departureTime: Date,
  type: string
): number {
  const hour = departureTime.getUTCHours();
  const dow = departureTime.getUTCDay();
  const isWeekend = dow === 0 || dow === 6;

  let multiplier = 1.0;

  // Peak hours
  if (hour >= 6 && hour <= 9) multiplier += 0.12;
  if (hour >= 17 && hour <= 21) multiplier += 0.15;
  if (hour >= 0 && hour <= 4) multiplier -= 0.10; // Red-eye discount

  // Weekend premium
  if (isWeekend) multiplier += 0.10;

  // Type-based variation
  if (type === 'long-haul') multiplier += 0.05;

  // Random noise ±10%
  multiplier += (Math.random() - 0.5) * 0.2;

  return baseUSD * multiplier;
}

// ============================================================
// Determine currency based on departure airport
// ============================================================
function getCurrencyForAirport(airportCode: string): string {
  const airport = AIRPORTS[airportCode];
  if (!airport) return 'USD';
  return COUNTRY_CURRENCY[airport.countryCode] || 'USD';
}

// ============================================================
// Main seed function
// ============================================================
async function main() {
  console.log('🧹 Cleaning existing data...');
  await prisma.booking.deleteMany({});
  await prisma.flight.deleteMany({});
  console.log('✅ Cleaned');

  console.log('\n🌍 Generating global airline schedule...');
  console.log(`   Airports: ${Object.keys(AIRPORTS).length}`);
  console.log(`   Routes: ${ROUTES.length}`);
  console.log(`   Days: 60`);
  console.log('');

  const now = new Date();
  const flights = [];

  // Generate flights for next 60 days
  for (let day = 0; day < 60; day++) {
    const flightDate = new Date(now);
    flightDate.setUTCDate(flightDate.getUTCDate() + day);
    flightDate.setUTCHours(0, 0, 0, 0);

    for (let routeIdx = 0; routeIdx < ROUTES.length; routeIdx++) {
      const route = ROUTES[routeIdx];
      const fromAirport = AIRPORTS[route.from];
      const toAirport = AIRPORTS[route.to];

      // Determine flights per day
      let flightsPerDay: number;
      if (route.type === 'domestic') flightsPerDay = 4;
      else if (route.type === 'regional') flightsPerDay = 2;
      else flightsPerDay = 1; // long-haul: 1 per day

      // Popular routes get more flights
      const isPopular =
        ['DEL', 'BOM'].includes(route.from) && ['NRT', 'DXB', 'FRA', 'JFK'].includes(route.to);
      if (isPopular) flightsPerDay = Math.max(flightsPerDay, 2);

      // Pick slots
      const slots = DEPARTURE_SLOTS[route.type];
      const selectedSlots = [...slots]
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(flightsPerDay, slots.length))
        .sort((a, b) => a - b);

      for (let slotIdx = 0; slotIdx < selectedSlots.length; slotIdx++) {
        const departureHour = selectedSlots[slotIdx];
        const departureTime = new Date(flightDate);
        departureTime.setUTCHours(departureHour, Math.floor(Math.random() * 60), 0, 0);

        const durationMin = calculateDuration(route.distanceKm, route.type);
        const arrivalTime = new Date(departureTime.getTime() + durationMin * 60 * 1000);

        // Currency (based on departure country)
        const currency = getCurrencyForAirport(route.from);
        const fxRate = FX_RATES[currency];

        // Final price in local currency
        const priceUSD = calculateFlightPrice(route.baseUSD, departureTime, route.type);
        const finalPrice = Math.round(priceUSD * fxRate);

        // Aircraft
        const aircraftPool = AIRCRAFT[route.type as keyof typeof AIRCRAFT];
        const aircraft = aircraftPool[Math.floor(Math.random() * aircraftPool.length)];

        // Seat availability (60-100%)
        const seatsAvailable = Math.floor(aircraft.capacity * (0.6 + Math.random() * 0.4));

        flights.push({
          flightNumber: `SW${String(routeIdx + 1).padStart(3, '0')}${slotIdx + 1}-${day}${slotIdx}`,
          airline: 'SkyWings',
          fromCode: fromAirport.code,
          fromCity: fromAirport.city,
          toCode: toAirport.code,
          toCity: toAirport.city,
          departureTime,
          arrivalTime,
          basePrice: finalPrice,
          currency,
          seatsAvailable,
          aircraft: aircraft.name,
        });
      }
    }
  }

  console.log(`📊 Total flights to create: ${flights.length}`);

  // Batch insert
  const CHUNK_SIZE = 500;
  for (let i = 0; i < flights.length; i += CHUNK_SIZE) {
    const chunk = flights.slice(i, i + CHUNK_SIZE);
    await prisma.flight.createMany({
      data: chunk,
      skipDuplicates: true,
    });
    console.log(`   ✅ Inserted ${Math.min(i + CHUNK_SIZE, flights.length)} / ${flights.length}`);
  }

  // Summary
  const totalFlights = await prisma.flight.count();
  const routeCount = await prisma.flight.groupBy({
    by: ['fromCode', 'toCode'],
    _count: { id: true },
  });

  console.log(`\n✅ Seed complete!`);
  console.log(`\n📊 Summary:`);
  console.log(`   Total flights: ${totalFlights}`);
  console.log(`   Unique routes: ${routeCount.length}`);

  // Top routes by country
  const countries = new Set(Object.values(AIRPORTS).map(a => a.country));
  console.log(`   Countries: ${countries.size} (${Array.from(countries).join(', ')})`);

  console.log(`\n📅 Date range:`);
  const minDate = await prisma.flight.findFirst({ orderBy: { departureTime: 'asc' } });
  const maxDate = await prisma.flight.findFirst({ orderBy: { departureTime: 'desc' } });
  console.log(`   From: ${minDate?.departureTime.toISOString().split('T')[0]}`);
  console.log(`   To:   ${maxDate?.departureTime.toISOString().split('T')[0]}`);

  console.log(`\n🌏 Sample international routes:`);
  const intlSample = await prisma.flight.findMany({
    where: {
      OR: [
        { fromCode: 'DEL', toCode: 'NRT' },
        { fromCode: 'NRT', toCode: 'FRA' },
        { fromCode: 'DXB', toCode: 'JFK' },
      ],
    },
    take: 3,
  });
  intlSample.forEach(f => {
    console.log(`   ${f.flightNumber}: ${f.fromCity} → ${f.toCity} (${f.currency} ${f.basePrice})`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
