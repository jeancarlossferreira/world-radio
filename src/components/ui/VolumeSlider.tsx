import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';

interface VolumeSliderProps {
  volume: number;
  onChange: (v: number) => void;
}

function VolumeIcon({ volume }: { volume: number }) {
  if (volume === 0) return <VolumeX size={18} />;
  if (volume < 0.3) return <Volume size={18} />;
  if (volume < 0.7) return <Volume1 size={18} />;
  return <Volume2 size={18} />;
}

export function VolumeSlider({ volume, onChange }: VolumeSliderProps) {
  const { t } = useI18n();
  const percentage = Math.round(volume * 100);

  return (
    <div className="flex items-center gap-2">
      <div className="tooltip tooltip-top" data-tip={volume === 0 ? t('player.unmute') : t('player.mute')}>
        <button
          className="btn btn-ghost btn-circle btn-sm"
          onClick={() => onChange(volume === 0 ? 0.7 : 0)}
        >
          <VolumeIcon volume={volume} />
        </button>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={percentage}
        onChange={e => onChange(parseInt(e.target.value) / 100)}
        className="range range-sm range-primary w-28"
        style={{
          background: `linear-gradient(to right, oklch(var(--p)) ${percentage}%, oklch(var(--b3)) ${percentage}%)`
        }}
      />
    </div>
  );
}
