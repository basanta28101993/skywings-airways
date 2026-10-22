import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

interface MLPricingResponse {
  base_price: number;
  dynamic_price: number;
  multiplier: number;
  surge_reason: string;
  confidence: string;
}

async function getDynamicPrice(flight: any): Promise<{
  dynamicPrice: number;
  multiplier: number;
  reason: string;
  confidence: string;
}> {
  try {
    const now = new Date();
    const departure = new Date(flight.departureTime);
    const daysUntil = Math.max(
      1,
      Math.ceil((departure.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );

    const response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from_code: flight.fromCode,
        to_code: flight.toCode,
        base_price: parseFloat(flight.basePrice),
        days_until_flight: daysUntil,
        departure_hour: departure.getUTCHours(),
        day_of_week: departure.getUTCDay(),
        seats_available: flight.seatsAvailable,
        is_weekend: [0, 6].includes(departure.getUTCDay()) ? 1 : 0,
        is_holiday: 0,
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`ML service returned ${response.status}`);
    }

    const data: MLPricingResponse = await response.json();

    return {
      dynamicPrice: data.dynamic_price || parseFloat(flight.basePrice),
      multiplier: data.multiplier || 1.0,
      reason: data.surge_reason || 'Standard pricing',
      confidence: data.confidence || 'medium',
    };
  } catch (error) {
    console.error('ML service unavailable, using base price:', error);
    return {
      dynamicPrice: parseFloat(flight.basePrice),
      multiplier: 1.0,
      reason: 'Standard pricing',
      confidence: 'fallback',
    };
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get('from')?.toUpperCase();
  const to = searchParams.get('to')?.toUpperCase();
  const date = searchParams.get('date');

  if (!from || !to) {
    return NextResponse.json(
      { error: 'from and to parameters are required' },
      { status: 400 }
    );
  }

  try {
    const flights = await prisma.flight.findMany({
      where: {
        fromCode: from,
        toCode: to,
        ...(date && {
          departureTime: {
            gte: new Date(date),
            lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
          },
        }),
      },
      orderBy: { departureTime: 'asc' },
    });

    // Enrich flights with ML pricing (parallel)
    const enrichedFlights = await Promise.all(
      flights.map(async (flight) => {
        const pricing = await getDynamicPrice(flight);
        return {
          ...flight,
          dynamicPrice: pricing.dynamicPrice,
          priceMultiplier: pricing.multiplier,
          surgeReason: pricing.reason,
          priceConfidence: pricing.confidence,
        };
      })
    );

    return NextResponse.json({
      success: true,
      count: enrichedFlights.length,
      flights: enrichedFlights,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
