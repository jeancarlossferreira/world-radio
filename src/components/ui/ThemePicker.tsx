import { THEMES } from '@/lib/themes';
import { useTheme } from '@/context/ThemeContext';
import styles from './ThemePicker.module.css';

export function ThemePicker() {
  const { theme, setTheme } = useTheme();

  return (
    <div className={styles.picker}>
      <span className={styles.label}>Theme</span>
      <div className={styles.swatches}>
        {THEMES.map(t => (
          <button
            key={t.id}
            className={`${styles.swatch} ${theme.id === t.id ? styles.active : ''}`}
            style={{ background: t.colors['--accent'] }}
            onClick={() => setTheme(t.id)}
            title={t.name}
          />
        ))}
      </div>
    </div>
  );
}
