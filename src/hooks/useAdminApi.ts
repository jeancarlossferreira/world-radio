import { useState, useEffect, useCallback } from 'react';

const ADMIN_BASE = '/api/admin';

async function adminFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {};
  if (options?.body) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${ADMIN_BASE}${endpoint}`, {
    headers,
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export interface AdminStats {
  totalStations: number;
  brokenStations: number;
  manualStations: number;
  totalCountries: number;
  totalTags: number;
  topCountries: { iso_3166_1: string; name: string; stationcount: number }[];
  lastEtl: {
    id: number;
    started_at: string;
    finished_at: string | null;
    status: string;
    stations_extracted: number;
    stations_loaded: number;
    stations_skipped: number;
    error_message: string | null;
  } | null;
}

export interface EtlLog {
  id: number;
  started_at: string;
  finished_at: string | null;
  status: string;
  stations_extracted: number;
  stations_loaded: number;
  stations_skipped: number;
  error_message: string | null;
}

export interface AdminStation {
  id: number;
  stationuuid: string;
  name: string;
  url: string;
  url_resolved: string;
  homepage: string;
  favicon: string;
  tags: string;
  country: string;
  countrycode: string;
  state: string;
  local: string;
  is_aggregator: number;
  aggregator_name: string;
  language: string;
  codec: string;
  bitrate: number;
  votes: number;
  clickcount: number;
  clicktrend: number;
  geo_lat: number | null;
  geo_long: number | null;
  is_broken: number;
  manually_added: number;
  verified_name: number | null;
  verified_country: number | null;
  verified_country_actual: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedStations {
  stations: AdminStation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetch<AdminStats>('/stats');
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { stats, loading, error, refresh };
}

export function useAdminStations(page: number, search: string, filters?: { is_broken?: string; manually_added?: string; incomplete?: string; missing_fields?: string[] }) {
  const [data, setData] = useState<PaginatedStations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const missingFieldsKey = filters?.missing_fields?.join(',') || '';

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (search) params.set('search', search);
      if (filters?.is_broken) params.set('is_broken', filters.is_broken);
      if (filters?.manually_added) params.set('manually_added', filters.manually_added);
      if (filters?.incomplete) params.set('incomplete', filters.incomplete);
      if (filters?.missing_fields && filters.missing_fields.length > 0) params.set('missing_fields', filters.missing_fields.join(','));
      const result = await adminFetch<PaginatedStations>(`/stations?${params}`);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stations');
    } finally {
      setLoading(false);
    }
  }, [page, search, filters?.is_broken, filters?.manually_added, filters?.incomplete, missingFieldsKey]);

  useEffect(() => { refresh(); }, [refresh]);

  return { data, loading, error, refresh };
}

export async function createStation(body: Record<string, unknown>) {
  return adminFetch<{ stationuuid: string }>('/stations', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateStation(uuid: string, body: Record<string, unknown>) {
  return adminFetch<{ updated: boolean }>(`/stations/${uuid}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deleteStation(uuid: string) {
  return adminFetch<{ deleted: boolean }>(`/stations/${uuid}`, {
    method: 'DELETE',
  });
}

export interface AdminTag {
  name: string;
  stationcount: number;
}

export function useAdminTags() {
  const [tags, setTags] = useState<AdminTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetch<AdminTag[]>('/tags');
      setTags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tags');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { tags, loading, error, refresh };
}

export async function updateTag(oldName: string, newName: string) {
  return adminFetch<{ updated: boolean; stationsAffected: number }>(`/tags/${encodeURIComponent(oldName)}`, {
    method: 'PUT',
    body: JSON.stringify({ newName }),
  });
}

export async function deleteTag(name: string) {
  return adminFetch<{ deleted: boolean; stationsAffected: number }>(`/tags/${encodeURIComponent(name)}`, {
    method: 'DELETE',
  });
}

export async function triggerEtl() {
  return adminFetch<{ message: string }>('/etl/run', { method: 'POST' });
}

