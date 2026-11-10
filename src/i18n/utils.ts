import { ui, type Locale, type UiKey } from './ui';

export function useTranslations(locale: Locale) {
  return function t(key: UiKey): string {
    return ui[locale][key];
  };
}
