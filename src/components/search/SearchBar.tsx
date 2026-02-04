import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search stations...' }: SearchBarProps) {
  return (
    <label className="input input-bordered flex items-center gap-2 w-full">
      <Search size={16} className="text-base-content/40" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="grow"
      />
    </label>
  );
}
