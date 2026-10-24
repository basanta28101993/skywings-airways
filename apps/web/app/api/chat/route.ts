import { NextRequest, NextResponse } from 'next/server';

const CHATBOT_SERVICE_URL = process.env.CHATBOT_SERVICE_URL || 'http://localhost:8007';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const mlRes = await fetch(`${CHATBOT_SERVICE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: body.message,
        history: body.history || [],
      }),
    });

    if (!mlRes.ok) {
      throw new Error(`ML service error: ${mlRes.status}`);
    }

    const data = await mlRes.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Chatbot service unavailable', details: error.message },
      { status: 503 }
    );
  }
}
