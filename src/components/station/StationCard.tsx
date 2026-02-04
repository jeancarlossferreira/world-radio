import { useNavigate } from 'react-router-dom';
import { Play, Pause, Heart, Radio, MapPin } from 'lucide-react';
import type { Station } from '@/types/station';
import { usePlayer } from '@/context/PlayerContext';

interface StationCardProps {
  station: Station;
  isFavorite: boolean;
  onToggleFavorite: (station: Station) => void;
}

export function StationCard({ station, isFavorite, onToggleFavorite }: StationCardProps) {
  const { currentStation, isPlaying, isLoading, togglePlay } = usePlayer();
  const navigate = useNavigate();
  const isActive = currentStation?.stationuuid === station.stationuuid;
  const tags = station.tags ? station.tags.split(',').filter(Boolean).slice(0, 3) : [];

  return (
    <div className={`card card-side card-sm bg-base-200 group relative ${isActive ? 'ring-1 ring-primary bg-primary/10' : ''}`}>
      <figure
        className="w-12 h-12 m-2 shrink-0 cursor-pointer relative rounded-lg overflow-hidden"
        onClick={() => togglePlay(station)}
      >
        <div className="w-full h-full bg-base-300 flex items-center justify-center text-base-content/30">
          {station.favicon ? (
            <img
              src={station.favicon}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : null}
          <Radio size={20} />
        </div>
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {isActive && isLoading ? (
            <span className="loading loading-spinner loading-sm text-white" />
          ) : isActive && isPlaying ? (
            <Pause size={20} fill="white" className="text-white" />
          ) : (
            <Play size={20} fill="white" className="text-white" />
          )}
        </div>
      </figure>

      <div className="card-body p-2 gap-0.5 min-w-0">
        <h4 className="font-medium text-sm truncate" title={station.name}>
          {station.name}
        </h4>
        <div className="flex items-center gap-1 text-xs text-base-content/60">
          {station.countrycode && (
            <span className="flex items-center gap-1 truncate">
              <img
                src={`https://flagcdn.com/w20/${station.countrycode.toLowerCase()}.png`}
                alt=""
                width={14}
                height={10}
                className="rounded-sm inline-block"
              />
              {station.country}
              {station.state && ` · ${station.state}`}
            </span>
          )}
          {station.bitrate > 0 && (
            <span className="text-base-content/40">{station.bitrate} kbps</span>
          )}
        </div>
        {tags.length > 0 && (
          <div className="flex gap-1 mt-0.5">
            {tags.map(tag => (
              <span key={tag} className="badge badge-sm badge-ghost">{tag.trim()}</span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center justify-center gap-0.5 pr-2">
        {station.geo_lat !== null && station.geo_long !== null && (
          <button
            className="btn btn-ghost btn-circle btn-xs"
            onClick={() => navigate(`/map?lat=${station.geo_lat}&lng=${station.geo_long}&zoom=14&station=${station.stationuuid}`)}
            title="Locate on map"
          >
            <MapPin size={14} />
          </button>
        )}
        <button
          className={`btn btn-ghost btn-circle btn-xs ${isFavorite ? 'text-primary' : ''}`}
          onClick={() => onToggleFavorite(station)}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  );
}
