import type { Country } from '@/types/api';
import { CountryCard } from './CountryCard';
import styles from './CountryGrid.module.css';

export function CountryGrid({ countries }: { countries: Country[] }) {
  return (
    <div className={styles.grid}>
      {countries.map(c => (
        <CountryCard key={c.iso_3166_1} country={c} />
      ))}
    </div>
  );
}
