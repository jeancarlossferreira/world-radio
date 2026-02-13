import { config } from '../config.js';

const { radioBrowserBase, pageSize, maxRetries, delayBetweenPages } = config.etl;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, attempt = 1): Promise<Response> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'AstroTune-ETL/1.0' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return res;
  } catch (err) {
    if (attempt >= maxRetries) throw err;
    const delay = 1000 * Math.pow(2, attempt - 1);
    console.log(`  Retry ${attempt}/${maxRetries} after ${delay}ms...`);
    await sleep(delay);
    return fetchWithRetry(url, attempt + 1);
  }
}

export interface RawStation {
  changeuuid: string;
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
  language: string;
  codec: string;
  bitrate: number;
  votes: number;
  clickcount: number;
  clicktrend: number;
  geo_lat: number | null;
  geo_long: number | null;
  has_extended_info: boolean;
  lastchangetime_iso8601: string;
  lastcheckok: number;
}

export interface RawCountry {
  name: string;
  iso_3166_1: string;
  stationcount: number;
}

export interface RawTag {
  name: string;
  stationcount: number;
}

export async function extractStations(onProgress?: (count: number) => void): Promise<RawStation[]> {
  const allStations: RawStation[] = [];
  let offset = 0;

  console.log('Extracting stations from Radio Browser...');

  while (true) {
    const url = `${radioBrowserBase}/json/stations?limit=${pageSize}&offset=${offset}&order=clickcount&reverse=true`;
    const res = await fetchWithRetry(url);
    const page: RawStation[] = await res.json();

    allStations.push(...page);
    onProgress?.(allStations.length);
    console.log(`  Fetched page at offset ${offset}: ${page.length} stations (total: ${allStations.length})`);

    if (page.length < pageSize) break;

    offset += pageSize;
    await sleep(delayBetweenPages);
  }

  console.log(`Extraction complete: ${allStations.length} stations`);
  return allStations;
}

export async function extractCountries(): Promise<RawCountry[]> {
  console.log('Extracting countries...');
  const url = `${radioBrowserBase}/json/countries`;
  const res = await fetchWithRetry(url);
  const countries: RawCountry[] = await res.json();
  console.log(`  Extracted ${countries.length} countries`);
  return countries;
}

export async function extractTags(): Promise<RawTag[]> {
  console.log('Extracting tags...');
  const url = `${radioBrowserBase}/json/tags?limit=1000&order=stationcount&reverse=true`;
  const res = await fetchWithRetry(url);
  const tags: RawTag[] = await res.json();
  console.log(`  Extracted ${tags.length} tags`);
  return tags;
}
