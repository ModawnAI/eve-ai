import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { defaultLocale, locales, type Locale } from './config';

export default getRequestConfig(async () => {
  // Try to get locale from cookie first
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value as Locale | undefined;

  if (localeCookie && locales.includes(localeCookie)) {
    return {
      locale: localeCookie,
      messages: (await import(`./messages/${localeCookie}.json`)).default,
    };
  }

  // Fall back to Accept-Language header
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';

  // Parse Accept-Language header
  const preferredLocales = acceptLanguage
    .split(',')
    .map(lang => {
      const [locale] = lang.trim().split(';');
      return locale.toLowerCase();
    });

  // Find first matching locale
  for (const preferred of preferredLocales) {
    if (preferred.startsWith('zh')) {
      return {
        locale: 'zh-CN' as Locale,
        messages: (await import('./messages/zh-CN.json')).default,
      };
    }
    if (preferred.startsWith('en')) {
      return {
        locale: 'en' as Locale,
        messages: (await import('./messages/en.json')).default,
      };
    }
  }

  // Default fallback
  return {
    locale: defaultLocale,
    messages: (await import(`./messages/${defaultLocale}.json`)).default,
  };
});
