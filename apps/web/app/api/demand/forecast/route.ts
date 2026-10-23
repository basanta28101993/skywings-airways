import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const route = searchParams.get('route');       // e.g., "DEL-BOM"
  const dateStr = searchParams.get('date');       // e.g., "2026-12-01"

  if (!route || !dateStr) {
    return NextResponse.json(
      { error: 'Missing route or date parameter' },
      { status: 400 }
    );
  }

  const [fromCode, toCode] = route.split('-');
  const targetDate = new Date(dateStr);

  // 1. Fetch last 14 days of metrics for this route
  const recentMetrics = await prisma.dailyRouteMetrics.findMany({
    where: { route },
    orderBy: { date: 'desc' },
    take: 14,
  });

  if (recentMetrics.length < 7) {
    return NextResponse.json(
      { error: 'Not enough historical data for this route' },
      { status: 404 }
    );
  }

  // 2. Compute lag and rolling features
  const bookings = recentMetrics.map((m) => m.bookings);
  const lag_1d = bookings[0];
  const lag_7d = bookings[6] || bookings[0];
  const lag_14d = bookings[13] || bookings[6];

  const rolling_mean_7d = bookings.slice(0, 7).reduce((a, b) => a + b, 0) / 7;
  const rolling_mean_14d = bookings.reduce((a, b) => a + b, 0) / bookings.length;

  const mean_7d = rolling_mean_7d;
  const variance_7d =
    bookings.slice(0, 7).reduce((sum, b) => sum + Math.pow(b - mean_7d, 2), 0) / 7;
  const rolling_std_7d = Math.sqrt(variance_7d);

  const mean_14d = rolling_mean_14d;
  const variance_14d =
    bookings.reduce((sum, b) => sum + Math.pow(b - mean_14d, 2), 0) / bookings.length;
  const rolling_std_14d = Math.sqrt(variance_14d);

  // 3. Calendar features for target date
  const dow = targetDate.getDay() === 0 ? 6 : targetDate.getDay() - 1; // 0=Mon
  const month = targetDate.getMonth() + 1;
  const dayOfMonth = targetDate.getDate();
  const quarter = Math.ceil(month / 3);
  const weekOfYear = Math.ceil(
    ((targetDate.getTime() - new Date(targetDate.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7
  );

  const dow_sin = Math.sin((2 * Math.PI * dow) / 7);
  const dow_cos = Math.cos((2 * Math.PI * dow) / 7);
  const month_sin = Math.sin((2 * Math.PI * month) / 12);
  const month_cos = Math.cos((2 * Math.PI * month) / 12);

  // 4. Build payload for ML service
  const payload = {
    route,
    from_code: fromCode,
    to_code: toCode,
    cancellations: recentMetrics[0].cancellations,
    loadFactor: recentMetrics[0].loadFactor,
    isWeekend: dow >= 5,
    isHoliday: recentMetrics[0].isHoliday,
    weatherScore: recentMetrics[0].weatherScore || 7.5,
    competitorFare: recentMetrics[0].competitorFare
      ? Number(recentMetrics[0].competitorFare)
      : 0,
    promotionActive: recentMetrics[0].promotionActive,
    day_of_week: dow,
    month: month,
    day_of_month: dayOfMonth,
    quarter: quarter,
    week_of_year: weekOfYear,
    is_weekend_calc: dow >= 5 ? 1 : 0,
    dow_sin: Number(dow_sin.toFixed(4)),
    dow_cos: Number(dow_cos.toFixed(4)),
    month_sin: Number(month_sin.toFixed(4)),
    month_cos: Number(month_cos.toFixed(4)),
    lag_1d: Number(lag_1d),
    lag_7d: Number(lag_7d),
    lag_14d: Number(lag_14d),
    rolling_mean_7d: Number(rolling_mean_7d.toFixed(2)),
    rolling_std_7d: Number(rolling_std_7d.toFixed(2)),
    rolling_mean_14d: Number(rolling_mean_14d.toFixed(2)),
    rolling_std_14d: Number(rolling_std_14d.toFixed(2)),
  };

  // 5. Call ML service
  try {
    const mlRes = await fetch(
      `${process.env.DEMAND_SERVICE_URL}/predict-demand`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    if (!mlRes.ok) {
      throw new Error(`ML service error: ${mlRes.status}`);
    }

    const mlResult = await mlRes.json();

    return NextResponse.json({
      route,
      targetDate: dateStr,
      predictedBookings: mlResult.predicted_bookings,
      confidence: mlResult.confidence,
      recentAverage:
        Math.round(
          (recentMetrics.slice(0, 7).reduce((a, b) => a + b.bookings, 0) / 7) * 10
        ) / 10,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'ML Service unavailable', details: error.message },
      { status: 503 }
    );
  }
}
