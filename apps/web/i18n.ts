import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing, localeToLanguage } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const lang = localeToLanguage[locale as keyof typeof localeToLanguage];
  return {
    locale,
    messages: (await import(`./locales/${lang}.json`)).default,
  };
});
