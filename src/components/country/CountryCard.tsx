import { Link } from 'react-router-dom';
import type { Country } from '@/types/api';
import styles from './CountryCard.module.css';

function countryFlag(code: string): string {
  if (!code || code.length !== 2) return '';
  const offset = 0x1F1E6;
  return String.fromCodePoint(
    code.charCodeAt(0) - 65 + offset,
    code.charCodeAt(1) - 65 + offset
  );
}

export function CountryCard({ country }: { country: Country }) {
  return (
    <Link to={`/countries/${country.iso_3166_1}`} className={styles.card}>
      <span className={styles.flag}>{countryFlag(country.iso_3166_1)}</span>
      <div className={styles.info}>
        <span className={styles.name}>{country.name}</span>
        <span className={styles.count}>{country.stationcount.toLocaleString()} stations</span>
      </div>
    </Link>
  );
}
