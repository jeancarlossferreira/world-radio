import { Link, useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import type { Country } from '@/types/api';
import { COUNTRY_CONTINENT, COUNTRY_LANGUAGE } from '@/lib/country-data';
import styles from './CountryCard.module.css';

export function CountryCard({ country }: { country: Country }) {
  const navigate = useNavigate();
  const code = country.iso_3166_1?.toLowerCase();
  const language = COUNTRY_LANGUAGE[country.iso_3166_1];
  const continent = COUNTRY_CONTINENT[country.iso_3166_1];

  const handleLocate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/map?country=${country.iso_3166_1}`);
  };

  return (
    <Link to={`/countries/${country.iso_3166_1}`} className={styles.card}>
      {code && code.length === 2 ? (
        <img
          className={styles.flag}
          src={`https://flagcdn.com/w40/${code}.png`}
          srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
          alt={country.name}
          width={32}
          height={24}
        />
      ) : (
        <span className={styles.flagPlaceholder}>--</span>
      )}
      <div className={styles.info}>
        <span className={styles.name}>{country.name}</span>
        <span className={styles.detail}>
          {country.stationcount.toLocaleString()} stations
          {language && ` · ${language}`}
          {continent && ` · ${continent}`}
        </span>
      </div>
      <button className={styles.locateBtn} onClick={handleLocate} title="Locate on map">
        <MapPin size={16} />
      </button>
    </Link>
  );
}
