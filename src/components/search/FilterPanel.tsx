import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '@/context/I18nContext';

interface FilterPanelProps {
  tag: string;
  country: string;
  codec: string;
  onTagChange: (v: string) => void;
  onCountryChange: (v: string) => void;
  onCodecChange: (v: string) => void;
}

const codecs = ['', 'MP3', 'AAC', 'AAC+', 'OGG', 'FLAC', 'WMA'];

export function FilterPanel({
  tag, country, codec,
  onTagChange, onCountryChange, onCodecChange,
}: FilterPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useI18n();

  return (
    <div className="mt-3">
      <button className="btn btn-ghost btn-sm gap-2" onClick={() => setExpanded(!expanded)}>
        <SlidersHorizontal size={16} />
        {t('filter.filters')}
      </button>
      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-xs uppercase">{t('filter.genreTag')}</span>
            </label>
            <input
              type="text"
              value={tag}
              onChange={e => onTagChange(e.target.value)}
              placeholder={t('filter.genrePlaceholder')}
              className="input input-bordered input-sm"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text text-xs uppercase">{t('filter.country')}</span>
            </label>
            <input
              type="text"
              value={country}
              onChange={e => onCountryChange(e.target.value)}
              placeholder={t('filter.countryPlaceholder')}
              className="input input-bordered input-sm"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text text-xs uppercase">{t('filter.codec')}</span>
            </label>
            <select
              value={codec}
              onChange={e => onCodecChange(e.target.value)}
              className="select select-bordered select-sm"
            >
              {codecs.map(c => (
                <option key={c} value={c}>{c || t('filter.codecAny')}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
