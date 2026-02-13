import cron from 'node-cron';
import { config } from '../config.js';
import { runEtl, isEtlRunning } from './index.js';

let task: cron.ScheduledTask | null = null;

export function startScheduler(): void {
  if (task) return;

  console.log(`ETL scheduler started: "${config.etl.cronSchedule}"`);

  task = cron.schedule(config.etl.cronSchedule, async () => {
    if (isEtlRunning()) {
      console.log('ETL skipped: already running');
      return;
    }
    try {
      await runEtl();
    } catch (err) {
      console.error('Scheduled ETL failed:', err);
    }
  });
}

export function stopScheduler(): void {
  if (task) {
    task.stop();
    task = null;
  }
}
