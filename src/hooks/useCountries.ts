import { useEffect, useState } from 'react';
import type { Country } from '@/types/api';
import { getCountries } from '@/lib/api';

let cachedCountries: Country[] | null = null;

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>(cachedCountries || []);
  const [loading, setLoading] = useState(!cachedCountries);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedCountries) return;
    let cancelled = false;
    setLoading(true);
    getCountries()
      .then(data => {
        if (cancelled) return;
        const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
        cachedCountries = sorted;
        setCountries(sorted);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { countries, loading, error };
}
