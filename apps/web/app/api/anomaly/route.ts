import { NextRequest, NextResponse } from 'next/server';

const ANOMALY_SERVICE_URL = process.env.ANOMALY_SERVICE_URL || 'http://localhost:8005';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.cpuUsage === undefined || body.latency === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const mlRes = await fetch(`${ANOMALY_SERVICE_URL}/predict-anomaly`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await mlRes.json();

    if (!mlRes.ok) {
      return NextResponse.json(data, { status: mlRes.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Anomaly service unavailable', details: error.message },
      { status: 503 }
    );
  }
}
