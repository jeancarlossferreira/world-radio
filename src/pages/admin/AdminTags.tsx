import { useState } from 'react';
import { useAdminTags, updateTag, deleteTag } from '@/hooks/useAdminApi';
import { Pencil, Trash2, Search, Check, X } from 'lucide-react';

export function AdminTags() {
  const { tags, loading, error, refresh } = useAdminTags();
  const [search, setSearch] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const filtered = search
    ? tags.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
    : tags;

  const handleEdit = (name: string) => {
    setEditingTag(name);
    setEditValue(name);
  };

  const handleEditSave = async () => {
    if (!editingTag || !editValue.trim()) return;
    try {
      await updateTag(editingTag, editValue.trim());
      setEditingTag(null);
      refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const handleEditCancel = () => {
    setEditingTag(null);
    setEditValue('');
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Delete tag "${name}"? It will be removed from all stations.`)) return;
    try {
      await deleteTag(name);
      refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleEditSave();
    if (e.key === 'Escape') handleEditCancel();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="text-sm text-base-content/60">
          {tags.length} tags total{filtered.length !== tags.length ? ` (${filtered.length} shown)` : ''}
        </div>
        <div className="join">
          <input
            type="text"
            className="input input-bordered input-sm join-item w-64"
            placeholder="Filter tags..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span className="btn btn-sm join-item btn-neutral pointer-events-none">
            <Search size={14} />
          </span>
        </div>
      </div>

      {error && <div className="alert alert-error text-sm">{error}</div>}

      {loading ? (
        <div className="flex justify-center p-8"><span className="loading loading-spinner" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th className="w-12">#</th>
                <th>Tag</th>
                <th className="text-right">Stations</th>
                <th className="w-24"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={t.name}>
                  <td className="text-base-content/40 tabular-nums">{i + 1}</td>
                  <td>
                    {editingTag === t.name ? (
                      <div className="flex items-center gap-1">
                        <input
                          className="input input-bordered input-xs w-64"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          autoFocus
                        />
                        <button className="btn btn-ghost btn-xs text-success" onClick={handleEditSave} title="Save">
                          <Check size={12} />
                        </button>
                        <button className="btn btn-ghost btn-xs" onClick={handleEditCancel} title="Cancel">
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <span className="badge badge-ghost">{t.name}</span>
                    )}
                  </td>
                  <td className="text-right tabular-nums">{t.stationcount.toLocaleString()}</td>
                  <td className="flex gap-1">
                    <button className="btn btn-ghost btn-xs" onClick={() => handleEdit(t.name)} title="Rename">
                      <Pencil size={12} />
                    </button>
                    <button className="btn btn-ghost btn-xs text-error" onClick={() => handleDelete(t.name)} title="Delete">
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
