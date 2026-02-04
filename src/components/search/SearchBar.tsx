import { Search } from 'lucide-react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search stations...' }: SearchBarProps) {
  return (
    <div className={styles.wrapper}>
      <Search size={18} className={styles.icon} />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={styles.input}
      />
    </div>
  );
}
