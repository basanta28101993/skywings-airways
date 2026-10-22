import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './routing';

const intlMiddleware = createMiddleware(routing);

const COUNTRY_TO_LOCALE: Record<string, string> = {
  'IN': 'in',
  'JP': 'jp',
  'DE': 'de',
  'AE': 'ae',
  'US': 'us',
  'BD': 'bd',
  'GB': 'us',
  'SG': 'us',
  'CA': 'us',
  'AU': 'us',
};

const BROWSER_LANG_TO_LOCALE: Record<string, string> = {
  'en': 'in',
  'hi': 'in',
  'ja': 'jp',
  'de': 'de',
  'ar': 'ae',
  'bn': 'bd',
};

function detectLocale(request: NextRequest): string {
  // 1. Azure Front Door (HIGHEST PRIORITY)
  const azureCountry = 
    request.headers.get('x-azure-country') ||
    request.headers.get('x-country');
  if (azureCountry && COUNTRY_TO_LOCALE[azureCountry]) {
    return COUNTRY_TO_LOCALE[azureCountry];
  }

  // 2. Cloudflare fallback
  const cfCountry = request.headers.get('cf-ipcountry');
  if (cfCountry && COUNTRY_TO_LOCALE[cfCountry]) {
    return COUNTRY_TO_LOCALE[cfCountry];
  }

  // 3. Browser Accept-Language
  const acceptLang = request.headers.get('accept-language') || '';
  const primaryLang = acceptLang.split(',')[0]?.split('-')[0]?.toLowerCase();
  if (primaryLang && BROWSER_LANG_TO_LOCALE[primaryLang]) {
    return BROWSER_LANG_TO_LOCALE[primaryLang];
  }

  return 'in';
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = routing.locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (hasLocale) {
    return intlMiddleware(request);
  }

  const locale = detectLocale(request);

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
