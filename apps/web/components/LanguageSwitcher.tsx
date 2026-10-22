'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/navigation';
import { useState } from 'react';

const LANGUAGES = [
  { code: 'in', flag: '🇮🇳', name: 'English', nativeName: 'English' },
  { code: 'jp', flag: '🇯🇵', name: 'Japanese', nativeName: '日本語' },
  { code: 'de', flag: '🇩🇪', name: 'German', nativeName: 'Deutsch' },
  { code: 'ae', flag: '🇦🇪', name: 'Arabic', nativeName: 'العربية' },
  { code: 'bd', flag: '🇧🇩', name: 'Bangla', nativeName: 'বাংলা' },
  { code: 'us', flag: '🇺🇸', name: 'English (US)', nativeName: 'English' },
] as const;

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const currentLang = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  const handleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as any });
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition font-medium text-gray-700"
      >
        <span className="text-xl">{currentLang.flag}</span>
        <span className="hidden md:inline">{currentLang.nativeName}</span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleChange(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-blue-50 transition text-left ${
                  locale === lang.code ? 'bg-blue-50 font-semibold text-blue-600' : 'text-gray-700'
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <div className="flex flex-col">
                  <span className="text-sm">{lang.nativeName}</span>
                  <span className="text-xs text-gray-400">{lang.name}</span>
                </div>
                {locale === lang.code && <span className="ml-auto text-blue-600">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
