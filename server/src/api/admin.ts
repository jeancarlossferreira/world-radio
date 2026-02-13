import type { FastifyInstance } from 'fastify';
import * as adminService from '../services/adminService.js';
import { runEtl, isEtlRunning, getSkipLogPath } from '../etl/index.js';
import fs from 'fs';
import { runVerification, isVerificationRunning, isVerificationPaused, pauseVerification, resumeVerification, cancelVerification, resetVerification } from '../services/verificationService.js';
import * as digService from '../services/digService.js';
import * as compareService from '../services/compareService.js';

export async function adminRoutes(app: FastifyInstance) {
  // GET /api/admin/stats
  app.get('/api/admin/stats', async () => {
    return adminService.getStats();
  });

  // GET /api/admin/stations
  app.get('/api/admin/stations', async (req) => {
    const q = req.query as Record<string, string>;
    return adminService.getStationsPaginated({
      page: Number(q.page) || 1,
      limit: Number(q.limit) || 50,
      search: q.search,
      is_broken: q.is_broken !== undefined ? q.is_broken === 'true' : undefined,
      manually_added: q.manually_added !== undefined ? q.manually_added === 'true' : undefined,
      incomplete: q.incomplete !== undefined ? q.incomplete === 'true' : undefined,
      missing_fields: q.missing_fields ? q.missing_fields.split(',') : undefined,
    });
  });

  // GET /api/admin/stations/:uuid
  app.get('/api/admin/stations/:uuid', async (req, reply) => {
    const { uuid } = req.params as { uuid: string };
    const station = adminService.getStationByUuid(uuid);
    if (!station) return reply.status(404).send({ error: 'Station not found' });
    return station;
  });

  // POST /api/admin/stations
  app.post('/api/admin/stations', async (req, reply) => {
    const body = req.body as {
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
    };

    if (!body.name || !body.url_resolved) {
      return reply.status(400).send({ error: 'name and url_resolved are required' });
    }

    const result = adminService.createStation(body);
    return reply.status(201).send(result);
  });

  // PUT /api/admin/stations/:uuid
  app.put('/api/admin/stations/:uuid', async (req) => {
    const { uuid } = req.params as { uuid: string };
    const body = req.body as Record<string, unknown>;
    return adminService.updateStation(uuid, body);
  });

  // DELETE /api/admin/stations/:uuid
  app.delete('/api/admin/stations/:uuid', async (req) => {
    const { uuid } = req.params as { uuid: string };
    return adminService.deleteStation(uuid);
  });

  // GET /api/admin/tags
  app.get('/api/admin/tags', async () => {
    return adminService.getAllTags();
  });

  // PUT /api/admin/tags/:name
  app.put('/api/admin/tags/:name', async (req) => {
    const { name } = req.params as { name: string };
    const { newName } = req.body as { newName: string };
    return adminService.updateTag(decodeURIComponent(name), newName);
  });

  // DELETE /api/admin/tags/:name
  app.delete('/api/admin/tags/:name', async (req) => {
    const { name } = req.params as { name: string };
    return adminService.deleteTag(decodeURIComponent(name));
  });

  // POST /api/admin/etl/run
  app.post('/api/admin/etl/run', async (_req, reply) => {
    if (isEtlRunning()) {
      return reply.status(409).send({ error: 'ETL is already running' });
    }
    // Run in background, don't await
    runEtl().catch(err => console.error('ETL triggered via admin failed:', err));
    return { message: 'ETL started' };
  });

  // GET /api/admin/etl/logs
  app.get('/api/admin/etl/logs', async (req) => {
    const q = req.query as Record<string, string>;
    return adminService.getEtlLogs(Number(q.limit) || 20);
  });

  // GET /api/admin/etl/skip-log/:id
  app.get('/api/admin/etl/skip-log/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const filePath = getSkipLogPath(id);
    if (!filePath) {
      return reply.status(404).send({ error: 'Skip log not found' });
    }
    const html = fs.readFileSync(filePath, 'utf-8');
    return reply.type('text/html').send(html);
  });

  // POST /api/admin/verification/run
  app.post('/api/admin/verification/run', async (_req, reply) => {
    if (isVerificationRunning()) {
      return reply.status(409).send({ error: 'Verification is already running' });
    }
    runVerification().catch(err => console.error('Verification failed:', err));
    return { message: 'Verification started' };
  });

  // GET /api/admin/verification/status
  app.get('/api/admin/verification/status', async () => {
    return {
      running: isVerificationRunning(),
      paused: isVerificationPaused(),
      stats: adminService.getVerificationStats(),
    };
  });

  // POST /api/admin/verification/pause
  app.post('/api/admin/verification/pause', async () => {
    pauseVerification();
    return { message: 'Verification paused' };
  });

  // POST /api/admin/verification/resume
  app.post('/api/admin/verification/resume', async () => {
    resumeVerification();
    return { message: 'Verification resumed' };
  });

  // POST /api/admin/verification/cancel
  app.post('/api/admin/verification/cancel', async () => {
    cancelVerification();
    return { message: 'Verification cancelled' };
  });

  // POST /api/admin/verification/reset
  app.post('/api/admin/verification/reset', async () => {
    resetVerification();
    return { message: 'Verification data cleared' };
  });

  // --- Dig endpoints ---

  // GET /api/admin/dig/status
  app.get('/api/admin/dig/status', async () => {
    return {
      job: digService.getDigState(),
      stats: adminService.getDigStats(),
    };
  });

  // POST /api/admin/dig/autocomplete
  app.post('/api/admin/dig/autocomplete', async (_req, reply) => {
    if (digService.isDigBusy()) {
      return reply.status(409).send({ error: 'Dig job is already running' });
    }
    digService.runAutocomplete().catch(err => console.error('Dig autocomplete failed:', err));
    return { message: 'Autocomplete started' };
  });

  // POST /api/admin/dig/recheck
  app.post('/api/admin/dig/recheck', async (_req, reply) => {
    if (digService.isDigBusy()) {
      return reply.status(409).send({ error: 'Dig job is already running' });
    }
    digService.runRecheck().catch(err => console.error('Dig recheck failed:', err));
    return { message: 'Recheck started' };
  });

  // POST /api/admin/dig/pause
  app.post('/api/admin/dig/pause', async (_req, reply) => {
    if (!digService.pauseDig()) {
      return reply.status(409).send({ error: 'No running job to pause' });
    }
    return { message: 'Dig paused' };
  });

  // POST /api/admin/dig/resume
  app.post('/api/admin/dig/resume', async (_req, reply) => {
    if (!digService.resumeDig()) {
      return reply.status(409).send({ error: 'No paused job to resume' });
    }
    return { message: 'Dig resumed' };
  });

  // POST /api/admin/dig/cancel
  app.post('/api/admin/dig/cancel', async (_req, reply) => {
    if (!digService.cancelDig()) {
      return reply.status(409).send({ error: 'No running/paused job to cancel' });
    }
    return { message: 'Dig cancelled' };
  });

  // GET /api/admin/compare
  app.get('/api/admin/compare', async () => {
    return compareService.getCompareData(app);
  });
}
