import { runEtl } from './index.js';
import { closeDb } from '../db/connection.js';

console.log('Starting one-time ETL run...');
console.log('---');

try {
  await runEtl();
  console.log('---');
  console.log('ETL completed successfully.');
} catch (err) {
  console.error('ETL failed:', err);
  process.exitCode = 1;
} finally {
  closeDb();
}
