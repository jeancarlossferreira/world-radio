import type { FastifyInstance } from 'fastify';
import { getDb } from '../db/connection.js';

// ── Types ──────────────────────────────────────────────────────────────────

interface FieldAnnotation {
  rbDesc: string;
  atDesc: string;
  modified: boolean;
  modifiedBy: '—' | 'ETL' | 'Dig' | 'ETL + Dig';
}

interface FieldInfo {
  field: string;
  inRb: boolean;
  inAt: boolean;
  rbDesc: string;
  atDesc: string;
  modified: boolean;
  modifiedBy: string;
}

interface EndpointInfo {
  endpoint: string;
  notes: string;
}

interface CompareData {
  fields: {
    imported: FieldInfo[];
    dropped: FieldInfo[];
    astrotuneOnly: FieldInfo[];
    counts: { radioBrowser: number; imported: number; dropped: number; astrotuneOnly: number };
  };
  endpoints: {
    compatible: EndpointInfo[];
    radioBrowserOnly: EndpointInfo[];
    astrotuneOnly: EndpointInfo[];
  };
  etlSteps: { name: string; description: string }[];
  behavioral: { aspect: string; radioBrowser: string; astrotune: string }[];
}

// ── Static: Radio Browser known fields ─────────────────────────────────────

const RADIO_BROWSER_FIELDS = new Set([
  'changeuuid', 'stationuuid', 'serveruuid', 'name', 'url', 'url_resolved',
  'homepage', 'favicon', 'tags', 'country', 'countrycode', 'iso_3166_2',
  'state', 'language', 'languagecodes', 'votes', 'lastchangetime',
  'lastchangetime_iso8601', 'codec', 'bitrate', 'hls', 'lastcheckok',
  'lastchecktime', 'lastchecktime_iso8601', 'lastcheckoktime',
  'lastcheckoktime_iso8601', 'lastlocalchecktime', 'lastlocalchecktime_iso8601',
  'clickcount', 'clicktrend', 'clicktimestamp', 'clicktimestamp_iso8601',
  'ssl_error', 'geo_lat', 'geo_long', 'geo_distance', 'has_extended_info',
]);

// ── Static: Field annotations ──────────────────────────────────────────────

