import { Link, useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import type { Country } from '@/types/api';
import { COUNTRY_CONTINENT, COUNTRY_LANGUAGE } from '@/lib/country-data';

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
    <Link
      to={`/countries/${country.iso_3166_1}`}
      className="flex items-center gap-3 p-3 bg-base-200 rounded-box hover:bg-base-300 transition"
    >
      {code && code.length === 2 ? (
        <img
          className="rounded-sm"
          src={`https://flagcdn.com/w40/${code}.png`}
          srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
          alt={country.name}
          width={32}
          height={24}
        />
      ) : (
        <span className="w-8 h-6 bg-base-300 rounded-sm flex items-center justify-center text-xs text-base-content/40">--</span>
      )}
      <div className="flex-1 min-w-0">
        <span className="font-medium text-sm block truncate">{country.name}</span>
        <span className="text-xs text-base-content/60 block truncate">
          {country.stationcount.toLocaleString()} stations
          {language && ` · ${language}`}
          {continent && ` · ${continent}`}
        </span>
      </div>
      <button className="btn btn-ghost btn-circle btn-xs" onClick={handleLocate} title="Locate on map">
        <MapPin size={16} />
      </button>
    </Link>
  );
}
