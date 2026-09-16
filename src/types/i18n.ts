export type Locale = 'ar' | 'fr' | 'en';

export interface I18nConfig {
  defaultLocale: Locale;
  locales: Locale[];
}

export type Dictionary = Record<string, any>;
