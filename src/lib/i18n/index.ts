import { vi } from './vi';
import { en } from './en';

export const dictionaries = {
  vi,
  en
} as const;

export type Language = keyof typeof dictionaries;
export type Dictionary = typeof vi;

// Helper to get nested property safely based on key string like "settings.header.title"
export const getTranslation = (lang: Language, key: string): string => {
  const keys = key.split('.');
  let current: any = dictionaries[lang];
  
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      console.warn(`Translation key not found: ${key} for language: ${lang}`);
      return key; // Fallback to key itself
    }
  }
  
  return typeof current === 'string' ? current : key;
};