const FIELD_ANNOTATIONS: Record<string, FieldAnnotation> = {
  // Imported fields
  changeuuid:              { rbDesc: 'UUID of the last change entry', atDesc: 'Imported as-is for tracking', modified: false, modifiedBy: '—' },
  stationuuid:             { rbDesc: 'Unique station identifier', atDesc: 'Primary key for lookups', modified: false, modifiedBy: '—' },
  name:                    { rbDesc: 'User-submitted station name', atDesc: 'Imported as-is', modified: false, modifiedBy: '—' },
  url:                     { rbDesc: 'Original stream URL submitted', atDesc: 'Stored for reference', modified: false, modifiedBy: '—' },
  url_resolved:            { rbDesc: 'Resolved/redirected stream URL', atDesc: 'Used for playback and dedup', modified: false, modifiedBy: '—' },
  homepage:                { rbDesc: 'Station website URL', atDesc: 'Dig can discover or validate it', modified: true, modifiedBy: 'Dig' },
  favicon:                 { rbDesc: 'Station icon URL', atDesc: 'Dig fills via HTML/favicon.ico/Google S2', modified: true, modifiedBy: 'Dig' },
  tags:                    { rbDesc: 'Comma-separated genre tags', atDesc: 'Normalized, translated, deduplicated, curated', modified: true, modifiedBy: 'ETL + Dig' },
  country:                 { rbDesc: 'Country name', atDesc: 'Imported as-is', modified: true, modifiedBy: 'Dig' },
  countrycode:             { rbDesc: 'ISO 3166-1 alpha-2 code', atDesc: 'Gap-filled from country name when missing', modified: true, modifiedBy: 'ETL + Dig' },
  state:                   { rbDesc: 'Administrative region/state', atDesc: 'Read-only, used to auto-fill local', modified: false, modifiedBy: '—' },
  language:                { rbDesc: 'Broadcast language(s)', atDesc: 'Dig infers from homepage lang tag', modified: true, modifiedBy: 'Dig' },
  codec:                   { rbDesc: 'Audio codec (MP3, AAC, etc.)', atDesc: 'Gap-filled from URL extension or stream headers', modified: true, modifiedBy: 'ETL + Dig' },
  bitrate:                 { rbDesc: 'Stream bitrate in kbps', atDesc: 'Dig infers from icy-br header', modified: true, modifiedBy: 'Dig' },
  votes:                   { rbDesc: 'Community vote count', atDesc: 'Imported but read-only, voting disabled', modified: false, modifiedBy: '—' },
  lastchangetime_iso8601:  { rbDesc: 'Last modification timestamp', atDesc: 'Imported for freshness tracking', modified: false, modifiedBy: '—' },
  lastcheckok:             { rbDesc: 'Last stream check passed (0/1)', atDesc: 'Used to derive is_broken', modified: false, modifiedBy: '—' },
  clickcount:              { rbDesc: 'Total click/play count', atDesc: 'Local tracking only, not synced back', modified: false, modifiedBy: '—' },
  clicktrend:              { rbDesc: 'Recent click trend score', atDesc: 'Imported as-is', modified: false, modifiedBy: '—' },
  geo_lat:                 { rbDesc: 'Latitude coordinate', atDesc: 'Dig enriches via address geocoding', modified: true, modifiedBy: 'Dig' },
  geo_long:                { rbDesc: 'Longitude coordinate', atDesc: 'Dig enriches via address geocoding', modified: true, modifiedBy: 'Dig' },
  has_extended_info:       { rbDesc: 'Has extra metadata flag', atDesc: 'Stored as 0/1, returned as boolean', modified: false, modifiedBy: '—' },

  // Dropped fields (in RB but not in AT)
  serveruuid:                    { rbDesc: 'Internal server identifier', atDesc: 'Not relevant to local DB', modified: false, modifiedBy: '—' },
  iso_3166_2:                    { rbDesc: 'Sub-country code (e.g. "US-CA")', atDesc: 'Not used', modified: false, modifiedBy: '—' },
  languagecodes:                 { rbDesc: 'ISO 639 language codes', atDesc: 'Not used', modified: false, modifiedBy: '—' },
  lastchangetime:                { rbDesc: 'Last change (non-ISO format)', atDesc: 'Redundant with _iso8601 version', modified: false, modifiedBy: '—' },
  hls:                           { rbDesc: 'HLS stream flag', atDesc: 'Not used', modified: false, modifiedBy: '—' },
  lastchecktime:                 { rbDesc: 'Last check (non-ISO format)', atDesc: 'Redundant timestamp', modified: false, modifiedBy: '—' },
  lastchecktime_iso8601:         { rbDesc: 'Last stream check timestamp', atDesc: 'Not needed locally', modified: false, modifiedBy: '—' },
  lastcheckoktime:               { rbDesc: 'Last OK check (non-ISO)', atDesc: 'Redundant timestamp', modified: false, modifiedBy: '—' },
  lastcheckoktime_iso8601:       { rbDesc: 'Last successful check timestamp', atDesc: 'Not needed locally', modified: false, modifiedBy: '—' },
  lastlocalchecktime:            { rbDesc: 'Last local check (non-ISO)', atDesc: 'Redundant timestamp', modified: false, modifiedBy: '—' },
  lastlocalchecktime_iso8601:    { rbDesc: 'Last local check timestamp', atDesc: 'Not needed locally', modified: false, modifiedBy: '—' },
  clicktimestamp:                { rbDesc: 'Last click (non-ISO)', atDesc: 'Redundant timestamp', modified: false, modifiedBy: '—' },
  clicktimestamp_iso8601:        { rbDesc: 'Last click timestamp', atDesc: 'Not needed locally', modified: false, modifiedBy: '—' },
  ssl_error:                     { rbDesc: 'SSL certificate error code', atDesc: 'Not replicated', modified: false, modifiedBy: '—' },
  geo_distance:                  { rbDesc: 'Distance from requester (km)', atDesc: 'Computed per-request, not applicable', modified: false, modifiedBy: '—' },

  // AstroTune-only fields
  local:                    { rbDesc: '—', atDesc: 'City/locality, auto-filled from state or set manually', modified: true, modifiedBy: 'ETL' },
  is_aggregator:            { rbDesc: '—', atDesc: 'Stream hosted on aggregator platform (ETL-detected)', modified: true, modifiedBy: 'ETL' },
  aggregator_name:          { rbDesc: '—', atDesc: 'Aggregator domain (e.g. "zeno.fm")', modified: true, modifiedBy: 'ETL' },
  is_broken:                { rbDesc: '—', atDesc: 'Inverted lastcheckok for convenience', modified: true, modifiedBy: 'ETL' },
  manually_added:           { rbDesc: '—', atDesc: 'Station added via admin, survives ETL refresh', modified: false, modifiedBy: '—' },
  verified_name:            { rbDesc: '—', atDesc: 'Name verified against homepage (NULL/0/1)', modified: true, modifiedBy: 'Dig' },
  verified_country:         { rbDesc: '—', atDesc: 'IP country matches countrycode (NULL/0/1)', modified: true, modifiedBy: 'Dig' },
  verified_country_actual:  { rbDesc: '—', atDesc: 'Actual country from IP geolocation', modified: true, modifiedBy: 'Dig' },
  verified_at:              { rbDesc: '—', atDesc: 'Timestamp of verification run', modified: true, modifiedBy: 'Dig' },
  is_dug:                   { rbDesc: '—', atDesc: 'Whether dig autocomplete has processed this station', modified: true, modifiedBy: 'Dig' },
  dig_status:               { rbDesc: '—', atDesc: 'Dig result: done, partial, or failed', modified: true, modifiedBy: 'Dig' },
  dig_at:                   { rbDesc: '—', atDesc: 'Timestamp of last dig attempt', modified: true, modifiedBy: 'Dig' },

  // Internal fields (auto-managed, not from RB)
  id:                       { rbDesc: '—', atDesc: 'Auto-increment primary key', modified: false, modifiedBy: '—' },
  created_at:               { rbDesc: '—', atDesc: 'Row creation timestamp', modified: false, modifiedBy: '—' },
  updated_at:               { rbDesc: '—', atDesc: 'Row last update timestamp', modified: false, modifiedBy: '—' },
};

