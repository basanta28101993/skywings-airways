import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['in', 'jp', 'de', 'ae', 'us', 'bd'],
  defaultLocale: 'in',
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];

export const localeToLanguage: Record<Locale, string> = {
  'in': 'en',
  'jp': 'ja',
  'de': 'de',
  'ae': 'ar',
  'us': 'en',
  'bd': 'bn',
};
