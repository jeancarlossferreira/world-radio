import dns from 'dns/promises';
import { getDb } from '../db/connection.js';
import { config } from '../config.js';

const { verification: vConfig } = config;

let running = false;

export function isVerificationRunning(): boolean {
  return running;
}

interface StationRow {
  id: number;
  stationuuid: string;
  name: string;
  homepage: string;
  url_resolved: string;
  countrycode: string;
}

interface VerificationSummary {
  total: number;
  nameMatched: number;
  nameFailed: number;
  nameSkipped: number;
  countryMatched: number;
  countryFailed: number;
  countrySkipped: number;
  errors: number;
}

// --- Name Verification ---

function tokenizeName(name: string): string[] {
  return name
    .toLowerCase()
    .split(/[\s\-_.,!?()&/|]+/)
    .filter(t => t.length > 1 && !vConfig.noiseWords.has(t));
}

function extractTextFromHtml(html: string): string {
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : '';

  // Extract meta description
  const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i);
  const metaDesc = metaMatch ? metaMatch[1] : '';

  // Extract h1-h3
  const headings: string[] = [];
  const hRegex = /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi;
  let m;
  while ((m = hRegex.exec(html)) !== null) {
    headings.push(m[1]);
  }

  // Body text (first 5000 chars, strip tags)
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyRaw = bodyMatch ? bodyMatch[1] : html;
  const bodyText = bodyRaw.replace(/<[^>]+>/g, ' ').substring(0, 5000);

  return [title, metaDesc, ...headings, bodyText]
    .join(' ')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

export async function verifyStationName(name: string, homepage: string): Promise<boolean | null> {
  if (!homepage) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), vConfig.fetchTimeout);

  try {
    const res = await fetch(homepage, {
      signal: controller.signal,
      headers: { 'User-Agent': 'AstroTune-Verify/1.0' },
      redirect: 'follow',
    });

    if (!res.ok) return null;

    // Read only first 100KB to avoid hanging on huge pages
    const reader = res.body?.getReader();
    if (!reader) return null;

    const chunks: Uint8Array[] = [];
    let totalSize = 0;
    const maxSize = 100_000;

    while (totalSize < maxSize) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      totalSize += value.length;
    }
    reader.cancel().catch(() => {});

    const html = new TextDecoder().decode(Buffer.concat(chunks)).substring(0, maxSize);
    const pageText = extractTextFromHtml(html);
    const tokens = tokenizeName(name);

    if (tokens.length === 0) return null;

    const matched = tokens.filter(t => pageText.includes(t)).length;
    return matched / tokens.length >= vConfig.nameMatchThreshold;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// --- Country Verification ---

export async function resolveStationIp(urlResolved: string): Promise<string | null> {
  try {
    const hostname = new URL(urlResolved).hostname;
    const addresses = await dns.resolve4(hostname);
    return addresses[0] ?? null;
  } catch {
    return null;
  }
}

interface IpApiResult {
  query: string;
  status: string;
  countryCode?: string;
}

export async function batchGeolocateIps(
  entries: { id: number; ip: string }[]
): Promise<Map<number, string>> {
  const result = new Map<number, string>();
  const ipToIds = new Map<string, number[]>();

  for (const e of entries) {
    const ids = ipToIds.get(e.ip) || [];
    ids.push(e.id);
    ipToIds.set(e.ip, ids);
  }

  const uniqueIps = [...ipToIds.keys()];

  for (let i = 0; i < uniqueIps.length; i += vConfig.ipApiBatchSize) {
    const batch = uniqueIps.slice(i, i + vConfig.ipApiBatchSize);

    try {
      const res = await fetch('http://ip-api.com/batch?fields=query,status,countryCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch.map(ip => ({ query: ip }))),
      });

      if (res.ok) {
        const data: IpApiResult[] = await res.json();
        for (const item of data) {
          if (item.status === 'success' && item.countryCode) {
            const ids = ipToIds.get(item.query) || [];
            for (const id of ids) {
              result.set(id, item.countryCode);
            }
          }
        }
      }
    } catch (err) {
      console.error('ip-api batch failed:', err);
    }

    // Rate limit delay between batches
    if (i + vConfig.ipApiBatchSize < uniqueIps.length) {
      await new Promise(r => setTimeout(r, vConfig.ipApiBatchDelay));
    }
  }

  return result;
}

