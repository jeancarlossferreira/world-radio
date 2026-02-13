import type { FastifyInstance } from 'fastify';
import { stationRoutes } from './stations.js';
import { countryRoutes } from './countries.js';
import { tagRoutes } from './tags.js';
import { adminRoutes } from './admin.js';

export async function registerRoutes(app: FastifyInstance) {
  await app.register(stationRoutes);
  await app.register(countryRoutes);
  await app.register(tagRoutes);
  await app.register(adminRoutes);
}