// ── Static: Radio Browser endpoints ────────────────────────────────────────

const RADIO_BROWSER_ENDPOINTS: EndpointInfo[] = [
  { endpoint: 'GET /json/stations/topclick', notes: '' },
  { endpoint: 'GET /json/stations/search', notes: '' },
  { endpoint: 'GET /json/stations/bycountrycodeexact/:code', notes: '' },
  { endpoint: 'GET /json/stations/byuuid/:uuid', notes: '' },
  { endpoint: 'GET /json/stations/bytag/:tag', notes: '' },
  { endpoint: 'GET /json/countries', notes: '' },
  { endpoint: 'GET /json/tags', notes: '' },
  { endpoint: 'GET /json/url/:uuid', notes: '' },
  { endpoint: 'GET /json/stations/bylanguage/:lang', notes: '' },
  { endpoint: 'GET /json/stations/bystate/:state', notes: '' },
  { endpoint: 'GET /json/stations/bycodec/:codec', notes: '' },
  { endpoint: 'GET /json/stations/changed', notes: 'Recently changed stations' },
  { endpoint: 'GET /json/stations/lastchange', notes: '' },
  { endpoint: 'GET /json/stations/lastclick', notes: 'Recently clicked stations' },
  { endpoint: 'GET /json/stations/topvote', notes: '' },
  { endpoint: 'GET /json/languages', notes: '' },
  { endpoint: 'GET /json/codecs', notes: '' },
  { endpoint: 'GET /json/states/:country', notes: '' },
  { endpoint: 'GET /json/checks/:uuid', notes: 'Stream check history' },
  { endpoint: 'POST /json/add', notes: 'Public station submission' },
  { endpoint: 'POST /json/vote/:uuid', notes: 'Station voting' },
  { endpoint: 'GET /json/servers', notes: 'Server list / DNS lookup' },
  { endpoint: 'GET /json/stats', notes: 'Global statistics' },
];

