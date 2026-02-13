import type { FastifyInstance } from 'fastify';
import * as countryService from '../services/countryService.js';

export async function countryRoutes(app: FastifyInstance) {
  app.get('/json/countries', async (req) => {
    const q = req.query as Record<string, string>;
    return countryService.getCountries({
      order: q.order,
      reverse: q.reverse !== 'false',
      hidebroken: q.hidebroken !== 'false',
    });
  });
}
