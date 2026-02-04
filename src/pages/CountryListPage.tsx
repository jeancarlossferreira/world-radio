import { useMemo, useState } from 'react';
import { Globe } from 'lucide-react';
import { SearchBar } from '@/components/search/SearchBar';
import { CountryGrid } from '@/components/country/CountryGrid';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useCountries } from '@/hooks/useCountries';
import { COUNTRY_CONTINENT, COUNTRY_LANGUAGE, CONTINENTS } from '@/lib/country-data';
import styles from './CountryListPage.module.css';

type SortKey = 'name' | 'stations' | 'language' | 'continent';

export function CountryListPage() {
  const { countries, loading, error } = useCountries();
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [continentFilter, setContinentFilter] = useState('');

  const result = useMemo(() => {
    let list = countries;

    if (filter) {
      const q = filter.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q));
    }

    if (continentFilter) {
      list = list.filter(c => COUNTRY_CONTINENT[c.iso_3166_1] === continentFilter);
    }

    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'stations':
          return b.stationcount - a.stationcount;
        case 'language': {
          const la = COUNTRY_LANGUAGE[a.iso_3166_1] || '';
          const lb = COUNTRY_LANGUAGE[b.iso_3166_1] || '';
          return la.localeCompare(lb) || a.name.localeCompare(b.name);
        }
        case 'continent': {
          const ca = COUNTRY_CONTINENT[a.iso_3166_1] || '';
          const cb = COUNTRY_CONTINENT[b.iso_3166_1] || '';
          return ca.localeCompare(cb) || a.name.localeCompare(b.name);
        }
        default:
          return 0;
      }
    });

    return list;
  }, [countries, filter, sortBy, continentFilter]);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>
        <Globe size={24} />
        Browse by Country
      </h1>
      <p className={styles.subtitle}>{countries.length} countries with radio stations</p>

      <div className={styles.controls}>
        <div className={styles.search}>
          <SearchBar value={filter} onChange={setFilter} placeholder="Filter countries..." />
        </div>
        <div className={styles.sortGroup}>
          <label className={styles.sortLabel}>Sort by</label>
          <select
            className={styles.select}
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortKey)}
          >
            <option value="name">Name</option>
            <option value="stations">Stations</option>
            <option value="language">Language</option>
            <option value="continent">Continent</option>
          </select>
        </div>
        <div className={styles.sortGroup}>
          <label className={styles.sortLabel}>Continent</label>
          <select
            className={styles.select}
            value={continentFilter}
            onChange={e => setContinentFilter(e.target.value)}
          >
            <option value="">All</option>
            {CONTINENTS.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
      {!loading && !error && <CountryGrid countries={result} />}
    </div>
  );
}
