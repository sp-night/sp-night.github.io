/**
 * The role layer, published as data at /roles.json.
 *
 * Roles name palette keys — `syntax.keyword` → `marginal` — and never contain a
 * colour. A port maps its own config keys onto these names, which is what keeps
 * every port agreeing with every other one.
 *
 * Served from src/data/roles.json, the same file the site renders from.
 */
import type { APIRoute } from 'astro';
import roles from '../data/roles.json';

export const GET: APIRoute = () =>
  new Response(`${JSON.stringify(roles, null, 2)}\n`, {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
