import { useEffect, useRef, useState } from 'react';
import {
  useDigStatus,
  triggerAutocomplete,
  triggerRecheck,
  pauseDig,
  resumeDig,
  cancelDig,
  type DigStationResult,
} from '@/hooks/useAdminApi';
import { Pickaxe, Play, Pause, RotateCcw, Square, RefreshCw, CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronRight } from 'lucide-react';

function StatusIcon({ status }: { status: DigStationResult['status'] }) {
  switch (status) {
    case 'done': return <CheckCircle size={14} className="text-success" />;
    case 'partial': return <AlertTriangle size={14} className="text-warning" />;
    case 'failed': return <XCircle size={14} className="text-error" />;
  }
}

function ResultRow({ result }: { result: DigStationResult }) {
  const [expanded, setExpanded] = useState(false);
  const vals = result.valuesFound;
  const hasValues = Object.keys(vals).length > 0;

  return (
    <>
      <tr
        className={`hover cursor-pointer ${result.status === 'failed' ? 'text-error/80' : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        <td className="w-8">
          {(hasValues || result.error) ? (
            expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : <span className="w-3.5 inline-block" />}
        </td>
        <td><StatusIcon status={result.status} /></td>
        <td className="font-medium max-w-xs truncate">{result.name}</td>
        <td className="font-mono text-xs opacity-60 max-w-[120px] truncate">{result.uuid.slice(0, 8)}</td>
        <td>
          {result.fieldsFilled.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {result.fieldsFilled.map(f => (
                <span key={f} className="badge badge-success badge-xs">{f}</span>
              ))}
            </div>
          ) : result.error ? (
            <span className="text-error text-xs truncate max-w-xs inline-block">{result.error.slice(0, 60)}</span>
          ) : (
            <span className="text-xs opacity-40">no new data</span>
          )}
        </td>
        <td className="text-xs opacity-60 text-right tabular-nums">{(result.duration / 1000).toFixed(1)}s</td>
      </tr>
      {expanded && (hasValues || result.error) && (
        <tr>
          <td colSpan={6} className="bg-base-300/50 p-3">
            {result.error && (
              <div className="text-error text-sm mb-2">Error: {result.error}</div>
            )}
            {hasValues && (
              <div className="flex gap-6">
                {/* Favicon preview */}
                {vals.favicon && (
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <img
                      src={vals.favicon}
                      alt="favicon"
                      className="w-16 h-16 rounded-lg border border-base-content/10 object-contain bg-base-100"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    {vals.favicon_method && (
                      <span className="text-[10px] opacity-50">via {vals.favicon_method}</span>
                    )}
                  </div>
                )}
                {/* Field details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-xs flex-1">
                  {vals.homepage && (
                    <div className="flex gap-2 md:col-span-2">
                      <span className="font-semibold min-w-[90px] text-right opacity-70">homepage:</span>
                      <a href={vals.homepage} target="_blank" rel="noreferrer" className="link link-primary break-all">{vals.homepage}</a>
                    </div>
                  )}
                  {vals.favicon && (
                    <div className="flex gap-2 md:col-span-2">
                      <span className="font-semibold min-w-[90px] text-right opacity-70">favicon:</span>
                      <span className="break-all">{vals.favicon}</span>
                    </div>
                  )}
                  {(vals.geo_lat || vals.geo_long) && (
                    <>
                      <div className="flex gap-2 md:col-span-2">
                        <span className="font-semibold min-w-[90px] text-right opacity-70">geo:</span>
                        <span className="tabular-nums">{vals.geo_lat}, {vals.geo_long}</span>
                        {vals.geo_method && (
                          <span className="badge badge-ghost badge-xs ml-1">via {vals.geo_method}</span>
                        )}
                      </div>
                      {vals.geo_query && (
                        <div className="flex gap-2 md:col-span-2">
                          <span className="font-semibold min-w-[90px] text-right opacity-70">geo query:</span>
                          <span className="opacity-70">Nominatim: "{vals.geo_query}"</span>
                        </div>
                      )}
                    </>
                  )}
                  {Object.entries(vals)
                    .filter(([k]) => !['homepage', 'favicon', 'favicon_method', 'geo_lat', 'geo_long', 'geo_method', 'geo_query'].includes(k))
                    .map(([field, value]) => (
                      <div key={field} className="flex gap-2">
                        <span className="font-semibold min-w-[90px] text-right opacity-70">{field}:</span>
                        <span className="break-all">{value}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

export function AdminDig() {
  const { data, loading, refresh } = useDigStatus();
  const [actionError, setActionError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tableEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const prevCount = useRef(0);

  const jobStatus = data?.job.status ?? 'idle';
  const isRunning = jobStatus === 'running';
  const isPaused = jobStatus === 'paused';
  const isBusy = isRunning || isPaused;

  // Poll when running or paused
  useEffect(() => {
    if (isBusy) {
      pollRef.current = setInterval(refresh, 2000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isBusy, refresh]);

  // Auto-scroll when new results arrive
  useEffect(() => {
    const count = data?.job.results.length ?? 0;
    if (autoScroll && count > prevCount.current) {
      tableEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevCount.current = count;
  }, [data?.job.results.length, autoScroll]);

  async function handleAction(action: () => Promise<unknown>) {
    setActionError(null);
    try {
      await action();
      setTimeout(refresh, 300);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Action failed');
    }
  }

  if (loading && !data) {
    return <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div>;
  }

  const job = data?.job;
  const stats = data?.stats;
  const pct = job && job.total > 0 ? Math.round((job.processed / job.total) * 100) : 0;
  const results = job?.results ?? [];

  return (
    <div className="space-y-6">
      {/* Header + Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Pickaxe size={22} /> Dig — Station Autocomplete
        </h2>
        <div className="flex-1" />
        <button
          className="btn btn-primary btn-sm"
          disabled={isBusy}
          onClick={() => handleAction(triggerAutocomplete)}
        >
          <Play size={14} /> Autocomplete
        </button>
        <button
          className="btn btn-secondary btn-sm"
          disabled={isBusy}
          onClick={() => handleAction(triggerRecheck)}
        >
          <RotateCcw size={14} /> Recheck
        </button>
        <button
          className="btn btn-warning btn-sm"
          disabled={!isRunning}
          onClick={() => handleAction(pauseDig)}
        >
          <Pause size={14} /> Pause
        </button>
        <button
          className="btn btn-info btn-sm"
          disabled={!isPaused}
          onClick={() => handleAction(resumeDig)}
        >
          <Play size={14} /> Resume
        </button>
        <button
          className="btn btn-error btn-sm"
          disabled={!isBusy}
          onClick={() => handleAction(cancelDig)}
        >
          <Square size={14} /> Cancel
        </button>
        <button className="btn btn-ghost btn-sm" onClick={refresh}>
          <RefreshCw size={14} />
        </button>
      </div>

      {actionError && (
        <div className="alert alert-error">
          <span>{actionError}</span>
        </div>
      )}

      {/* Job Progress */}
      {job && (
        <div className="card bg-base-200">
          <div className="card-body p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span>
                Status:{' '}
                <span className={`badge ${
                  isRunning ? 'badge-success' :
                  isPaused ? 'badge-warning' :
                  'badge-ghost'
                }`}>
                  {jobStatus}
                </span>
              </span>
              <span>{job.processed}/{job.total} stations</span>
              <span>{job.errors} errors</span>
              {job.currentStation && (
                <span className="opacity-70">Current: "{job.currentStation}"</span>
              )}
            </div>

            {(isBusy || job.processed > 0) && (
              <progress
                className="progress progress-primary w-full"
                value={pct}
                max={100}
              />
            )}

            {/* Fields filled summary */}
            {Object.keys(job.filled).length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="opacity-60 self-center">Fields filled:</span>
                {Object.entries(job.filled).sort((a, b) => b[1] - a[1]).map(([field, count]) => (
                  <span key={field} className="badge badge-outline badge-sm">
                    {field}: {count}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Station Results Table */}
      {results.length > 0 && (
        <div className="card bg-base-200">
          <div className="card-body p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Station Results ({results.length})</h3>
              <label className="label cursor-pointer gap-2 text-xs">
                <span>Auto-scroll</span>
                <input
                  type="checkbox"
                  className="toggle toggle-xs"
                  checked={autoScroll}
                  onChange={e => setAutoScroll(e.target.checked)}
                />
              </label>
            </div>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="table table-xs table-pin-rows">
                <thead>
                  <tr>
                    <th className="w-8"></th>
                    <th className="w-8"></th>
                    <th>Station</th>
                    <th>UUID</th>
                    <th>Result</th>
                    <th className="text-right">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <ResultRow key={`${r.uuid}-${i}`} result={r} />
                  ))}
                </tbody>
              </table>
              <div ref={tableEndRef} />
            </div>
          </div>
        </div>
      )}

      {/* DB Stats */}
      {stats && (
        <div className="card bg-base-200">
          <div className="card-body p-4">
            <h3 className="font-semibold mb-3">Database Stats</h3>
            <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
              <div className="stat">
                <div className="stat-title">Total</div>
                <div className="stat-value text-lg">{stats.total.toLocaleString()}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Done</div>
                <div className="stat-value text-lg text-success">{stats.done.toLocaleString()}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Partial</div>
                <div className="stat-value text-lg text-warning">{stats.partial.toLocaleString()}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Failed</div>
                <div className="stat-value text-lg text-error">{stats.failed.toLocaleString()}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Never Attempted</div>
                <div className="stat-value text-lg">{stats.neverAttempted.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
