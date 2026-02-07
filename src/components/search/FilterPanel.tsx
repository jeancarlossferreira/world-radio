import { SlidersHorizontal } from 'lucide-react';
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
  const { t } = useI18n();

  return (
    <div className="collapse collapse-arrow bg-base-200 rounded-box mt-3">
      <input type="checkbox" />
      <div className="collapse-title text-sm font-medium flex items-center gap-2 min-h-0 py-2">
        <SlidersHorizontal size={16} />
        {t('filter.filters')}
      </div>
      <div className="collapse-content">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
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
      </div>
    </div>
  );
}
