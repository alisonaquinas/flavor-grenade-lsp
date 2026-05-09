import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.WEBSITE_BASE ?? '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  plugins: [svelte()],
});
