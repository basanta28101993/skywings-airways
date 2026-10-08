import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generatePNR(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pnr = 'SW';
  for (let i = 0; i < 6; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pnr;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flightId, passengerName, passengerEmail, passengerPhone } = body;

    // Validation
    if (!flightId || !passengerName || !passengerEmail) {
      return NextResponse.json(
        { error: 'flightId, passengerName, and passengerEmail are required' },
        { status: 400 }
      );
    }

    // Check flight exists
    const flight = await prisma.flight.findUnique({ where: { id: flightId } });
    if (!flight) {
      return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
    }

    if (flight.seatsAvailable < 1) {
      return NextResponse.json(
        { error: 'No seats available on this flight' },
        { status: 400 }
      );
    }

    // Transaction: create booking + decrement seats
    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          pnr: generatePNR(),
          flightId,
          passengerName,
          passengerEmail,
          passengerPhone: passengerPhone || '',
          totalPrice: flight.basePrice,
          currency: flight.currency,
          status: 'CONFIRMED',
        },
      });

      await tx.flight.update({
        where: { id: flightId },
        data: { seatsAvailable: { decrement: 1 } },
      });

      return newBooking;
    });

    return NextResponse.json({
      success: true,
      message: 'Booking confirmed!',
      booking,
    });
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { error: 'Booking failed. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: { flight: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error('Bookings fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
