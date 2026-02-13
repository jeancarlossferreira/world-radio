import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config.js';
import { getDb, closeDb } from './db/connection.js';
import { registerRoutes } from './api/index.js';
import { startScheduler, stopScheduler } from './etl/scheduler.js';
import { installRouteCollector } from './services/compareService.js';

const app = Fastify({ logger: true });

// Collect routes for compare page introspection
installRouteCollector(app);

// CORS
await app.register(cors, { origin: config.cors.origin });

// Initialize DB
getDb();

// Register routes
await registerRoutes(app);

// Start ETL scheduler
startScheduler();

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down...');
  stopScheduler();
  await app.close();
  closeDb();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start server
try {
  await app.listen({ port: config.port, host: config.host });
  console.log(`AstroTune server running on http://localhost:${config.port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
