/**
 * @fileoverview Internationalization (i18n) context for the radio app.
 *
 * This module provides multi-language support using React Context:
 * - Supports 12 languages with lazy-loaded translations
 * - Persists language preference in localStorage
 * - Supports URL-based language sharing (?lang=es)
 * - Falls back to browser language detection
 * - Handles RTL (right-to-left) languages like Arabic
 *
 * Architecture:
 * - I18nProvider wraps the app and provides translation state
 * - useI18n hook gives components access to translations
 * - Translation files are dynamically imported to reduce bundle size
 *
 * Language Priority (highest to lowest):
 * 1. URL parameter (?lang=es) - for shared links
 * 2. localStorage - user's previous choice
 * 3. Browser language - navigator.language
 * 4. Default (English) - fallback
 *
 * @example
 * // In App.tsx - wrap with provider
 * <I18nProvider>
 *   <App />
 * </I18nProvider>
 *
 * // In any component - use translations
 * function MyComponent() {
 *   const { t, locale, setLocale } = useI18n();
 *   return <h1>{t('app.name')}</h1>;
 * }
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Locale, TranslationStrings, TranslationKey } from '@/i18n/types';
import { DEFAULT_LOCALE, getLocaleInfo, isValidLocale } from '@/i18n/locales';
import { loadTranslations, en } from '@/i18n/translations';
import { STORAGE_KEYS } from '@/lib/constants';

/**
 * The shape of the i18n context value provided to consumers.
 *
 * @property locale - Current active language code (e.g., 'en', 'es', 'ar')
 * @property setLocale - Function to change the language
 * @property t - Translation function: takes a key and returns the translated string
 * @property isLoading - True while translation files are being loaded
 */
interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  isLoading: boolean;
}

/**
 * React Context for i18n.
 * Initialized as null; will throw if used outside provider.
 */
const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Detects the user's preferred language from the browser.
 *
 * Uses navigator.language which returns values like 'en-US', 'pt-BR'.
 * We extract just the language code part (before the hyphen).
 *
 * @returns A valid Locale if browser language is supported, otherwise DEFAULT_LOCALE
 *
 * @example
 * // If browser is set to Portuguese (Brazil)
 * navigator.language; // 'pt-BR'
 * detectBrowserLocale(); // 'pt'
 */
function detectBrowserLocale(): Locale {
  const browserLang = navigator.language.split('-')[0];
  if (isValidLocale(browserLang)) {
    return browserLang;
  }
  return DEFAULT_LOCALE;
}

/**
 * Checks for a language parameter in the URL.
 *
 * This enables sharing links with a specific language:
 * https://example.com/?station=xxx&lang=es
 *
 * When found, the language is also saved to localStorage so it
 * persists after the URL parameter is removed.
 *
 * @returns The locale from URL if valid, null otherwise
 */
function getUrlLocale(): Locale | null {
  const params = new URLSearchParams(window.location.search);
  const lang = params.get('lang');
  if (lang && isValidLocale(lang)) {
    // Save to localStorage so it persists after URL is cleared
    localStorage.setItem(STORAGE_KEYS.LOCALE, lang);
    return lang;
  }
  return null;
}

/**
 * Determines the initial locale to use on app startup.
 *
 * Priority order:
 * 1. URL parameter (?lang=xx) - highest priority for shared links
 * 2. localStorage value - user's previous preference
 * 3. Browser language - auto-detect from system
 * 4. Default (English) - ultimate fallback
 *
 * @returns The locale to use for the initial render
 */
function getStoredLocale(): Locale {
  // First check URL for shared language
  const urlLocale = getUrlLocale();
  if (urlLocale) {
    return urlLocale;
  }
  // Then check localStorage for saved preference
  const stored = localStorage.getItem(STORAGE_KEYS.LOCALE);
  if (stored && isValidLocale(stored)) {
    return stored;
  }
  // Fall back to browser detection
  return detectBrowserLocale();
}

