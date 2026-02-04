import { useMemo, useState } from 'react';
import { Globe } from 'lucide-react';
import { SearchBar } from '@/components/search/SearchBar';
import { CountryGrid } from '@/components/country/CountryGrid';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useCountries } from '@/hooks/useCountries';
import { COUNTRY_CONTINENT, COUNTRY_LANGUAGE, CONTINENTS } from '@/lib/country-data';

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
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Globe size={24} />
        Browse by Country
      </h1>
      <p className="text-sm text-base-content/60 mt-1 mb-5">{countries.length} countries with radio stations</p>

      <div className="flex flex-wrap items-end gap-3 mb-5">
        <div className="flex-1 min-w-[200px]">
          <SearchBar value={filter} onChange={setFilter} placeholder="Filter countries..." />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text text-xs">Sort by</span>
          </label>
          <select
            className="select select-bordered select-sm"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortKey)}
          >
            <option value="name">Name</option>
            <option value="stations">Stations</option>
            <option value="language">Language</option>
            <option value="continent">Continent</option>
          </select>
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text text-xs">Continent</span>
          </label>
          <select
            className="select select-bordered select-sm"
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
