import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStations, deleteStation, triggerVerification, useVerificationStatus, type AdminStation } from '@/hooks/useAdminApi';
import { usePlayer } from '@/context/PlayerContext';
import { useI18n } from '@/context/I18nContext';
import type { Station } from '@/types/station';
import { Plus, Trash2, Pencil, Search, ExternalLink, Play, Square, CheckCircle, XCircle, Minus, ShieldCheck } from 'lucide-react';

type Tab = 'complete' | 'incomplete';

function toStation(s: AdminStation): Station {
  return {
    changeuuid: '',
    stationuuid: s.stationuuid,
    name: s.name,
    url: s.url,
    url_resolved: s.url_resolved,
    homepage: s.homepage,
    favicon: s.favicon,
    tags: s.tags,
    country: s.country,
    countrycode: s.countrycode,
    state: s.state,
    language: s.language,
    codec: s.codec,
    bitrate: s.bitrate,
    votes: s.votes,
    clickcount: s.clickcount,
    clicktrend: s.clicktrend,
    geo_lat: s.geo_lat,
    geo_long: s.geo_long,
    has_extended_info: false,
    lastchangetime_iso8601: s.updated_at,
    lastcheckok: s.is_broken ? 0 : 1,
  };
}

function VerificationBadge({ value, tooltip }: { value: number | null; tooltip: string }) {
  if (value === 1) return <span className="tooltip" data-tip={tooltip}><CheckCircle size={14} className="text-success" /></span>;
  if (value === 0) return <span className="tooltip" data-tip={tooltip}><XCircle size={14} className="text-error" /></span>;
  return <span className="tooltip" data-tip="Not verified yet"><Minus size={14} className="text-base-content/30" /></span>;
}

