'use client';

import { useState } from 'react';
import Link from 'next/link';

interface OCRData {
  raw_text: string;
  extracted_data: {
    name: string | null;
    dob: string | null;
    document_number: string | null;
  };
}

export default function OCRDashboard() {
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<OCRData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImage(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/ocr/scan', {
        method: 'POST',
        body: formData,
      });
      
      // Check if the response is actually JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server error: ${res.status} ${res.statusText}. The API route might be missing.`);
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.details || 'Failed to scan document');
      }

      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-4xl">📄</span> Passport OCR Scanner
          </h1>
          <p className="text-gray-500 mt-2">Upload a passport or ID image to auto-extract passenger details.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
            {image ? (
              <img src={image} alt="Uploaded Passport" className="max-h-64 object-contain mb-4 rounded-lg shadow" />
            ) : (
              <div className="text-center text-gray-400 py-12">
                <p className="text-6xl mb-4">📸</p>
                <p>Select an image to scan</p>
              </div>
            )}
            
            <label className="block w-full mt-4">
              <span className="sr-only">Choose passport image</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-3 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100 transition"
              />
            </label>

            <button 
              onClick={handleUpload} 
              disabled={!file || loading}
              className="w-full mt-6 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Scanning...' : '🔍 Scan Document'}
            </button>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Extracted Data</h2>
            
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 mb-4">
                <p className="font-bold mb-1">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {!result && !loading && !error && (
              <div className="text-gray-400 text-center py-12">Results will appear here.</div>
            )}

            {loading && (
              <div className="text-center text-blue-500 py-12">
                <p className="text-4xl mb-4 animate-spin">⏳</p>
                <p>Extracting text...</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-xs text-blue-500 uppercase font-bold tracking-wider">Name</p>
                  <p className="text-xl font-bold text-gray-800">{result.extracted_data.name || 'Not found'}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-xs text-blue-500 uppercase font-bold tracking-wider">Date of Birth</p>
                  <p className="text-xl font-bold text-gray-800">{result.extracted_data.dob || 'Not found'}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-xs text-blue-500 uppercase font-bold tracking-wider">Document Number</p>
                  <p className="text-xl font-bold text-gray-800">{result.extracted_data.document_number || 'Not found'}</p>
                </div>
              </div>
            )}
          </div>

        </div>

        <div className="mt-8">
          <Link href="/in" className="text-blue-600 hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