// --- Verification ---

export interface VerificationStats {
  total: number;
  verified: number;
  nameMatch: number;
  nameFail: number;
  countryMatch: number;
  countryFail: number;
  pending: number;
}

export interface VerificationStatus {
  running: boolean;
  paused: boolean;
  stats: VerificationStats;
}

export async function triggerVerification() {
  return adminFetch<{ message: string }>('/verification/run', { method: 'POST' });
}

export async function pauseVerification() {
  return adminFetch<{ message: string }>('/verification/pause', { method: 'POST' });
}

export async function resumeVerification() {
  return adminFetch<{ message: string }>('/verification/resume', { method: 'POST' });
}

export async function cancelVerification() {
  return adminFetch<{ message: string }>('/verification/cancel', { method: 'POST' });
}

export async function resetVerification() {
  return adminFetch<{ message: string }>('/verification/reset', { method: 'POST' });
}

export function useVerificationStatus() {
  const [data, setData] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminFetch<VerificationStatus>('/verification/status');
      setData(result);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { data, loading, refresh };
}

// --- Dig ---

export interface DigStationResult {
  name: string;
  uuid: string;
  status: 'done' | 'partial' | 'failed';
  fieldsFilled: string[];
  valuesFound: Record<string, string>;
  error: string | null;
  duration: number;
  timestamp: string;
}

export interface DigJobStatus {
  status: 'idle' | 'running' | 'paused' | 'cancelled';
  processed: number;
  total: number;
  filled: Record<string, number>;
  errors: number;
  currentStation: string;
  results: DigStationResult[];
}

export interface DigStats {
  total: number;
  pending: number;
  done: number;
  partial: number;
  failed: number;
  neverAttempted: number;
}

export interface DigStatusResponse {
  job: DigJobStatus;
  stats: DigStats;
}

export function useDigStatus() {
  const [data, setData] = useState<DigStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminFetch<DigStatusResponse>('/dig/status');
      setData(result);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { data, loading, refresh };
}

export async function triggerAutocomplete() {
  return adminFetch<{ message: string }>('/dig/autocomplete', { method: 'POST' });
}

export async function triggerRecheck() {
  return adminFetch<{ message: string }>('/dig/recheck', { method: 'POST' });
}

export async function pauseDig() {
  return adminFetch<{ message: string }>('/dig/pause', { method: 'POST' });
}

export async function resumeDig() {
  return adminFetch<{ message: string }>('/dig/resume', { method: 'POST' });
}

export async function cancelDig() {
  return adminFetch<{ message: string }>('/dig/cancel', { method: 'POST' });
}

// --- Compare ---

export interface CompareFieldInfo {
  field: string;
  inRb: boolean;
  inAt: boolean;
  rbDesc: string;
  atDesc: string;
  modified: boolean;
  modifiedBy: string;
}

export interface CompareEndpointInfo {
  endpoint: string;
  notes: string;
}

export interface CompareData {
  fields: {
    imported: CompareFieldInfo[];
    dropped: CompareFieldInfo[];
    astrotuneOnly: CompareFieldInfo[];
    counts: { radioBrowser: number; imported: number; dropped: number; astrotuneOnly: number };
  };
  endpoints: {
    compatible: CompareEndpointInfo[];
    radioBrowserOnly: CompareEndpointInfo[];
    astrotuneOnly: CompareEndpointInfo[];
  };
  etlSteps: { name: string; description: string }[];
  behavioral: { aspect: string; radioBrowser: string; astrotune: string }[];
}

export function useCompareData() {
  const [data, setData] = useState<CompareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminFetch<CompareData>('/compare');
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load compare data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { data, loading, error, refresh };
}

export function useEtlLogs() {
  const [logs, setLogs] = useState<EtlLog[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<EtlLog[]>('/etl/logs');
      setLogs(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { logs, loading, refresh };
}
