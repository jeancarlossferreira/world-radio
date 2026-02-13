CREATE TABLE IF NOT EXISTS stations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  changeuuid TEXT NOT NULL DEFAULT '',
  stationuuid TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  url TEXT NOT NULL DEFAULT '',
  url_resolved TEXT NOT NULL DEFAULT '',
  homepage TEXT NOT NULL DEFAULT '',
  favicon TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  countrycode TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT '',
  codec TEXT NOT NULL DEFAULT '',
  bitrate INTEGER NOT NULL DEFAULT 0,
  votes INTEGER NOT NULL DEFAULT 0,
  clickcount INTEGER NOT NULL DEFAULT 0,
  clicktrend INTEGER NOT NULL DEFAULT 0,
  geo_lat REAL,
  geo_long REAL,
  has_extended_info INTEGER NOT NULL DEFAULT 0,
  lastchangetime_iso8601 TEXT NOT NULL DEFAULT '',
  lastcheckok INTEGER NOT NULL DEFAULT 1,
  is_broken INTEGER NOT NULL DEFAULT 0,
  manually_added INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_stations_countrycode ON stations(countrycode);
CREATE INDEX IF NOT EXISTS idx_stations_clickcount ON stations(clickcount DESC);
CREATE INDEX IF NOT EXISTS idx_stations_url_resolved ON stations(url_resolved);
CREATE INDEX IF NOT EXISTS idx_stations_name ON stations(name);
CREATE INDEX IF NOT EXISTS idx_stations_tags ON stations(tags);
CREATE INDEX IF NOT EXISTS idx_stations_is_broken ON stations(is_broken);

CREATE TABLE IF NOT EXISTS countries (
  iso_3166_1 TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  stationcount INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tags (
  name TEXT PRIMARY KEY,
  stationcount INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS etl_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  finished_at TEXT,
  status TEXT NOT NULL DEFAULT 'running' CHECK(status IN ('running', 'success', 'error')),
  stations_extracted INTEGER NOT NULL DEFAULT 0,
  stations_loaded INTEGER NOT NULL DEFAULT 0,
  stations_skipped INTEGER NOT NULL DEFAULT 0,
  error_message TEXT
);
