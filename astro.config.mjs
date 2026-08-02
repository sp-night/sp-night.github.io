// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Organisation GitHub Pages site: served from the domain root, so no `base`.
export default defineConfig({
  site: 'https://sp-night.github.io',
  integrations: [mdx(), sitemap()],
});
