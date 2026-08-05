import en from './en.json';
import ar from './ar.json';
import { Locale } from '../types';

const translations = { en, ar } as const;

type TranslationKey = typeof en;
type NestedKeyOf<T> = T extends object
  ? { [K in keyof T & string]: T[K] extends object ? `${K}.${NestedKeyOf<T[K]>}` : K }[keyof T & string]
  : never;

export type TranslationKeyPath = NestedKeyOf<TranslationKey>;

export function t(key: string, locale: Locale, params?: Record<string, string | number>): string {
  const keys = key.split('.');
  let value: unknown = translations[locale];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      // Fallback to English
      value = translations.en;
      for (const fk of keys) {
        if (value && typeof value === 'object' && fk in value) {
          value = (value as Record<string, unknown>)[fk];
        } else {
          return key;
        }
      }
      break;
    }
  }

  if (typeof value !== 'string') return key;

  if (params) {
    return Object.entries(params).reduce(
      (str, [k, v]) => str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
      value
    );
  }

  return value;
}

export function getDirection(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export function isRTL(locale: Locale): boolean {
  return locale === 'ar';
}
