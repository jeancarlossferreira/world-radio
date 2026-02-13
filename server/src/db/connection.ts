import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const schemaPath = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  'schema.sql'
);

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  // Ensure data directory exists
  const dir = path.dirname(config.dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(config.dbPath);

  // Enable WAL mode for concurrent reads during writes
  db.pragma('journal_mode = WAL');
  db.pragma('busy_timeout = 5000');
  db.pragma('foreign_keys = ON');

  // Run schema
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);

  // Migrations: add verification columns
  const migrationCols = [
    'ALTER TABLE stations ADD COLUMN verified_name INTEGER',
    'ALTER TABLE stations ADD COLUMN verified_country INTEGER',
    'ALTER TABLE stations ADD COLUMN verified_country_actual TEXT',
    'ALTER TABLE stations ADD COLUMN verified_at TEXT',
  ];
  for (const sql of migrationCols) {
    try { db.exec(sql); } catch { /* column already exists */ }
  }
  db.exec('CREATE INDEX IF NOT EXISTS idx_stations_verified ON stations(verified_name, verified_country)');

  // Migrations: add dig columns
  const digMigrationCols = [
    'ALTER TABLE stations ADD COLUMN dig_status TEXT',
    'ALTER TABLE stations ADD COLUMN dig_at TEXT',
  ];
  for (const sql of digMigrationCols) {
    try { db.exec(sql); } catch { /* column already exists */ }
  }
  db.exec('CREATE INDEX IF NOT EXISTS idx_stations_dig_status ON stations(dig_status)');

  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
