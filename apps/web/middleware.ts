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

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if path already has locale prefix
  const hasLocale = routing.locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (hasLocale) {
    return intlMiddleware(request);
  }

  // Detect country
  const country =
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry') ||
    'IN';

  const locale = COUNTRY_TO_LOCALE[country] || 'in';

  // Redirect to locale-prefixed URL
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
