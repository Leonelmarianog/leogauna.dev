import { defaultLocale, ui, type Locale, type UiKey } from './ui';

export function useTranslations(locale: Locale) {
  return function t(key: UiKey): string {
    return ui[locale][key];
  };
}

/**
 * The path of a page with its Locale prefix removed, so it can be passed to
 * `getRelativeLocaleUrl` or `getAbsoluteLocaleUrl` for any Locale.
 * For example `/es/` and `/` both give `''`.
 */
export function pathWithoutLocale(pathname: string, locale: Locale): string {
  const prefix = locale === defaultLocale ? '/' : `/${locale}/`;
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return path.startsWith(prefix) ? path.slice(prefix.length) : path.slice(1);
}
