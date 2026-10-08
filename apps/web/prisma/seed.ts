import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding flights...');

  const flights = [
    // Delhi → Mumbai
    {
      flightNumber: 'SW101',
      airline: 'SkyWings',
      fromCode: 'DEL', fromCity: 'Delhi',
      toCode: 'BOM', toCity: 'Mumbai',
      departureTime: new Date('2026-12-01T06:00:00Z'),
      arrivalTime: new Date('2026-12-01T08:15:00Z'),
      basePrice: 4500, currency: 'INR',
      seatsAvailable: 120, aircraft: 'Airbus A320',
    },
    {
      flightNumber: 'SW102',
      airline: 'SkyWings',
      fromCode: 'DEL', fromCity: 'Delhi',
      toCode: 'BOM', toCity: 'Mumbai',
      departureTime: new Date('2026-12-01T14:30:00Z'),
      arrivalTime: new Date('2026-12-01T16:45:00Z'),
      basePrice: 5200, currency: 'INR',
      seatsAvailable: 85, aircraft: 'Boeing 737',
    },
    // Mumbai → Goa
    {
      flightNumber: 'SW201',
      airline: 'SkyWings',
      fromCode: 'BOM', fromCity: 'Mumbai',
      toCode: 'GOA', toCity: 'Goa',
      departureTime: new Date('2026-12-02T09:00:00Z'),
      arrivalTime: new Date('2026-12-02T10:15:00Z'),
      basePrice: 2800, currency: 'INR',
      seatsAvailable: 150, aircraft: 'ATR 72',
    },
    // Delhi → Bangalore
    {
      flightNumber: 'SW301',
      airline: 'SkyWings',
      fromCode: 'DEL', fromCity: 'Delhi',
      toCode: 'BLR', toCity: 'Bangalore',
      departureTime: new Date('2026-12-01T10:00:00Z'),
      arrivalTime: new Date('2026-12-01T12:45:00Z'),
      basePrice: 6200, currency: 'INR',
      seatsAvailable: 95, aircraft: 'Airbus A321',
    },
    // Bangalore → Mumbai
    {
      flightNumber: 'SW401',
      airline: 'SkyWings',
      fromCode: 'BLR', fromCity: 'Bangalore',
      toCode: 'BOM', toCity: 'Mumbai',
      departureTime: new Date('2026-12-03T08:30:00Z'),
      arrivalTime: new Date('2026-12-03T10:30:00Z'),
      basePrice: 3800, currency: 'INR',
      seatsAvailable: 110, aircraft: 'Airbus A320',
    },
    // Mumbai → Delhi
    {
      flightNumber: 'SW501',
      airline: 'SkyWings',
      fromCode: 'BOM', fromCity: 'Mumbai',
      toCode: 'DEL', toCity: 'Delhi',
      departureTime: new Date('2026-12-04T18:00:00Z'),
      arrivalTime: new Date('2026-12-04T20:15:00Z'),
      basePrice: 4800, currency: 'INR',
      seatsAvailable: 75, aircraft: 'Boeing 737',
    },
  ];

  for (const flight of flights) {
    await prisma.flight.upsert({
      where: { flightNumber: flight.flightNumber },
      update: {},
      create: flight,
    });
  }

  console.log(`✅ Seeded ${flights.length} flights`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
