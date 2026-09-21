// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { parse } from 'yaml';

/* Every port used to have a page of its own at /ports/<slug>. They are tabs on
   their group's page now, and the old addresses are in READMEs, issues and
   search results — so each one still answers, pointing at its tab.

   Read straight from the vendored catalogue: the config does not go through
   Vite, so src/data/ports.ts and its `?raw` import are out of reach. The
   scripts/gen-assets.mjs parse does the same for the same reason. */
const catalogue = parse(readFileSync(new URL('./src/data/ports.yml', import.meta.url), 'utf8'));
const redirects = Object.fromEntries(
  catalogue.ports.map((/** @type {{ slug: string; group: string }} */ p) => [
    `/ports/${p.slug}`,
    `/ports/${p.group}#${p.slug}`,
  ]),
);

// Organisation GitHub Pages site: served from the domain root, so no `base`.
export default defineConfig({
  site: 'https://sp-night.github.io',
  integrations: [mdx(), sitemap()],
  redirects,
});