// ── Static: Endpoint annotations (notes for AstroTune endpoints) ───────────

const ENDPOINT_ANNOTATIONS: Record<string, string> = {
  'GET /json/stations/topclick': 'Same params (limit, offset, hidebroken)',
  'GET /json/stations/search': 'Same params, adds is_https filter, max limit 10,000',
  'GET /json/stations/bycountrycodeexact/:code': '',
  'GET /json/stations/byuuid/:uuid': '',
  'GET /json/stations/bytag/:tag': 'Exact tag match instead of substring',
  'GET /json/countries': 'Served from pre-aggregated table',
  'GET /json/tags': 'Curated and filtered tag list',
  'GET /json/url/:uuid': 'Click tracking is local only',
};

// ── Static: ETL steps ──────────────────────────────────────────────────────

const ETL_STEPS = [
  { name: 'Drop invalid', description: 'Removes stations with missing name or url_resolved' },
  { name: 'Deduplicate', description: 'Removes duplicate url_resolved, keeps highest clickcount' },
  { name: 'Tag normalization', description: 'Translates non-English tags to English, merges synonyms (e.g. hip-hop → hip hop, 80er → 80s), removes ~300+ blacklisted tags' },
  { name: 'Country code gap-fill', description: 'Infers countrycode from country name for ~40 common countries' },
  { name: 'Codec gap-fill', description: 'Infers codec from URL extension (.mp3, .aac, .ogg, etc.)' },
  { name: 'Auto-fill local', description: 'Copies state to local when it looks like a city (skips "Province", "Oblast", 2-letter abbreviations)' },
  { name: 'Aggregator detection', description: 'Checks url_resolved against 23 known aggregator domains, stores is_aggregator + aggregator_name' },
  { name: 'Tag curation', description: 'Rebuilds tags table with minimum station count threshold, strips non-approved tags from station rows' },
  { name: 'Country rebuild', description: 'Rebuilds countries table from station aggregates' },
];

// ── Static: Behavioral differences ─────────────────────────────────────────

const BEHAVIORAL_DIFFS = [
  { aspect: 'Data freshness', radioBrowser: 'Live, real-time database', astrotune: 'Periodic ETL snapshots into local SQLite' },
  { aspect: 'Tags', radioBrowser: 'Raw user-submitted, no curation', astrotune: 'Normalized, translated, deduplicated, curated' },
  { aspect: 'Click tracking', radioBrowser: 'Global, shared across all clients', astrotune: 'Local only, not synced back' },
  { aspect: 'Voting', radioBrowser: 'Supported', astrotune: 'Not supported (counts imported but read-only)' },
  { aspect: 'Station submission', radioBrowser: 'Public POST /json/add endpoint', astrotune: 'Admin-only via /api/admin/stations' },
  { aspect: 'Verification', radioBrowser: 'Community-based stream checks', astrotune: 'Automated name + country verification via homepage/IP' },
  { aspect: 'Enrichment', radioBrowser: 'None', astrotune: 'Dig system auto-fills missing fields from station homepage' },
  { aspect: 'Duplicate handling', radioBrowser: 'Allows duplicates', astrotune: 'Deduplicates by url_resolved at ETL time' },
];

// ── Route collector ────────────────────────────────────────────────────────

const collectedRoutes: string[] = [];

