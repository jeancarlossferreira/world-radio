import { useMemo, useState } from 'react';
import { Globe } from 'lucide-react';
import { SearchBar } from '@/components/search/SearchBar';
import { CountryGrid } from '@/components/country/CountryGrid';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useCountries } from '@/hooks/useCountries';
import styles from './CountryListPage.module.css';

export function CountryListPage() {
  const { countries, loading, error } = useCountries();
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    if (!filter) return countries;
    const q = filter.toLowerCase();
    return countries.filter(c => c.name.toLowerCase().includes(q));
  }, [countries, filter]);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>
        <Globe size={24} />
        Browse by Country
      </h1>
      <p className={styles.subtitle}>{countries.length} countries with radio stations</p>
      <div className={styles.search}>
        <SearchBar value={filter} onChange={setFilter} placeholder="Filter countries..." />
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
      {!loading && !error && <CountryGrid countries={filtered} />}
    </div>
  );
}