function StationTable({ stations, onEdit, onDelete, onPlay, currentUuid, isPlaying, localizeCountry }: {
  stations: AdminStation[];
  onEdit: (uuid: string) => void;
  onDelete: (uuid: string, name: string) => void;
  onPlay: (station: AdminStation) => void;
  currentUuid: string | null;
  isPlaying: boolean;
  localizeCountry: (code: string) => string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="table table-sm">
        <thead>
          <tr>
            <th></th>
            <th>Favicon</th>
            <th>Name</th>
            <th className="w-6" title="Name Verification"></th>
            <th>Country</th>
            <th>Language</th>
            <th>Tags</th>
            <th>Stream</th>
            <th>Website</th>
            <th className="text-right">Clicks</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {stations.map(s => (
            <tr key={s.stationuuid}>
              <td>
                <button
                  className={`btn btn-ghost btn-xs btn-circle ${currentUuid === s.stationuuid && isPlaying ? 'text-primary' : ''}`}
                  onClick={() => onPlay(s)}
                  title={currentUuid === s.stationuuid && isPlaying ? 'Stop' : 'Play'}
                >
                  {currentUuid === s.stationuuid && isPlaying ? <Square size={12} /> : <Play size={12} />}
                </button>
              </td>
              <td>
                {s.favicon ? (
                  <img src={s.favicon} alt="" className="w-6 h-6 rounded object-contain bg-base-200" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : <span className="text-base-content/30 text-xs">—</span>}
              </td>
              <td className="max-w-48 truncate">{s.name}</td>
              <td>
                <VerificationBadge
                  value={s.verified_name}
                  tooltip={s.verified_name === 1 ? 'Name found on homepage' : s.verified_name === 0 ? 'Name not found on homepage' : 'Not verified'}
                />
              </td>
              <td className="text-xs max-w-32 truncate" title={s.countrycode}>
                <span className="inline-flex items-center gap-1">
                  {s.countrycode ? localizeCountry(s.countrycode) : <span className="text-base-content/30">—</span>}
                  <VerificationBadge
                    value={s.verified_country}
                    tooltip={s.verified_country === 1
                      ? 'IP country matches'
                      : s.verified_country === 0
                        ? `IP resolves to ${s.verified_country_actual || '?'}`
                        : 'Not verified'}
                  />
                </span>
              </td>
              <td className="text-xs max-w-24 truncate">{s.language || <span className="text-base-content/30">—</span>}</td>
              <td className="max-w-32 truncate text-xs">{s.tags}</td>
              <td className="max-w-40 truncate text-xs">
                {s.url_resolved ? (
                  <a href={s.url_resolved} target="_blank" rel="noreferrer" className="link link-primary inline-flex items-center gap-1" title={s.url_resolved}>
                    <ExternalLink size={10} />
                    {new URL(s.url_resolved).hostname}
                  </a>
                ) : <span className="text-base-content/30">—</span>}
              </td>
              <td className="max-w-40 truncate text-xs">
                {s.homepage ? (
                  <a href={s.homepage} target="_blank" rel="noreferrer" className="link link-primary inline-flex items-center gap-1" title={s.homepage}>
                    <ExternalLink size={10} />
                    {new URL(s.homepage).hostname}
                  </a>
                ) : <span className="text-base-content/30">—</span>}
              </td>
              <td className="text-right tabular-nums">{s.clickcount.toLocaleString()}</td>
              <td>
                {s.is_broken ? <span className="badge badge-error badge-xs">broken</span> : <span className="badge badge-success badge-xs">ok</span>}
                {s.manually_added ? <span className="badge badge-info badge-xs ml-1">manual</span> : null}
              </td>
              <td className="flex gap-1">
                <button className="btn btn-ghost btn-xs" onClick={() => onEdit(s.stationuuid)} title="Edit">
                  <Pencil size={12} />
                </button>
                <button className="btn btn-ghost btn-xs text-error" onClick={() => onDelete(s.stationuuid, s.name)} title="Delete">
                  <Trash2 size={12} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const MISSING_FIELD_OPTIONS = [
  { key: 'tags', label: 'Tags' },
  { key: 'countrycode', label: 'Country Code' },
  { key: 'language', label: 'Language' },
  { key: 'homepage', label: 'Homepage' },
  { key: 'favicon', label: 'Favicon' },
  { key: 'codec', label: 'Codec' },
  { key: 'bitrate', label: 'Bitrate' },
] as const;

function VerifyButton() {
  const { data: vStatus, refresh } = useVerificationStatus();
  const [triggering, setTriggering] = useState(false);

  const handleVerify = async () => {
    setTriggering(true);
    try {
      await triggerVerification();
      // Poll status while running
      const poll = setInterval(() => { refresh(); }, 3000);
      // Auto-stop polling after 5 minutes
      setTimeout(() => clearInterval(poll), 300000);
      setTimeout(() => refresh(), 1000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to start verification');
    } finally {
      setTriggering(false);
    }
  };

  const isRunning = vStatus?.running || triggering;

  return (
    <button
      className="btn btn-sm btn-outline btn-secondary gap-2"
      onClick={handleVerify}
      disabled={isRunning}
    >
      {isRunning ? <span className="loading loading-spinner loading-xs" /> : <ShieldCheck size={14} />}
      {isRunning ? 'Verifying...' : 'Verify Stations'}
      {vStatus?.stats && (
        <span className="badge badge-sm">{vStatus.stats.pending} pending</span>
      )}
    </button>
  );
}

export function AdminStations() {
  const [tab, setTab] = useState<Tab>('complete');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const navigate = useNavigate();
  const { currentStation, isPlaying, togglePlay } = usePlayer();
  const { localizeCountry } = useI18n();

  const handlePlay = (s: AdminStation) => {
    togglePlay(toStation(s));
  };

  const toggleMissingField = (field: string) => {
    setMissingFields(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
    setPage(1);
  };

  const filters = tab === 'incomplete'
    ? { incomplete: 'true' as const, missing_fields: missingFields.length > 0 ? missingFields : undefined }
    : { incomplete: 'false' as const };
  const { data, loading, error, refresh } = useAdminStations(page, search, filters);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    setPage(1);
  };

  const handleDelete = async (uuid: string, name: string) => {
    if (!confirm(`Delete station "${name}"?`)) return;
    try {
      await deleteStation(uuid);
      refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className="tabs tabs-boxed">
            <button className={`tab ${tab === 'complete' ? 'tab-active' : ''}`} onClick={() => handleTabChange('complete')}>
              Complete
            </button>
            <button className={`tab ${tab === 'incomplete' ? 'tab-active' : ''}`} onClick={() => handleTabChange('incomplete')}>
              Incomplete
            </button>
          </div>
          <form onSubmit={handleSearch} className="join">
            <input
              type="text"
              className="input input-bordered input-sm join-item w-64"
              placeholder="Search stations..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            <button type="submit" className="btn btn-sm join-item btn-neutral">
              <Search size={14} />
            </button>
          </form>
        </div>
        <div className="flex gap-2">
          <VerifyButton />
          <button className="btn btn-sm btn-primary gap-2" onClick={() => navigate('/admin/stations/new')}>
            <Plus size={14} /> Add Station
          </button>
        </div>
      </div>

      {tab === 'incomplete' && (
        <div className="flex flex-wrap gap-3 items-center bg-base-200 rounded-box p-3">
          <span className="text-sm font-medium">Missing:</span>
          {MISSING_FIELD_OPTIONS.map(opt => (
            <label key={opt.key} className="label cursor-pointer gap-1.5">
              <input
                type="checkbox"
                className="checkbox checkbox-xs checkbox-warning"
                checked={missingFields.includes(opt.key)}
                onChange={() => toggleMissingField(opt.key)}
              />
              <span className="label-text text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      )}

      {error && <div className="alert alert-error text-sm">{error}</div>}

      {loading ? (
        <div className="flex justify-center p-8"><span className="loading loading-spinner" /></div>
      ) : data && (
        <>
          <div className="text-sm text-base-content/60">
            {data.total.toLocaleString()} stations — Page {data.page} of {data.totalPages}
          </div>
          <StationTable
            stations={data.stations}
            onEdit={(uuid) => navigate(`/admin/stations/${uuid}/edit`)}
            onDelete={handleDelete}
            onPlay={handlePlay}
            currentUuid={currentStation?.stationuuid ?? null}
            isPlaying={isPlaying}
            localizeCountry={localizeCountry}
          />
          <div className="join flex justify-center">
            <button className="join-item btn btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>«</button>
            <button className="join-item btn btn-sm">Page {data.page}</button>
            <button className="join-item btn btn-sm" disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}>»</button>
          </div>
        </>
      )}
    </div>
  );
}
