import type { FastifyInstance } from 'fastify';
import * as tagService from '../services/tagService.js';

export async function tagRoutes(app: FastifyInstance) {
  app.get('/json/tags', async (req) => {
    const q = req.query as Record<string, string>;
    return tagService.getTags({
      order: q.order,
      reverse: q.reverse !== 'false',
      limit: Number(q.limit) || 100,
      hidebroken: q.hidebroken !== 'false',
    });
  });
}
