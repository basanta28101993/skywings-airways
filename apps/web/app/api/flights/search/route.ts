import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    return NextResponse.json({
      success: true,
      count: flights.length,
      flights,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