/** Call once during server setup to collect routes via onRoute hook */
export function installRouteCollector(app: FastifyInstance): void {
  app.addHook('onRoute', (routeOptions) => {
    const methods = Array.isArray(routeOptions.method) ? routeOptions.method : [routeOptions.method];
    for (const method of methods) {
      if (method === 'HEAD') continue;
      collectedRoutes.push(`${method} ${routeOptions.url}`);
    }
  });
}

// ── Introspection helpers ──────────────────────────────────────────────────

/** Fields to exclude from comparison (internal DB scaffolding) */
const INTERNAL_FIELDS = new Set(['id', 'created_at', 'updated_at']);

function getDbColumns(): string[] {
  const db = getDb();
  const rows = db.prepare('PRAGMA table_info(stations)').all() as { name: string }[];
  return rows.map(r => r.name).filter(f => !INTERNAL_FIELDS.has(f));
}

function annotate(field: string): FieldAnnotation {
  return FIELD_ANNOTATIONS[field] ?? {
    rbDesc: '(undocumented)',
    atDesc: '(undocumented)',
    modified: false,
    modifiedBy: '—',
  };
}

function toFieldInfo(field: string, inRb: boolean, inAt: boolean): FieldInfo {
  const ann = annotate(field);
  return {
    field,
    inRb,
    inAt,
    rbDesc: ann.rbDesc,
    atDesc: ann.atDesc,
    modified: ann.modified,
    modifiedBy: ann.modifiedBy,
  };
}

// ── Main export ────────────────────────────────────────────────────────────

export function getCompareData(_app: FastifyInstance): CompareData {
  const atColumns = new Set(getDbColumns());
  const rbFields = RADIO_BROWSER_FIELDS;

  // Classify fields
  const imported: FieldInfo[] = [];
  const dropped: FieldInfo[] = [];
  const astrotuneOnly: FieldInfo[] = [];

  // Fields in both RB and AT
  for (const f of rbFields) {
    if (atColumns.has(f)) {
      imported.push(toFieldInfo(f, true, true));
    } else {
      dropped.push(toFieldInfo(f, true, false));
    }
  }

  // Fields in AT but not in RB
  for (const f of atColumns) {
    if (!rbFields.has(f)) {
      astrotuneOnly.push(toFieldInfo(f, false, true));
    }
  }

  // Endpoints: use collected routes from onRoute hook
  const atRoutes = new Set(collectedRoutes);
  const rbEndpointSet = new Set(RADIO_BROWSER_ENDPOINTS.map(e => e.endpoint));

  const compatible: EndpointInfo[] = [];
  const radioBrowserOnly: EndpointInfo[] = [];
  const astrotuneOnlyEndpoints: EndpointInfo[] = [];

  // Compatible = in both RB known list AND registered in Fastify
  for (const rbEp of RADIO_BROWSER_ENDPOINTS) {
    if (atRoutes.has(rbEp.endpoint)) {
      compatible.push({
        endpoint: rbEp.endpoint,
        notes: ENDPOINT_ANNOTATIONS[rbEp.endpoint] ?? rbEp.notes,
      });
    } else {
      radioBrowserOnly.push(rbEp);
    }
  }

  // AstroTune-only = registered routes not in RB set, excluding /api/admin/compare itself
  for (const route of atRoutes) {
    if (!rbEndpointSet.has(route)) {
      astrotuneOnlyEndpoints.push({
        endpoint: route,
        notes: ENDPOINT_ANNOTATIONS[route] ?? '',
      });
    }
  }

  return {
    fields: {
      imported,
      dropped,
      astrotuneOnly,
      counts: {
        radioBrowser: rbFields.size,
        imported: imported.length,
        dropped: dropped.length,
        astrotuneOnly: astrotuneOnly.length,
      },
    },
    endpoints: {
      compatible,
      radioBrowserOnly,
      astrotuneOnly: astrotuneOnlyEndpoints,
    },
    etlSteps: ETL_STEPS,
    behavioral: BEHAVIORAL_DIFFS,
  };
}
