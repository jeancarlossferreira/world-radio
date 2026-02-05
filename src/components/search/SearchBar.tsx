import { Search } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: (v: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, onSubmit, placeholder }: SearchBarProps) {
  const { t } = useI18n();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSubmit) {
      e.preventDefault();
      onSubmit(value);
    }
  };

  return (
    <label className="input input-bordered flex items-center gap-2 w-full">
      <Search size={16} className="text-base-content/40" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || t('search.placeholder')}
        className="grow"
      />
    </label>
  );
}
