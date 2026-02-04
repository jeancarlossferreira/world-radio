import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { THEMES, DEFAULT_THEME_ID, type Theme } from '@/lib/themes';
import { STORAGE_KEYS } from '@/lib/constants';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.colors)) {
    root.style.setProperty(key, value);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedId = localStorage.getItem(STORAGE_KEYS.THEME);
    return THEMES.find(t => t.id === savedId) ?? THEMES.find(t => t.id === DEFAULT_THEME_ID)!;
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((id: string) => {
    const found = THEMES.find(t => t.id === id);
    if (found) {
      setThemeState(found);
      localStorage.setItem(STORAGE_KEYS.THEME, id);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
