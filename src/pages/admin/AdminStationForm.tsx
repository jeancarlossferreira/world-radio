import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createStation, updateStation, type AdminStation } from '@/hooks/useAdminApi';

export function AdminStationForm() {
  const { uuid } = useParams<{ uuid: string }>();
  const isEdit = Boolean(uuid);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    url: '',
    url_resolved: '',
    homepage: '',
    favicon: '',
    tags: '',
    country: '',
    countrycode: '',
    language: '',
    codec: '',
    bitrate: 0,
    geo_lat: '' as string | number,
    geo_long: '' as string | number,
    is_broken: 0,
  });

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    fetch(`/api/admin/stations/${uuid}`)
      .then(r => {
        if (!r.ok) throw new Error('Station not found');
        return r.json();
      })
      .then((s: AdminStation) => {
        setForm({
          name: s.name,
          url: s.url,
          url_resolved: s.url_resolved,
          homepage: s.homepage,
          favicon: s.favicon,
          tags: s.tags,
          country: s.country,
          countrycode: s.countrycode,
          language: s.language,
          codec: s.codec,
          bitrate: s.bitrate,
          geo_lat: s.geo_lat ?? '',
          geo_long: s.geo_long ?? '',
          is_broken: s.is_broken,
        });
      })
      .catch(() => setError('Failed to load station'))
      .finally(() => setLoading(false));
  }, [uuid, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      ...form,
      bitrate: Number(form.bitrate) || 0,
      geo_lat: form.geo_lat !== '' ? Number(form.geo_lat) : null,
      geo_long: form.geo_long !== '' ? Number(form.geo_long) : null,
    };

    try {
      if (isEdit && uuid) {
        await updateStation(uuid, payload);
      } else {
        await createStation(payload);
      }
      navigate('/admin/stations');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const set = (key: string, value: string | number) => setForm(f => ({ ...f, [key]: value }));

  if (loading) return <div className="flex justify-center p-8"><span className="loading loading-spinner" /></div>;

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-bold mb-4">{isEdit ? 'Edit Station' : 'Add Station'}</h2>
      {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="form-control">
          <label className="label"><span className="label-text">Name *</span></label>
          <input className="input input-bordered input-sm" required value={form.name} onChange={e => set('name', e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="form-control">
            <label className="label"><span className="label-text">URL</span></label>
            <input className="input input-bordered input-sm" value={form.url} onChange={e => set('url', e.target.value)} />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">URL Resolved *</span></label>
            <input className="input input-bordered input-sm" required value={form.url_resolved} onChange={e => set('url_resolved', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="form-control">
            <label className="label"><span className="label-text">Country</span></label>
            <input className="input input-bordered input-sm" value={form.country} onChange={e => set('country', e.target.value)} />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Country Code</span></label>
            <input className="input input-bordered input-sm" maxLength={2} value={form.countrycode} onChange={e => set('countrycode', e.target.value.toUpperCase())} />
          </div>
        </div>

        <div className="form-control">
          <label className="label"><span className="label-text">Tags (comma separated)</span></label>
          <input className="input input-bordered input-sm" value={form.tags} onChange={e => set('tags', e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="form-control">
            <label className="label"><span className="label-text">Codec</span></label>
            <input className="input input-bordered input-sm" value={form.codec} onChange={e => set('codec', e.target.value)} />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Bitrate (kbps)</span></label>
            <input className="input input-bordered input-sm" type="number" value={form.bitrate} onChange={e => set('bitrate', e.target.value)} />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Language</span></label>
            <input className="input input-bordered input-sm" value={form.language} onChange={e => set('language', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="form-control">
            <label className="label"><span className="label-text">Homepage</span></label>
            <input className="input input-bordered input-sm" value={form.homepage} onChange={e => set('homepage', e.target.value)} />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Favicon URL</span></label>
            <div className="flex items-center gap-2">
              <input className="input input-bordered input-sm flex-1" value={form.favicon} onChange={e => set('favicon', e.target.value)} />
              {form.favicon && (
                <img
                  src={form.favicon}
                  alt="favicon"
                  className="w-8 h-8 rounded object-contain bg-base-200"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="form-control">
            <label className="label"><span className="label-text">Latitude</span></label>
            <input className="input input-bordered input-sm" type="number" step="any" value={form.geo_lat} onChange={e => set('geo_lat', e.target.value)} />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Longitude</span></label>
            <input className="input input-bordered input-sm" type="number" step="any" value={form.geo_long} onChange={e => set('geo_long', e.target.value)} />
          </div>
        </div>

        {isEdit && (
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-2">
              <input type="checkbox" className="checkbox checkbox-sm" checked={form.is_broken === 1} onChange={e => set('is_broken', e.target.checked ? 1 : 0)} />
              <span className="label-text">Mark as broken</span>
            </label>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
            {saving ? <span className="loading loading-spinner loading-xs" /> : isEdit ? 'Update' : 'Create'}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/stations')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
