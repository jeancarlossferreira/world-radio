import { Languages } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import { SUPPORTED_LOCALES } from '@/i18n/locales';
import type { Locale } from '@/i18n/types';

export function LanguagePicker() {
  const { locale, setLocale, t, isLoading } = useI18n();
  const currentLocale = SUPPORTED_LOCALES.find(l => l.code === locale);

  return (
    <div className="form-control w-full">
      <label className="label py-1">
        <span className="label-text text-xs">{t('settings.language')}</span>
      </label>
      <div className="dropdown dropdown-top w-full">
        <div
          tabIndex={0}
          role="button"
          className="btn btn-ghost btn-sm w-full justify-start gap-2"
        >
          <Languages size={16} />
          <span className="truncate">
            {currentLocale?.name || locale}
          </span>
          {isLoading && <span className="loading loading-spinner loading-xs" />}
        </div>
        <ul
          tabIndex={0}
          className="dropdown-content menu bg-base-200 rounded-box w-56 max-h-60 overflow-y-auto shadow-lg z-50 flex-nowrap p-2"
        >
          {SUPPORTED_LOCALES.map(loc => (
            <li key={loc.code}>
              <button
                className={locale === loc.code ? 'active' : ''}
                onClick={() => {
                  setLocale(loc.code as Locale);
                  (document.activeElement as HTMLElement)?.blur();
                }}
              >
                <div className="flex flex-col items-start">
                  <span>{loc.name}</span>
                  <span className="text-xs text-base-content/50">{loc.englishName}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
