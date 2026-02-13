import { useState } from 'react';
import { useEtlLogs, triggerEtl } from '@/hooks/useAdminApi';
import { Play, RefreshCw, ExternalLink } from 'lucide-react';

export function AdminEtl() {
  const { logs, loading, refresh } = useEtlLogs();
  const [triggering, setTriggering] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleTrigger = async () => {
    setTriggering(true);
    setMessage(null);
    try {
      const res = await triggerEtl();
      setMessage(res.message);
      // Poll for updates
      setTimeout(refresh, 3000);
      setTimeout(refresh, 10000);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to trigger ETL');
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          <button className="btn btn-sm btn-primary gap-2" onClick={handleTrigger} disabled={triggering}>
            {triggering ? <span className="loading loading-spinner loading-xs" /> : <Play size={14} />}
            Run ETL Now
          </button>
          <button className="btn btn-sm btn-ghost gap-2" onClick={refresh}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
        {message && <span className="text-sm text-info">{message}</span>}
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><span className="loading loading-spinner" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>#</th>
                <th>Started</th>
                <th>Finished</th>
                <th>Status</th>
                <th className="text-right">Extracted</th>
                <th className="text-right">Loaded</th>
                <th className="text-right">Skipped</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td className="text-xs">{new Date(log.started_at).toLocaleString()}</td>
                  <td className="text-xs">{log.finished_at ? new Date(log.finished_at).toLocaleString() : '—'}</td>
                  <td>
                    <span className={`badge badge-xs ${log.status === 'success' ? 'badge-success' : log.status === 'error' ? 'badge-error' : 'badge-warning'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="text-right tabular-nums">{log.stations_extracted.toLocaleString()}</td>
                  <td className="text-right tabular-nums">{log.stations_loaded.toLocaleString()}</td>
                  <td className="text-right tabular-nums">
                    {log.stations_skipped > 0 ? (
                      <a
                        href={`/api/admin/etl/skip-log/${log.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="link link-primary inline-flex items-center gap-1"
                        title="View skip log"
                      >
                        {log.stations_skipped.toLocaleString()}
                        <ExternalLink size={10} />
                      </a>
                    ) : (
                      log.stations_skipped.toLocaleString()
                    )}
                  </td>
                  <td className="max-w-48 truncate text-xs text-error">{log.error_message || ''}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={8} className="text-center text-base-content/50">No ETL runs yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