// --- Main Verification Runner ---

export async function runVerification(): Promise<VerificationSummary> {
  if (running) {
    throw new Error('Verification is already running');
  }

  running = true;
  const summary: VerificationSummary = {
    total: 0, nameMatched: 0, nameFailed: 0, nameSkipped: 0,
    countryMatched: 0, countryFailed: 0, countrySkipped: 0, errors: 0,
  };

  try {
    const db = getDb();

    const stations = db.prepare(`
      SELECT id, stationuuid, name, homepage, url_resolved, countrycode
      FROM stations
      WHERE verified_at IS NULL OR verified_at < datetime('now', '-7 days')
      LIMIT ?
    `).all(vConfig.batchSize) as StationRow[];

    summary.total = stations.length;
    if (stations.length === 0) return summary;

    console.log(`Verification: processing ${stations.length} stations`);

    const updateName = db.prepare(
      "UPDATE stations SET verified_name = ?, verified_at = datetime('now') WHERE id = ?"
    );
    const updateCountry = db.prepare(
      "UPDATE stations SET verified_country = ?, verified_country_actual = ?, verified_at = datetime('now') WHERE id = ?"
    );
    const updateTimestamp = db.prepare(
      "UPDATE stations SET verified_at = datetime('now') WHERE id = ?"
    );

    // --- Name pass with concurrency limit ---
    let nameProcessed = 0;
    const nameQueue = [...stations];
    const nameWorker = async () => {
      while (nameQueue.length > 0) {
        const station = nameQueue.shift()!;
        try {
          const result = await verifyStationName(station.name, station.homepage);
          nameProcessed++;
          if (result === null) {
            summary.nameSkipped++;
            updateTimestamp.run(station.id);
          } else if (result) {
            updateName.run(1, station.id);
            summary.nameMatched++;
          } else {
            updateName.run(0, station.id);
            summary.nameFailed++;
          }
          if (nameProcessed % 25 === 0) {
            console.log(`  Name pass: ${nameProcessed}/${summary.total} (matched=${summary.nameMatched}, failed=${summary.nameFailed}, skipped=${summary.nameSkipped})`);
          }
        } catch {
          summary.errors++;
          updateTimestamp.run(station.id);
        }
        // Small stagger between requests
        await new Promise(r => setTimeout(r, 200));
      }
    };

    const nameWorkers = Array.from(
      { length: vConfig.concurrency },
      () => nameWorker()
    );
    await Promise.all(nameWorkers);
    console.log(`  Name pass complete: matched=${summary.nameMatched}, failed=${summary.nameFailed}, skipped=${summary.nameSkipped}`);

    // --- Country pass: resolve IPs then batch geolocate ---
    console.log('  Starting country pass (DNS resolution)...');
    const ipEntries: { id: number; ip: string }[] = [];

    for (const station of stations) {
      if (!station.url_resolved) {
        summary.countrySkipped++;
        continue;
      }
      const ip = await resolveStationIp(station.url_resolved);
      if (ip) {
        ipEntries.push({ id: station.id, ip });
      } else {
        summary.countrySkipped++;
      }
    }

    console.log(`  DNS resolved ${ipEntries.length} IPs, geolocating...`);
    const geoResults = await batchGeolocateIps(ipEntries);

    for (const station of stations) {
      const actualCountry = geoResults.get(station.id);
      if (actualCountry) {
        const matches = actualCountry.toUpperCase() === station.countrycode.toUpperCase();
        updateCountry.run(matches ? 1 : 0, actualCountry, station.id);
        if (matches) summary.countryMatched++;
        else summary.countryFailed++;
      }
    }

    console.log('Verification complete:', summary);
    return summary;
  } finally {
    running = false;
  }
}

export function resetVerification(): void {
  const db = getDb();
  db.prepare(`
    UPDATE stations SET
      verified_name = NULL,
      verified_country = NULL,
      verified_country_actual = NULL,
      verified_at = NULL
  `).run();
}
