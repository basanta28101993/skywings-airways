import { NextRequest, NextResponse } from 'next/server';

const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL || 'http://localhost:8006';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const mlFormData = new FormData();
    mlFormData.append('file', file);

    const mlRes = await fetch(`${OCR_SERVICE_URL}/scan-document`, {
      method: 'POST',
      body: mlFormData,
    });

    if (!mlRes.ok) {
      const errorText = await mlRes.text();
      return NextResponse.json(
        { error: `ML Service Error: ${errorText}` },
        { status: mlRes.status }
      );
    }

    const data = await mlRes.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'OCR service unavailable', details: error.message },
      { status: 503 }
    );
  }
}