/**
 * Provider component that supplies i18n context to the app.
 *
 * This component should wrap your entire app at the root level.
 * It manages:
 * - Current locale state
 * - Loading translation files asynchronously
 * - Setting HTML attributes (dir, lang) for accessibility
 *
 * Translation Loading Strategy:
 * - English (en) is bundled with the app (no async load)
 * - Other languages are lazy-loaded only when needed
 * - This keeps the initial bundle small
 *
 * @param props.children - The app content to provide i18n to
 *
 * @example
 * // In main.tsx or App.tsx
 * <I18nProvider>
 *   <RouterProvider router={router} />
 * </I18nProvider>
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  // Initialize with stored/detected locale
  const [locale, setLocaleState] = useState<Locale>(getStoredLocale);
  // Start with English translations (always bundled)
  const [translations, setTranslations] = useState<TranslationStrings>(en);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Effect: Update HTML attributes when locale changes.
   *
   * Sets <html dir="rtl"> for Arabic and other RTL languages.
   * Sets <html lang="xx"> for screen readers and SEO.
   */
  useEffect(() => {
    const localeInfo = getLocaleInfo(locale);
    if (localeInfo) {
      document.documentElement.dir = localeInfo.dir; // 'ltr' or 'rtl'
      document.documentElement.lang = locale;        // 'en', 'ar', etc.
    }
  }, [locale]);

  /**
   * Effect: Load translation file when locale changes.
   *
   * Uses dynamic import() to load translation files on demand.
   * The `cancelled` flag prevents state updates after unmount
   * (prevents the "setState on unmounted component" warning).
   *
   * English is special-cased since it's already bundled.
   */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      // English is bundled, no need to load
      if (locale === 'en') {
        setTranslations(en);
        return;
      }

      setIsLoading(true);
      try {
        // Dynamic import - only loads this language file
        const loaded = await loadTranslations(locale);
        if (!cancelled) {
          setTranslations(loaded);
        }
      } catch {
        // If loading fails, fall back to English
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

    // Cleanup: prevent state updates if component unmounts during load
    return () => {
      cancelled = true;
    };
  }, [locale]);

  /**
   * Changes the current language.
   * Persists the choice to localStorage so it's remembered.
   */
  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEYS.LOCALE, newLocale);
  }, []);

  /**
   * Translation function with parameter interpolation.
   *
   * Looks up a translation key and returns the localized string.
   * Supports parameter replacement using {{param}} syntax.
   *
   * Fallback chain: current locale → English → key itself
   *
   * @param key - The translation key (e.g., 'action.play')
   * @param params - Optional parameters to interpolate
   * @returns The translated string
   *
   * @example
   * // Simple translation
   * t('action.play'); // 'Play' in English, 'Reproducir' in Spanish
   *
   * // With parameters
   * t('welcome.message', { name: 'Jean' });
   * // 'Welcome, {{name}}!' → 'Welcome, Jean!'
   */
  const t = useCallback((key: TranslationKey, params?: Record<string, string | number>): string => {
    // Try current locale, fall back to English, then to the key itself
    let text = translations[key] || en[key] || key;

    // Replace {{param}} placeholders with actual values
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

/**
 * Hook to access i18n functionality from any component.
 *
 * Provides:
 * - `locale`: Current language code
 * - `setLocale`: Function to change language
 * - `t`: Translation function
 * - `isLoading`: True while loading translation files
 *
 * @throws Error if used outside of I18nProvider
 * @returns The i18n context value
 *
 * @example
 * function SettingsPage() {
 *   const { locale, setLocale, t } = useI18n();
 *
 *   return (
 *     <div>
 *       <h1>{t('settings.title')}</h1>
 *       <select value={locale} onChange={e => setLocale(e.target.value as Locale)}>
 *         <option value="en">English</option>
 *         <option value="es">Español</option>
 *       </select>
 *     </div>
 *   );
 * }
 */
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
