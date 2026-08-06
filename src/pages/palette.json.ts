/**
 * The palette, published as data at /palette.json.
 *
 * This is the contract the whole project rests on: the named colours of each
 * flavour, and nothing else. Anything that wants to produce an SP Night theme
 * reads this file — so the theme survives any tool that writes it.
 *
 * Served from src/data/palette.json, the same file the site itself renders
 * from, so the published data can never disagree with the pages.
 */
import type { APIRoute } from 'astro';
import palette from '../data/palette.json';

export const GET: APIRoute = () =>
  new Response(`${JSON.stringify(palette, null, 2)}\n`, {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
