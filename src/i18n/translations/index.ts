import type { Locale, TranslationStrings } from '../types';
import { en } from './en';

const translationCache: Partial<Record<Locale, TranslationStrings>> = {
  en,
};

export async function loadTranslations(locale: Locale): Promise<TranslationStrings> {
  if (translationCache[locale]) {
    return translationCache[locale]!;
  }

  let translations: TranslationStrings;

  switch (locale) {
    case 'es':
      translations = (await import('./es')).es;
      break;
    case 'pt':
      translations = (await import('./pt')).pt;
      break;
    case 'fr':
      translations = (await import('./fr')).fr;
      break;
    case 'de':
      translations = (await import('./de')).de;
      break;
    case 'it':
      translations = (await import('./it')).it;
      break;
    case 'ru':
      translations = (await import('./ru')).ru;
      break;
    case 'zh':
      translations = (await import('./zh')).zh;
      break;
    case 'ja':
      translations = (await import('./ja')).ja;
      break;
    case 'ko':
      translations = (await import('./ko')).ko;
      break;
    case 'ar':
      translations = (await import('./ar')).ar;
      break;
    case 'hi':
      translations = (await import('./hi')).hi;
      break;
    default:
      translations = en;
  }

  translationCache[locale] = translations;
  return translations;
}

export { en };
