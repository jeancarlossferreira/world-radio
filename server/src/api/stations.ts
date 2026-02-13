import type { FastifyInstance } from 'fastify';
import * as stationService from '../services/stationService.js';

export async function stationRoutes(app: FastifyInstance) {
  // GET /json/stations/topclick
  app.get('/json/stations/topclick', async (req) => {
    const q = req.query as Record<string, string>;
    return stationService.getTopStations(
      Number(q.limit) || 30,
      Number(q.offset) || 0,
      q.hidebroken !== 'false',
    );
  });

  // GET /json/stations/search
  app.get('/json/stations/search', async (req) => {
    const q = req.query as Record<string, string>;
    return stationService.searchStations({
      name: q.name,
      tag: q.tag,
      country: q.country,
      countrycode: q.countrycode,
      codec: q.codec,
      bitrateMin: q.bitrateMin ? Number(q.bitrateMin) : undefined,
      bitrateMax: q.bitrateMax ? Number(q.bitrateMax) : undefined,
      has_geo_info: q.has_geo_info === 'true',
      is_https: q.is_https === 'true',
      order: q.order,
      reverse: q.reverse !== 'false',
      offset: Number(q.offset) || 0,
      limit: Number(q.limit) || 30,
      hidebroken: q.hidebroken !== 'false',
    });
  });

  // GET /json/stations/bycountrycodeexact/:code
  app.get('/json/stations/bycountrycodeexact/:code', async (req) => {
    const { code } = req.params as { code: string };
    const q = req.query as Record<string, string>;
    return stationService.getStationsByCountryCode(
      code,
      Number(q.limit) || 30,
      Number(q.offset) || 0,
      q.hidebroken !== 'false',
    );
  });

  // GET /json/stations/byuuid/:uuid
  app.get('/json/stations/byuuid/:uuid', async (req) => {
    const { uuid } = req.params as { uuid: string };
    return stationService.getStationByUuid(uuid);
  });

  // GET /json/stations/bytag/:tag
  app.get('/json/stations/bytag/:tag', async (req) => {
    const { tag } = req.params as { tag: string };
    const q = req.query as Record<string, string>;
    return stationService.getStationsByTag(
      tag,
      Number(q.limit) || 30,
      Number(q.offset) || 0,
      q.hidebroken !== 'false',
    );
  });

  // GET /json/url/:uuid — track click
  app.get('/json/url/:uuid', async (req) => {
    const { uuid } = req.params as { uuid: string };
    return stationService.trackClick(uuid);
  });
}
