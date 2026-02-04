import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import styles from './FilterPanel.module.css';

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
    <div className={styles.panel}>
      <button className={styles.toggle} onClick={() => setExpanded(!expanded)}>
        <SlidersHorizontal size={16} />
        Filters
      </button>
      {expanded && (
        <div className={styles.filters}>
          <div className={styles.field}>
            <label>Genre / Tag</label>
            <input
              type="text"
              value={tag}
              onChange={e => onTagChange(e.target.value)}
              placeholder="e.g. rock, jazz"
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label>Country</label>
            <input
              type="text"
              value={country}
              onChange={e => onCountryChange(e.target.value)}
              placeholder="e.g. Brazil, Germany"
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label>Codec</label>
            <select
              value={codec}
              onChange={e => onCodecChange(e.target.value)}
              className={styles.input}
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
