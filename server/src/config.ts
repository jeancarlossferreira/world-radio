import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  port: Number(process.env.PORT) || 3001,
  host: process.env.HOST || '0.0.0.0',
  dbPath: process.env.DB_PATH || path.join(__dirname, '..', 'data', 'astrotune.db'),
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  etl: {
    cronSchedule: process.env.ETL_CRON || '0 3 * * *', // Daily at 3 AM
    radioBrowserBase: process.env.RADIO_BROWSER_URL || 'https://de1.api.radio-browser.info',
    pageSize: 5000,
    maxRetries: 3,
    delayBetweenPages: 500,
    minTagStationCount: 20, // Only keep tags with at least this many stations
  },
  dig: {
    batchSize: 100,
    concurrency: 3,
    fetchTimeout: 10000,
    searchDelay: 1500,
    nominatimDelay: 1100,
  },
  verification: {
    batchSize: 500,
    concurrency: 5,
    fetchTimeout: 10000,
    ipApiBatchSize: 100,
    ipApiBatchDelay: 1500,
    nameMatchThreshold: 0.5,
    noiseWords: new Set([
      'radio', 'fm', 'am', 'online', 'the', 'de', 'la', 'el', 'le', 'les',
      'das', 'der', 'die', 'los', 'las', 'une', 'una', 'web', 'live', 'station',
    ]),
  },
};
