import { useState } from 'react';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { ThemePicker } from './ThemePicker';
import { LanguagePicker } from './LanguagePicker';
import { MapThemePicker } from './MapThemePicker';
import { useI18n } from '@/context/I18nContext';

export function SettingsSection() {
  const [expanded, setExpanded] = useState(false);
  const { t } = useI18n();

  return (
    <div className="border-t border-base-300">
      <button
        className="btn btn-ghost btn-sm w-full justify-between px-3 py-2"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="flex items-center gap-2">
          <Settings size={16} />
          {t('settings.title')}
        </span>
        {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </button>
      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text text-xs">{t('settings.theme')}</span>
            </label>
            <ThemePicker />
          </div>
          <MapThemePicker />
          <LanguagePicker />
        </div>
      )}
    </div>
  );
}
