import { useAdminStats } from '@/hooks/useAdminApi';
import { RefreshCw } from 'lucide-react';

export function AdminDashboard() {
  const { stats, loading, error, refresh } = useAdminStats();

  if (loading) return <div className="flex justify-center p-12"><span className="loading loading-spinner loading-lg" /></div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button className="btn btn-sm btn-ghost gap-2" onClick={refresh}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="stat bg-base-200 rounded-box p-4">
          <div className="stat-title">Total Stations</div>
          <div className="stat-value text-2xl">{stats.totalStations.toLocaleString()}</div>
        </div>
        <div className="stat bg-base-200 rounded-box p-4">
          <div className="stat-title">Broken</div>
          <div className="stat-value text-2xl text-error">{stats.brokenStations.toLocaleString()}</div>
        </div>
        <div className="stat bg-base-200 rounded-box p-4">
          <div className="stat-title">Manual</div>
          <div className="stat-value text-2xl text-info">{stats.manualStations.toLocaleString()}</div>
        </div>
        <div className="stat bg-base-200 rounded-box p-4">
          <div className="stat-title">Countries</div>
          <div className="stat-value text-2xl">{stats.totalCountries.toLocaleString()}</div>
        </div>
        <div className="stat bg-base-200 rounded-box p-4">
          <div className="stat-title">Tags</div>
          <div className="stat-value text-2xl">{stats.totalTags.toLocaleString()}</div>
        </div>
      </div>

      {stats.lastEtl && (
        <div className="card bg-base-200">
          <div className="card-body p-4">
            <h3 className="card-title text-base">Last ETL Run</h3>
            <div className="flex flex-wrap gap-4 text-sm">
              <span>Status: <span className={`badge ${stats.lastEtl.status === 'success' ? 'badge-success' : stats.lastEtl.status === 'error' ? 'badge-error' : 'badge-warning'}`}>{stats.lastEtl.status}</span></span>
              <span>Started: {new Date(stats.lastEtl.started_at).toLocaleString()}</span>
              <span>Extracted: {stats.lastEtl.stations_extracted.toLocaleString()}</span>
              <span>Loaded: {stats.lastEtl.stations_loaded.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      <div className="card bg-base-200">
        <div className="card-body p-4">
          <h3 className="card-title text-base">Top Countries</h3>
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Country</th>
                  <th className="text-right">Stations</th>
                </tr>
              </thead>
              <tbody>
                {stats.topCountries.map(c => (
                  <tr key={c.iso_3166_1}>
                    <td className="font-mono">{c.iso_3166_1}</td>
                    <td>{c.name}</td>
                    <td className="text-right">{c.stationcount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
