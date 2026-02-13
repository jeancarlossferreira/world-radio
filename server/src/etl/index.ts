import fs from 'fs';
import path from 'path';
import { getDb } from '../db/connection.js';
import { config } from '../config.js';
import { extractStations } from './extract.js';
import { transformStations, type SkippedStation } from './transform.js';
import { loadStations, rebuildAggregates } from './load.js';

const SKIP_LOGS_DIR = path.join(path.dirname(config.dbPath), 'etl-skip-logs');

function ensureSkipLogsDir() {
  if (!fs.existsSync(SKIP_LOGS_DIR)) {
    fs.mkdirSync(SKIP_LOGS_DIR, { recursive: true });
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function generateSkipLogHtml(logId: number | bigint, skippedDetails: SkippedStation[], timestamp: string): string {
  const reasonCounts = new Map<string, number>();
  for (const s of skippedDetails) {
    const key = s.reason.startsWith('duplicate') ? 'duplicate url_resolved' : s.reason;
    reasonCounts.set(key, (reasonCounts.get(key) || 0) + 1);
  }

  const summaryRows = [...reasonCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([reason, count]) => `<tr><td>${escapeHtml(reason)}</td><td style="text-align:right">${count.toLocaleString()}</td></tr>`)
    .join('\n');

  const tableRows = skippedDetails
    .map((s, i) =>
      `<tr><td>${i + 1}</td><td>${escapeHtml(s.name)}</td><td style="font-family:monospace;font-size:12px">${escapeHtml(s.stationuuid)}</td><td style="max-width:400px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(s.url_resolved)}</td><td>${escapeHtml(s.reason)}</td></tr>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ETL Skip Log #${logId} — ${timestamp}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 1400px; margin: 0 auto; padding: 20px; background: #1d232a; color: #a6adbb; }
  h1, h2 { color: #e0e0e0; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 24px; }
  th, td { border: 1px solid #383f47; padding: 6px 10px; text-align: left; font-size: 13px; }
  th { background: #2a323c; color: #e0e0e0; position: sticky; top: 0; }
  tr:hover { background: #2a323c; }
  .summary { max-width: 500px; margin-bottom: 32px; }
  .summary td:first-child { font-weight: 600; }
  .meta { color: #888; margin-bottom: 16px; }
  input[type="search"] { padding: 6px 12px; border: 1px solid #383f47; border-radius: 6px; background: #2a323c; color: #a6adbb; width: 300px; margin-bottom: 12px; font-size: 14px; }
</style>
</head>
<body>
<h1>ETL Skip Log #${logId}</h1>
<p class="meta">Generated: ${timestamp} — Total skipped: ${skippedDetails.length.toLocaleString()}</p>

<h2>Summary by Reason</h2>
<table class="summary">
<thead><tr><th>Reason</th><th style="text-align:right">Count</th></tr></thead>
<tbody>${summaryRows}</tbody>
</table>

<h2>Skipped Stations</h2>
<input type="search" id="filter" placeholder="Filter by name, uuid, or reason..." oninput="filterTable()">
<table id="skip-table">
<thead><tr><th>#</th><th>Name</th><th>UUID</th><th>URL Resolved</th><th>Reason</th></tr></thead>
<tbody>${tableRows}</tbody>
</table>

<script>
function filterTable() {
  const q = document.getElementById('filter').value.toLowerCase();
  const rows = document.querySelectorAll('#skip-table tbody tr');
  rows.forEach(r => { r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none'; });
}
</script>
</body>
</html>`;
}

export function getSkipLogPath(logId: number | string): string | null {
  const filePath = path.join(SKIP_LOGS_DIR, `skip-log-${logId}.html`);
  return fs.existsSync(filePath) ? filePath : null;
}

let running = false;

export function isEtlRunning(): boolean {
  return running;
}

export async function runEtl(): Promise<void> {
  if (running) {
    throw new Error('ETL is already running');
  }

  running = true;
  const db = getDb();

  // Create ETL log entry
  const logInsert = db.prepare(
    `INSERT INTO etl_logs (status) VALUES ('running')`
  );
  const { lastInsertRowid: logId } = logInsert.run();

  try {
    // Extract
    const rawStations = await extractStations();

    db.prepare('UPDATE etl_logs SET stations_extracted = ? WHERE id = ?')
      .run(rawStations.length, logId);

    // Transform
    const { stations, skipped, skippedDetails } = transformStations(rawStations);

    // Save skip log HTML
    if (skippedDetails.length > 0) {
      ensureSkipLogsDir();
      const html = generateSkipLogHtml(logId, skippedDetails, new Date().toISOString());
      fs.writeFileSync(path.join(SKIP_LOGS_DIR, `skip-log-${logId}.html`), html, 'utf-8');
      console.log(`  Skip log saved: ${skippedDetails.length} entries`);
    }

    // Load
    const loaded = loadStations(db, stations);

    // Rebuild aggregates
    rebuildAggregates(db);

    // Update log
    db.prepare(`
      UPDATE etl_logs SET
        status = 'success',
        finished_at = datetime('now'),
        stations_loaded = ?,
        stations_skipped = ?
      WHERE id = ?
    `).run(loaded, skipped, logId);

    console.log(`ETL complete: ${loaded} loaded, ${skipped} skipped`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    db.prepare(`
      UPDATE etl_logs SET
        status = 'error',
        finished_at = datetime('now'),
        error_message = ?
      WHERE id = ?
    `).run(message, logId);

    console.error('ETL failed:', message);
    throw err;
  } finally {
    running = false;
  }
}
