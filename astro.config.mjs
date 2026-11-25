// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// GitHub Pages serves the site under /<repo>/. The deploy workflow sets
// SITE_URL and BASE_PATH; locally both fall back to the root.
export default defineConfig({
  site: process.env.SITE_URL ?? 'http://localhost:4321',
  base: process.env.BASE_PATH ?? '/',
  trailingSlash: 'ignore',
  integrations: [react()],
  build: { inlineStylesheets: 'auto' },
});
