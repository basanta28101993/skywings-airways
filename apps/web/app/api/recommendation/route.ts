import { NextRequest, NextResponse } from 'next/server';

const RECOMMENDATION_SERVICE_URL = process.env.RECOMMENDATION_SERVICE_URL || 'http://localhost:8004';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const mlRes = await fetch(`${RECOMMENDATION_SERVICE_URL}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: body.email, top_n: body.top_n || 3 }),
    });

    const data = await mlRes.json();

    if (!mlRes.ok) {
      return NextResponse.json(data, { status: mlRes.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Recommendation service unavailable', details: error.message },
      { status: 503 }
    );
  }
}
