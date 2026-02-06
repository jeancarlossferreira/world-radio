import { Map } from 'lucide-react';
import { useMapTheme, mapThemeOptions, type MapTheme } from '@/context/MapThemeContext';
import { useI18n } from '@/context/I18nContext';

export function MapThemePicker() {
  const { mapTheme, setMapTheme } = useMapTheme();
  const { t } = useI18n();
  const currentTheme = mapThemeOptions.find(o => o.value === mapTheme);

  return (
    <div className="form-control w-full">
      <label className="label py-1">
        <span className="label-text text-xs">{t('settings.mapTheme')}</span>
      </label>
      <div className="dropdown dropdown-top w-full">
        <div
          tabIndex={0}
          role="button"
          className="btn btn-ghost btn-sm w-full justify-start gap-2"
        >
          <Map size={16} />
          <span className="truncate">{currentTheme?.label || mapTheme}</span>
        </div>
        <ul
          tabIndex={0}
          className="dropdown-content menu bg-base-200 rounded-box w-52 shadow-lg z-50 flex-nowrap p-2"
        >
          {mapThemeOptions.map((option) => (
            <li key={option.value}>
              <button
                className={mapTheme === option.value ? 'active' : ''}
                onClick={() => {
                  setMapTheme(option.value as MapTheme);
                  (document.activeElement as HTMLElement)?.blur();
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
