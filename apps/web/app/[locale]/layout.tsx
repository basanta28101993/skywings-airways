import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/routing';
import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'SkyWings Airways',
  description: 'Book flights worldwide with SkyWings Airways',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const dir = locale === 'ae' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body className="antialiased">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
