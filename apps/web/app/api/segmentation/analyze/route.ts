import { NextRequest, NextResponse } from 'next/server';

const SEGMENTATION_SERVICE_URL = process.env.SEGMENTATION_SERVICE_URL || 'http://localhost:8003';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const mlRes = await fetch(`${SEGMENTATION_SERVICE_URL}/segment-customer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: body.email }),
    });

    const data = await mlRes.json();

    if (!mlRes.ok) {
      return NextResponse.json(data, { status: mlRes.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Segmentation service unavailable', details: error.message },
      { status: 503 }
    );
  }
}
