import type { Station } from '@/types/station';
import type { Country, Tag, SearchParams } from '@/types/api';
import { API_BASE, DEFAULT_PAGE_SIZE } from './constants';

async function apiFetch<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  const url = new URL(`${API_BASE}${endpoint}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'WorldRadioApp/1.0' },
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function getTopStations(limit = DEFAULT_PAGE_SIZE, offset = 0): Promise<Station[]> {
  return apiFetch<Station[]>('/json/stations/topclick', {
    limit,
    offset,
    hidebroken: true,
  });
}

export async function searchStations(params: SearchParams): Promise<Station[]> {
  return apiFetch<Station[]>('/json/stations/search', {
    name: params.name,
    tag: params.tag,
    country: params.country,
    countrycode: params.countrycode,
    codec: params.codec,
    bitrateMin: params.bitrateMin,
    bitrateMax: params.bitrateMax,
    has_geo_info: params.has_geo_info,
    is_https: params.is_https,
    order: params.order || 'clickcount',
    reverse: params.reverse ?? true,
    offset: params.offset || 0,
    limit: params.limit || DEFAULT_PAGE_SIZE,
    hidebroken: params.hidebroken ?? true,
  });
}

export async function getCountries(): Promise<Country[]> {
  return apiFetch<Country[]>('/json/countries', {
    order: 'stationcount',
    reverse: true,
    hidebroken: true,
  });
}

export async function getTags(limit = 100): Promise<Tag[]> {
  return apiFetch<Tag[]>('/json/tags', {
    order: 'stationcount',
    reverse: true,
    limit,
    hidebroken: true,
  });
}

export async function getStationsByCountry(countrycode: string, limit = DEFAULT_PAGE_SIZE, offset = 0): Promise<Station[]> {
  return apiFetch<Station[]>(`/json/stations/bycountrycodeexact/${encodeURIComponent(countrycode)}`, {
    limit,
    offset,
    hidebroken: true,
    order: 'clickcount',
    reverse: true,
  });
}

export async function getStationByUUID(uuid: string): Promise<Station | null> {
  const stations = await apiFetch<Station[]>(`/json/stations/byuuid/${encodeURIComponent(uuid)}`);
  return stations[0] ?? null;
}

export async function trackStationClick(stationuuid: string): Promise<void> {
  try {
    await apiFetch(`/json/url/${encodeURIComponent(stationuuid)}`);
  } catch {
    // Click tracking is best-effort
  }
}

export async function getStationsByTag(tag: string, limit = DEFAULT_PAGE_SIZE, offset = 0): Promise<Station[]> {
  return apiFetch<Station[]>('/json/stations/bytag/' + encodeURIComponent(tag), {
    limit,
    offset,
    hidebroken: true,
    order: 'clickcount',
    reverse: true,
  });
}
