import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Locale, TranslationStrings, TranslationKey } from '@/i18n/types';
import { DEFAULT_LOCALE, getLocaleInfo, isValidLocale } from '@/i18n/locales';
import { loadTranslations, en } from '@/i18n/translations';
import { STORAGE_KEYS } from '@/lib/constants';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function detectBrowserLocale(): Locale {
  const browserLang = navigator.language.split('-')[0];
  if (isValidLocale(browserLang)) {
    return browserLang;
  }
  return DEFAULT_LOCALE;
}

function getStoredLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEYS.LOCALE);
  if (stored && isValidLocale(stored)) {
    return stored;
  }
  return detectBrowserLocale();
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getStoredLocale);
  const [translations, setTranslations] = useState<TranslationStrings>(en);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const localeInfo = getLocaleInfo(locale);
    if (localeInfo) {
      document.documentElement.dir = localeInfo.dir;
      document.documentElement.lang = locale;
    }
  }, [locale]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (locale === 'en') {
        setTranslations(en);
        return;
      }

      setIsLoading(true);
      try {
        const loaded = await loadTranslations(locale);
        if (!cancelled) {
          setTranslations(loaded);
        }
      } catch {
        if (!cancelled) {
          setTranslations(en);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEYS.LOCALE, newLocale);
  }, []);

  const t = useCallback((key: TranslationKey, params?: Record<string, string | number>): string => {
    let text = translations[key] || en[key] || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replace(new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g'), String(value));
      });
    }

    return text;
  }, [translations]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isLoading }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
