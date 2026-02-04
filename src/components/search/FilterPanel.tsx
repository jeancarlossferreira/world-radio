import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

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

  return (
    <div className="mt-3">
      <button className="btn btn-ghost btn-sm gap-2" onClick={() => setExpanded(!expanded)}>
        <SlidersHorizontal size={16} />
        Filters
      </button>
      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-xs uppercase">Genre / Tag</span>
            </label>
            <input
              type="text"
              value={tag}
              onChange={e => onTagChange(e.target.value)}
              placeholder="e.g. rock, jazz"
              className="input input-bordered input-sm"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text text-xs uppercase">Country</span>
            </label>
            <input
              type="text"
              value={country}
              onChange={e => onCountryChange(e.target.value)}
              placeholder="e.g. Brazil, Germany"
              className="input input-bordered input-sm"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text text-xs uppercase">Codec</span>
            </label>
            <select
              value={codec}
              onChange={e => onCodecChange(e.target.value)}
              className="select select-bordered select-sm"
            >
              {codecs.map(c => (
                <option key={c} value={c}>{c || 'Any'}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
