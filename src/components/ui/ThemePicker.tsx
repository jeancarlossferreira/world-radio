import { useEffect, useState } from 'react';
import { Palette } from 'lucide-react';

const themes = [
  'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate',
  'synthwave', 'retro', 'cyberpunk', 'valentine', 'halloween',
  'garden', 'forest', 'aqua', 'lofi', 'pastel', 'fantasy',
  'wireframe', 'black', 'luxury', 'dracula', 'cmyk', 'autumn',
  'business', 'acid', 'lemonade', 'night', 'coffee', 'winter',
  'dim', 'nord', 'sunset', 'caramellatte', 'abyss', 'silk',
];

function getStoredTheme(): string {
  return localStorage.getItem('theme') || 'dark';
}

export function ThemePicker() {
  const [current, setCurrent] = useState(getStoredTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', current);
    localStorage.setItem('theme', current);
  }, [current]);

  return (
    <div className="dropdown dropdown-top w-full">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-sm w-full justify-start gap-2">
        <Palette size={16} />
        <span className="capitalize truncate">{current}</span>
      </div>
      <ul tabIndex={0} className="dropdown-content menu bg-base-200 rounded-box w-52 max-h-60 overflow-y-auto shadow-lg z-50 flex-nowrap p-2">
        {themes.map(theme => (
          <li key={theme}>
            <button
              className={`capitalize ${current === theme ? 'menu-active' : ''}`}
              onClick={() => {
                setCurrent(theme);
                (document.activeElement as HTMLElement)?.blur();
              }}
            >
              <div className="flex gap-1">
                <span
                  className="w-2 h-4 rounded-sm"
                  data-theme={theme}
                  style={{ backgroundColor: 'oklch(var(--p))' }}
                />
                <span
                  className="w-2 h-4 rounded-sm"
                  data-theme={theme}
                  style={{ backgroundColor: 'oklch(var(--s))' }}
                />
                <span
                  className="w-2 h-4 rounded-sm"
                  data-theme={theme}
                  style={{ backgroundColor: 'oklch(var(--a))' }}
                />
              </div>
              {theme}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
