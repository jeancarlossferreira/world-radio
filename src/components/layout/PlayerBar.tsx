import { useNavigate } from 'react-router-dom';
import { Play, Pause, Square, Radio, Heart, MapPin } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { useFavorites } from '@/hooks/useFavorites';
import { VolumeSlider } from '@/components/ui/VolumeSlider';

export function PlayerBar() {
  const navigate = useNavigate();
  const { currentStation, isPlaying, isLoading, volume, error, togglePlay, stop, setVolume } = usePlayer();
  const { isFav, toggleFav } = useFavorites();

  const isFavorite = currentStation ? isFav(currentStation.stationuuid) : false;
  const hasGeo = currentStation?.geo_lat !== null && currentStation?.geo_long !== null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-base-200 border-t border-base-300 px-4 h-[72px] flex items-center gap-4">
      {/* Station Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="avatar">
          <div className="w-12 h-12 rounded-lg bg-base-300 relative flex items-center justify-center">
            {currentStation?.favicon ? (
              <img
                src={currentStation.favicon}
                alt=""
                className="absolute inset-0 w-full h-full object-cover rounded-lg"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : null}
            <Radio size={18} className="text-base-content/40" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          {currentStation ? (
            <>
              <div className="font-medium text-sm truncate">{currentStation.name}</div>
              <div className="text-xs text-base-content/60 truncate">
                {error ? (
                  <span className="text-error">{error}</span>
                ) : isLoading ? (
                  <span>Connecting...</span>
                ) : (
                  <span>
                    {currentStation.country}
                    {currentStation.state ? ` · ${currentStation.state}` : ''}
                    {currentStation.bitrate > 0 ? ` · ${currentStation.bitrate} kbps` : ''}
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="text-sm text-base-content/50">No station selected</div>
          )}
        </div>
      </div>

      {/* Play Controls */}
      <div className="flex items-center gap-1">
        <button
          className="btn btn-circle btn-primary btn-sm"
          onClick={() => togglePlay()}
          disabled={!currentStation}
        >
          {isLoading ? (
            <span className="loading loading-spinner loading-xs" />
          ) : isPlaying ? (
            <Pause size={18} fill="currentColor" />
          ) : (
            <Play size={18} fill="currentColor" />
          )}
        </button>
        <button
          className="btn btn-ghost btn-circle btn-sm"
          onClick={stop}
          disabled={!currentStation}
          title="Stop"
        >
          <Square size={16} />
        </button>
      </div>

      {/* Volume - hidden on mobile */}
      <div className="hidden md:flex items-center">
        <VolumeSlider volume={volume} onChange={setVolume} />
      </div>

      {/* Favorite & Map buttons */}
      <div className="flex items-center gap-1">
        <button
          className={`btn btn-ghost btn-circle btn-sm ${isFavorite ? 'text-primary' : ''}`}
          onClick={() => currentStation && toggleFav(currentStation)}
          disabled={!currentStation}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
        <button
          className="btn btn-ghost btn-circle btn-sm"
          onClick={() => {
            if (currentStation && hasGeo) {
              navigate(`/map?lat=${currentStation.geo_lat}&lng=${currentStation.geo_long}&zoom=14&station=${currentStation.stationuuid}`);
            }
          }}
          disabled={!currentStation || !hasGeo}
          title="Show on map"
        >
          <MapPin size={18} />
        </button>
      </div>
    </div>
  );
}
