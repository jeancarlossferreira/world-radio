import { useEffect, useState, useRef } from 'react';
import { Palette } from 'lucide-react';

const themes: { value: string; label: string }[] = [
  { value: 'dark-blue', label: 'Dark Blue' },
  { value: 'dark-green', label: 'Dark Green' },
  { value: 'dark-purple', label: 'Dark Purple' },
  { value: 'dark-red', label: 'Dark Red' },
  { value: 'dark-gray', label: 'Dark Gray' },
  { value: 'dark-orange', label: 'Dark Orange' },
  { value: 'dark-cyan', label: 'Dark Cyan' },
  { value: 'dark-teal', label: 'Dark Teal' },
  { value: 'dark-indigo', label: 'Dark Indigo' },
  { value: 'dark-rose', label: 'Dark Rose' },
  { value: 'dark-gold', label: 'Dark Gold' },
  { value: 'pure-black', label: 'Pure Black' },
  { value: 'light-blue', label: 'Light Blue' },
  { value: 'light-green', label: 'Light Green' },
  { value: 'light-pink', label: 'Light Pink' },
  { value: 'light-yellow', label: 'Light Yellow' },
  { value: 'light-gray', label: 'Light Gray' },
  { value: 'light-purple', label: 'Light Purple' },
  { value: 'light-orange', label: 'Light Orange' },
  { value: 'light-cyan', label: 'Light Cyan' },
  { value: 'light-teal', label: 'Light Teal' },
  { value: 'light-indigo', label: 'Light Indigo' },
  { value: 'light-rose', label: 'Light Rose' },
  { value: 'pure-white', label: 'Pure White' },
];

const validThemeValues = new Set(themes.map(t => t.value));

function getStoredTheme(): string {
  const stored = localStorage.getItem('theme');
  if (stored && validThemeValues.has(stored)) {
    return stored;
  }
  return 'dark-blue';
}

function applyTheme(theme: string) {
  document.documentElement.setAttribute('data-theme', theme);
}

export function ThemePicker() {
  const [current, setCurrent] = useState(getStoredTheme);
  const [preview, setPreview] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Apply saved theme on mount and when current changes
  useEffect(() => {
    applyTheme(current);
    localStorage.setItem('theme', current);
  }, [current]);

  // Apply preview theme when hovering
  useEffect(() => {
    if (preview) {
      applyTheme(preview);
    }
  }, [preview]);

  const handleMouseEnter = (theme: string) => {
    setPreview(theme);
  };

  const handleMouseLeave = () => {
    setPreview(null);
    applyTheme(current);
  };

  const handleSelect = (theme: string) => {
    setCurrent(theme);
    setPreview(null);
    (document.activeElement as HTMLElement)?.blur();
  };

  const currentTheme = themes.find(t => t.value === current);

  return (
    <div
      className="dropdown dropdown-top w-full"
      ref={dropdownRef}
      onMouseLeave={handleMouseLeave}
    >
      <div tabIndex={0} role="button" className="btn btn-ghost btn-sm w-full justify-start gap-2">
        <Palette size={16} />
        <span className="truncate">{currentTheme?.label || current}</span>
      </div>
      <ul tabIndex={0} className="dropdown-content menu bg-base-200 rounded-box w-52 max-h-60 overflow-y-auto shadow-lg z-50 flex-nowrap p-2">
        {themes.map(theme => (
          <li key={theme.value}>
            <button
              className={current === theme.value ? 'menu-active' : ''}
              onMouseEnter={() => handleMouseEnter(theme.value)}
              onClick={() => handleSelect(theme.value)}
            >
              <div className="flex gap-1">
                <span
                  className="w-2 h-4 rounded-sm"
                  data-theme={theme.value}
                  style={{ backgroundColor: 'oklch(var(--p))' }}
                />
                <span
                  className="w-2 h-4 rounded-sm"
                  data-theme={theme.value}
                  style={{ backgroundColor: 'oklch(var(--s))' }}
                />
                <span
                  className="w-2 h-4 rounded-sm"
                  data-theme={theme.value}
                  style={{ backgroundColor: 'oklch(var(--a))' }}
                />
              </div>
              {theme.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
