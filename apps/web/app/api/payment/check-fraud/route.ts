import { NextRequest, NextResponse } from 'next/server';

const FRAUD_SERVICE_URL = process.env.FRAUD_SERVICE_URL || 'http://localhost:8002';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validate required fields
    if (!body.amount || !body.paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 🛡️ 2. Rule Engine: Hard limits (Enterprise Safety Net)
    // If the amount exceeds our maximum allowed limit, block it immediately 
    // before even calling the ML model.
    if (body.amount > 500000) {
      return NextResponse.json({
        is_fraud: true,
        fraud_probability: 1.0,
        risk_level: 'High',
        message: 'Transaction blocked: Amount exceeds maximum allowed limit (500,000 INR).'
      });
    }

    // 3. Call the ML Fraud Service
    const mlRes = await fetch(`${FRAUD_SERVICE_URL}/predict-fraud`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: body.amount,
        paymentMethod: body.paymentMethod,
        ipCountry: body.ipCountry || 'IN',
        billingCountry: body.billingCountry || 'IN',
        deviceType: body.deviceType || 'web',
        bookingHour: body.bookingHour || new Date().getHours(),
      }),
    });

    if (!mlRes.ok) throw new Error('ML Service failed');

    const result = await mlRes.json();

    // 4. Business Logic: If high risk, block the payment
    if (result.risk_level === 'High') {
      return NextResponse.json({
        ...result,
        message: 'Transaction blocked due to high fraud risk.',
      });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Fraud check service unavailable', details: error.message },
      { status: 503 }
    );
  }
}
