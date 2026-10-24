'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Demand Forecasting', path: '/admin/demand', icon: '📊' },
    { name: 'Fraud Detection', path: '/admin/fraud', icon: '🛡️' },
    { name: 'Customer Segmentation', path: '/admin/segmentation', icon: '🎯' },
    { name: 'Recommendation', path: '/admin/recommendation', icon: '✨' },
    { name: 'Anomaly Detection', path: '/admin/anomaly', icon: '📈' },
    { name: 'Passport OCR', path: '/admin/ocr', icon: '📄' },
    { name: 'AI Chatbot', path: '/admin/chatbot', icon: '🤖' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            ✈️ SkyWings
          </h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Admin Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            // Check if current path includes the menu path
            const isActive = pathname.includes(item.path);
            
            return (
              <Link
                key={item.path}
                href={`/in${item.path}`} // Defaulting to 'in' locale for admin
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white font-semibold' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Link href="/in" className="text-sm text-gray-400 hover:text-white flex items-center gap-2">
            ← Back to Main Site
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
