import { getDb } from '../db/connection.js';

export function getCountries(params: {
  order?: string;
  reverse?: boolean;
  hidebroken?: boolean;
}) {
  const db = getDb();
  const allowedOrders = ['name', 'stationcount'];
  const orderCol = allowedOrders.includes(params.order || '') ? params.order : 'stationcount';
  const direction = params.reverse !== false ? 'DESC' : 'ASC';

  return db.prepare(`
    SELECT iso_3166_1, name, stationcount FROM countries
    ORDER BY ${orderCol} ${direction}
  `).all();
}
