import { getDb } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

export function getStats() {
  const db = getDb();
  const totalStations = (db.prepare('SELECT COUNT(*) as c FROM stations').get() as { c: number }).c;
  const brokenStations = (db.prepare('SELECT COUNT(*) as c FROM stations WHERE is_broken = 1').get() as { c: number }).c;
  const manualStations = (db.prepare('SELECT COUNT(*) as c FROM stations WHERE manually_added = 1').get() as { c: number }).c;
  const totalCountries = (db.prepare('SELECT COUNT(*) as c FROM countries').get() as { c: number }).c;
  const totalTags = (db.prepare('SELECT COUNT(*) as c FROM tags').get() as { c: number }).c;

  const topCountries = db.prepare(`
    SELECT iso_3166_1, name, stationcount FROM countries
    ORDER BY stationcount DESC LIMIT 10
  `).all();

  const lastEtl = db.prepare(`
    SELECT * FROM etl_logs ORDER BY id DESC LIMIT 1
  `).get();

  return {
    totalStations,
    brokenStations,
    manualStations,
    totalCountries,
    totalTags,
    topCountries,
    lastEtl,
  };
}

export function getStationsPaginated(params: {
  page?: number;
  limit?: number;
  search?: string;
  is_broken?: boolean;
  manually_added?: boolean;
  incomplete?: boolean;
  missing_fields?: string[];
}) {
  const db = getDb();
  const page = params.page || 1;
  const limit = Math.min(params.limit || 50, 200);
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const bindings: (string | number)[] = [];

  if (params.search) {
    conditions.push('(name LIKE ? OR tags LIKE ? OR country LIKE ?)');
    const term = `%${params.search}%`;
    bindings.push(term, term, term);
  }
  if (params.is_broken !== undefined) {
    conditions.push('is_broken = ?');
    bindings.push(params.is_broken ? 1 : 0);
  }
  if (params.manually_added !== undefined) {
    conditions.push('manually_added = ?');
    bindings.push(params.manually_added ? 1 : 0);
  }

  // Specific missing field filters
  const allowedMissingFields: Record<string, string> = {
    tags: "tags = ''",
    countrycode: "countrycode = ''",
    language: "language = ''",
    homepage: "homepage = ''",
    favicon: "favicon = ''",
    codec: "codec = ''",
    bitrate: "bitrate = 0",
  };

  if (params.missing_fields && params.missing_fields.length > 0) {
    const fieldConditions = params.missing_fields
      .filter(f => f in allowedMissingFields)
      .map(f => allowedMissingFields[f]);
    if (fieldConditions.length > 0) {
      conditions.push(...fieldConditions);
    }
  } else if (params.incomplete === true) {
    conditions.push("(tags = '' OR countrycode = '' OR language = '' OR homepage = '' OR favicon = '' OR codec = '' OR bitrate = 0)");
  } else if (params.incomplete === false) {
    conditions.push("tags != '' AND countrycode != '' AND language != '' AND homepage != '' AND favicon != '' AND codec != '' AND bitrate > 0");
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const total = (db.prepare(`SELECT COUNT(*) as c FROM stations ${where}`).get(...bindings) as { c: number }).c;

  const rows = db.prepare(`
    SELECT * FROM stations ${where}
    ORDER BY name COLLATE NOCASE ASC LIMIT ? OFFSET ?
  `).all(...bindings, limit, offset);

  return { stations: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export function getStationByUuid(uuid: string) {
  const db = getDb();
  return db.prepare('SELECT * FROM stations WHERE stationuuid = ?').get(uuid) ?? null;
}

export function createStation(data: {
  name: string;
  url: string;
  url_resolved: string;
  homepage?: string;
  favicon?: string;
  tags?: string;
  country?: string;
  countrycode?: string;
  language?: string;
  codec?: string;
  bitrate?: number;
  geo_lat?: number | null;
  geo_long?: number | null;
}) {
  const db = getDb();
  const stationuuid = uuidv4();

  db.prepare(`
    INSERT INTO stations (
      stationuuid, changeuuid, name, url, url_resolved, homepage, favicon,
      tags, country, countrycode, state, language, codec, bitrate,
      geo_lat, geo_long, manually_added, lastcheckok, has_extended_info,
      lastchangetime_iso8601
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, '', ?, ?, ?,
      ?, ?, 1, 1, 0,
      datetime('now')
    )
  `).run(
    stationuuid, stationuuid, data.name, data.url, data.url_resolved,
    data.homepage || '', data.favicon || '',
    data.tags || '', data.country || '', (data.countrycode || '').toUpperCase(),
    data.language || '', data.codec || '', data.bitrate || 0,
    data.geo_lat ?? null, data.geo_long ?? null,
  );

  return { stationuuid };
}

export function updateStation(uuid: string, data: Record<string, unknown>) {
  const db = getDb();
  const allowed = [
    'name', 'url', 'url_resolved', 'homepage', 'favicon', 'tags',
    'country', 'countrycode', 'language', 'codec', 'bitrate',
    'geo_lat', 'geo_long', 'is_broken',
  ];

  const sets: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (allowed.includes(key)) {
      sets.push(`${key} = ?`);
      values.push(key === 'countrycode' ? String(value).toUpperCase() : value);
    }
  }

  if (sets.length === 0) return { updated: false };

  sets.push("updated_at = datetime('now')");
  values.push(uuid);

  const result = db.prepare(`UPDATE stations SET ${sets.join(', ')} WHERE stationuuid = ?`).run(...values);
  return { updated: result.changes > 0 };
}

export function deleteStation(uuid: string) {
  const db = getDb();
  const result = db.prepare('DELETE FROM stations WHERE stationuuid = ?').run(uuid);
  return { deleted: result.changes > 0 };
}

export function getVerificationStats() {
  const db = getDb();
  const total = (db.prepare('SELECT COUNT(*) as c FROM stations').get() as { c: number }).c;
  const verified = (db.prepare('SELECT COUNT(*) as c FROM stations WHERE verified_at IS NOT NULL').get() as { c: number }).c;
  const nameMatch = (db.prepare('SELECT COUNT(*) as c FROM stations WHERE verified_name = 1').get() as { c: number }).c;
  const nameFail = (db.prepare('SELECT COUNT(*) as c FROM stations WHERE verified_name = 0').get() as { c: number }).c;
  const countryMatch = (db.prepare('SELECT COUNT(*) as c FROM stations WHERE verified_country = 1').get() as { c: number }).c;
  const countryFail = (db.prepare('SELECT COUNT(*) as c FROM stations WHERE verified_country = 0').get() as { c: number }).c;
  const pending = total - verified;

  return { total, verified, nameMatch, nameFail, countryMatch, countryFail, pending };
}

export function getDigStats() {
  const db = getDb();
  const total = (db.prepare('SELECT COUNT(*) as c FROM stations').get() as { c: number }).c;
  const done = (db.prepare("SELECT COUNT(*) as c FROM stations WHERE dig_status = 'done'").get() as { c: number }).c;
  const partial = (db.prepare("SELECT COUNT(*) as c FROM stations WHERE dig_status = 'partial'").get() as { c: number }).c;
  const failed = (db.prepare("SELECT COUNT(*) as c FROM stations WHERE dig_status = 'failed'").get() as { c: number }).c;
  const pending = (db.prepare("SELECT COUNT(*) as c FROM stations WHERE dig_status = 'pending'").get() as { c: number }).c;
  const neverAttempted = (db.prepare("SELECT COUNT(*) as c FROM stations WHERE dig_status IS NULL").get() as { c: number }).c;

  return { total, pending, done, partial, failed, neverAttempted };
}

export function getEtlLogs(limit = 20) {
  const db = getDb();
  return db.prepare('SELECT * FROM etl_logs ORDER BY id DESC LIMIT ?').all(limit);
}

export function getAllTags() {
  const db = getDb();
  return db.prepare('SELECT name, stationcount FROM tags ORDER BY stationcount DESC').all();
}

export function updateTag(oldName: string, newName: string) {
  const db = getDb();
  const trimmed = newName.trim().toLowerCase();
  if (!trimmed) return { updated: false };

  const tx = db.transaction(() => {
    // Rename the tag in all stations that have it
    const stations = db.prepare(
      "SELECT id, tags FROM stations WHERE ',' || tags || ',' LIKE '%,' || ? || ',%'"
    ).all(oldName) as { id: number; tags: string }[];

    for (const s of stations) {
      const tagList = s.tags.split(',').map(t => t.trim());
      const updated = tagList.map(t => t === oldName ? trimmed : t);
      const unique = [...new Set(updated)].join(',');
      db.prepare('UPDATE stations SET tags = ? WHERE id = ?').run(unique, s.id);
    }

    // Update or merge in the tags table
    const existing = db.prepare('SELECT stationcount FROM tags WHERE name = ?').get(trimmed) as { stationcount: number } | undefined;
    if (existing && trimmed !== oldName) {
      // Merge counts — actual count will be rebuilt, just remove old
      db.prepare('DELETE FROM tags WHERE name = ?').run(oldName);
    } else {
      db.prepare('UPDATE tags SET name = ? WHERE name = ?').run(trimmed, oldName);
    }

    return stations.length;
  });

  const affected = tx();
  return { updated: true, stationsAffected: affected };
}

export function deleteTag(name: string) {
  const db = getDb();

  const tx = db.transaction(() => {
    // Remove the tag from all stations
    const stations = db.prepare(
      "SELECT id, tags FROM stations WHERE ',' || tags || ',' LIKE '%,' || ? || ',%'"
    ).all(name) as { id: number; tags: string }[];

    for (const s of stations) {
      const tagList = s.tags.split(',').map(t => t.trim()).filter(t => t !== name);
      db.prepare('UPDATE stations SET tags = ? WHERE id = ?').run(tagList.join(','), s.id);
    }

    db.prepare('DELETE FROM tags WHERE name = ?').run(name);
    return stations.length;
  });

  const affected = tx();
  return { deleted: true, stationsAffected: affected };
}
