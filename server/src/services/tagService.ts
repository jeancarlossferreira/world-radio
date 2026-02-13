import { getDb } from '../db/connection.js';

export function getTags(params: {
  order?: string;
  reverse?: boolean;
  limit?: number;
  hidebroken?: boolean;
}) {
  const db = getDb();
  const allowedOrders = ['name', 'stationcount'];
  const orderCol = allowedOrders.includes(params.order || '') ? params.order : 'stationcount';
  const direction = params.reverse !== false ? 'DESC' : 'ASC';
  const limit = Math.min(params.limit || 100, 10000);

  return db.prepare(`
    SELECT name, stationcount FROM tags
    ORDER BY ${orderCol} ${direction}
    LIMIT ?
  `).all(limit);
}
