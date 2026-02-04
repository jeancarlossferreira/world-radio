import type { Country } from '@/types/api';
import { CountryCard } from './CountryCard';

export function CountryGrid({ countries }: { countries: Country[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
      {countries.map(c => (
        <CountryCard key={c.iso_3166_1} country={c} />
      ))}
    </div>
  );
}
