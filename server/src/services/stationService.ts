import { getDb } from '../db/connection.js';

interface StationRow {
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
  has_extended_info: number;
  lastchangetime_iso8601: string;
  lastcheckok: number;
}

function formatStation(row: StationRow) {
  return {
    ...row,
    has_extended_info: row.has_extended_info === 1,
  };
}

function formatStations(rows: StationRow[]) {
  return rows.map(formatStation);
}

const STATION_COLUMNS = `changeuuid, stationuuid, name, url, url_resolved, homepage, favicon,
  tags, country, countrycode, state, language, codec, bitrate,
  votes, clickcount, clicktrend, geo_lat, geo_long, has_extended_info,
  lastchangetime_iso8601, lastcheckok`;

export function getTopStations(limit: number, offset: number, hidebroken: boolean) {
  const db = getDb();
  const brokenClause = hidebroken ? 'WHERE is_broken = 0' : '';
  const rows = db.prepare(`
    SELECT ${STATION_COLUMNS} FROM stations ${brokenClause}
    ORDER BY clickcount DESC LIMIT ? OFFSET ?
  `).all(limit, offset) as StationRow[];
  return formatStations(rows);
}

export function searchStations(params: {
  name?: string;
  tag?: string;
  country?: string;
  countrycode?: string;
  codec?: string;
  bitrateMin?: number;
  bitrateMax?: number;
  has_geo_info?: boolean;
  is_https?: boolean;
  order?: string;
  reverse?: boolean;
  offset?: number;
  limit?: number;
  hidebroken?: boolean;
}) {
  const db = getDb();
  const conditions: string[] = [];
  const bindings: (string | number)[] = [];

  if (params.hidebroken !== false) {
    conditions.push('is_broken = 0');
  }
  if (params.name) {
    conditions.push('name LIKE ?');
    bindings.push(`%${params.name}%`);
  }
  if (params.tag) {
    conditions.push('tags LIKE ?');
    bindings.push(`%${params.tag}%`);
  }
  if (params.country) {
    conditions.push('country LIKE ?');
    bindings.push(`%${params.country}%`);
  }
  if (params.countrycode) {
    conditions.push('UPPER(countrycode) = ?');
    bindings.push(params.countrycode.toUpperCase());
  }
  if (params.codec) {
    conditions.push('UPPER(codec) = ?');
    bindings.push(params.codec.toUpperCase());
  }
  if (params.bitrateMin) {
    conditions.push('bitrate >= ?');
    bindings.push(params.bitrateMin);
  }
  if (params.bitrateMax) {
    conditions.push('bitrate <= ?');
    bindings.push(params.bitrateMax);
  }
  if (params.has_geo_info) {
    conditions.push('geo_lat IS NOT NULL AND geo_long IS NOT NULL');
  }
  if (params.is_https) {
    conditions.push("url_resolved LIKE 'https://%'");
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedOrders = ['name', 'clickcount', 'bitrate', 'votes', 'country', 'tags', 'codec'];
  const orderCol = allowedOrders.includes(params.order || '') ? params.order : 'clickcount';
  const direction = params.reverse !== false ? 'DESC' : 'ASC';
  const limit = Math.min(params.limit || 30, 10000);
  const offset = params.offset || 0;

  bindings.push(limit, offset);

  const rows = db.prepare(`
    SELECT ${STATION_COLUMNS} FROM stations ${where}
    ORDER BY ${orderCol} ${direction} LIMIT ? OFFSET ?
  `).all(...bindings) as StationRow[];

  return formatStations(rows);
}

export function getStationsByCountryCode(code: string, limit: number, offset: number, hidebroken: boolean) {
  const db = getDb();
  const brokenClause = hidebroken ? 'AND is_broken = 0' : '';
  const rows = db.prepare(`
    SELECT ${STATION_COLUMNS} FROM stations
    WHERE UPPER(countrycode) = ? ${brokenClause}
    ORDER BY clickcount DESC LIMIT ? OFFSET ?
  `).all(code.toUpperCase(), limit, offset) as StationRow[];
  return formatStations(rows);
}

export function getStationByUuid(uuid: string) {
  const db = getDb();
  const row = db.prepare(`
    SELECT ${STATION_COLUMNS} FROM stations WHERE stationuuid = ?
  `).get(uuid) as StationRow | undefined;
  return row ? [formatStation(row)] : [];
}

export function getStationsByTag(tag: string, limit: number, offset: number, hidebroken: boolean) {
  const db = getDb();
  const brokenClause = hidebroken ? 'AND is_broken = 0' : '';
  const rows = db.prepare(`
    SELECT ${STATION_COLUMNS} FROM stations
    WHERE (',' || tags || ',') LIKE ? ${brokenClause}
    ORDER BY clickcount DESC LIMIT ? OFFSET ?
  `).all(`%,${tag.toLowerCase()},%`, limit, offset) as StationRow[];
  return formatStations(rows);
}

export function trackClick(uuid: string) {
  const db = getDb();
  db.prepare('UPDATE stations SET clickcount = clickcount + 1 WHERE stationuuid = ?').run(uuid);
  return { ok: true, message: 'Click tracked' };
}
