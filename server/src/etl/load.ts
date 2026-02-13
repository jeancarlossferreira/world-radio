import type Database from 'better-sqlite3';
import type { TransformedStation } from './transform.js';
import { config } from '../config.js';

export function loadStations(db: Database.Database, stations: TransformedStation[]): number {
  console.log(`Loading ${stations.length} stations into database...`);

  // Remove stale non-manual stations before loading fresh data
  const deleted = db.prepare('DELETE FROM stations WHERE manually_added = 0').run();
  console.log(`  Cleared ${deleted.changes} stale stations`);

  const upsert = db.prepare(`
    INSERT INTO stations (
      changeuuid, stationuuid, name, url, url_resolved, homepage, favicon,
      tags, country, countrycode, state, language, codec, bitrate,
      votes, clickcount, clicktrend, geo_lat, geo_long, has_extended_info,
      lastchangetime_iso8601, lastcheckok, is_broken, updated_at
    ) VALUES (
      @changeuuid, @stationuuid, @name, @url, @url_resolved, @homepage, @favicon,
      @tags, @country, @countrycode, @state, @language, @codec, @bitrate,
      @votes, @clickcount, @clicktrend, @geo_lat, @geo_long, @has_extended_info,
      @lastchangetime_iso8601, @lastcheckok, @is_broken, datetime('now')
    )
    ON CONFLICT(stationuuid) DO UPDATE SET
      changeuuid = excluded.changeuuid,
      name = excluded.name,
      url = excluded.url,
      url_resolved = excluded.url_resolved,
      homepage = excluded.homepage,
      favicon = excluded.favicon,
      tags = excluded.tags,
      country = excluded.country,
      countrycode = excluded.countrycode,
      state = excluded.state,
      language = excluded.language,
      codec = excluded.codec,
      bitrate = excluded.bitrate,
      votes = excluded.votes,
      clickcount = excluded.clickcount,
      clicktrend = excluded.clicktrend,
      geo_lat = excluded.geo_lat,
      geo_long = excluded.geo_long,
      has_extended_info = excluded.has_extended_info,
      lastchangetime_iso8601 = excluded.lastchangetime_iso8601,
      lastcheckok = excluded.lastcheckok,
      is_broken = excluded.is_broken,
      updated_at = datetime('now')
    WHERE manually_added = 0
  `);

  const batchSize = 1000;
  let loaded = 0;

  const runBatch = db.transaction((batch: TransformedStation[]) => {
    for (const s of batch) {
      upsert.run(s);
      loaded++;
    }
  });

  for (let i = 0; i < stations.length; i += batchSize) {
    const batch = stations.slice(i, i + batchSize);
    runBatch(batch);
    if ((i + batchSize) % 10000 === 0 || i + batchSize >= stations.length) {
      console.log(`  Loaded ${Math.min(i + batchSize, stations.length)}/${stations.length}`);
    }
  }

  console.log(`Load complete: ${loaded} stations upserted`);
  return loaded;
}

export function rebuildAggregates(db: Database.Database): void {
  console.log('Rebuilding country and tag aggregates...');

  db.exec(`
    DELETE FROM countries;
    INSERT INTO countries (iso_3166_1, name, stationcount)
    SELECT countrycode, country, COUNT(*) as stationcount
    FROM stations
    WHERE countrycode != '' AND is_broken = 0
    GROUP BY countrycode
    ORDER BY stationcount DESC;
  `);

  const countryCount = db.prepare('SELECT COUNT(*) as c FROM countries').get() as { c: number };
  console.log(`  Rebuilt ${countryCount.c} countries`);

  // Rebuild tags by splitting the comma-separated tags column
  db.exec(`DELETE FROM tags`);

  // Use a WITH RECURSIVE CTE to split tags
  db.exec(`
    INSERT INTO tags (name, stationcount)
    WITH RECURSIVE split(stationuuid, tag, rest) AS (
      SELECT stationuuid,
        CASE WHEN INSTR(tags, ',') > 0
          THEN TRIM(SUBSTR(tags, 1, INSTR(tags, ',') - 1))
          ELSE TRIM(tags)
        END,
        CASE WHEN INSTR(tags, ',') > 0
          THEN SUBSTR(tags, INSTR(tags, ',') + 1)
          ELSE ''
        END
      FROM stations
      WHERE tags != '' AND is_broken = 0
      UNION ALL
      SELECT stationuuid,
        CASE WHEN INSTR(rest, ',') > 0
          THEN TRIM(SUBSTR(rest, 1, INSTR(rest, ',') - 1))
          ELSE TRIM(rest)
        END,
        CASE WHEN INSTR(rest, ',') > 0
          THEN SUBSTR(rest, INSTR(rest, ',') + 1)
          ELSE ''
        END
      FROM split
      WHERE rest != ''
    )
    SELECT tag, COUNT(DISTINCT stationuuid) as stationcount
    FROM split
    WHERE tag != ''
    GROUP BY tag
    HAVING stationcount >= ${config.etl.minTagStationCount}
    ORDER BY stationcount DESC;
  `);

  const tagCount = db.prepare('SELECT COUNT(*) as c FROM tags').get() as { c: number };
  console.log(`  Rebuilt ${tagCount.c} tags`);

  // Strip non-curated tags from station rows so only approved tags remain
  cleanStationTags(db);
}

function cleanStationTags(db: Database.Database): void {
  console.log('Cleaning station tags to match curated list...');

  const approvedTags = new Set(
    (db.prepare('SELECT name FROM tags').all() as { name: string }[]).map(r => r.name)
  );

  const stations = db.prepare("SELECT id, tags FROM stations WHERE tags != ''").all() as { id: number; tags: string }[];
  const update = db.prepare('UPDATE stations SET tags = ? WHERE id = ?');

  let cleaned = 0;
  const runBatch = db.transaction((batch: { id: number; tags: string }[]) => {
    for (const s of batch) {
      const original = s.tags.split(',').map(t => t.trim()).filter(Boolean);
      const filtered = original.filter(t => approvedTags.has(t));
      if (filtered.length !== original.length) {
        update.run(filtered.join(','), s.id);
        cleaned++;
      }
    }
  });

  const batchSize = 1000;
  for (let i = 0; i < stations.length; i += batchSize) {
    runBatch(stations.slice(i, i + batchSize));
  }

  console.log(`  Cleaned tags on ${cleaned} stations`);
}
