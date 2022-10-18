/* eslint-env node */
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineConfig({
  plugins: [svelte({ emitCss: false })],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        // other: resolve(__dirname, 'other-page/index.html'),
      },
    },
  },
  optimizeDeps: {
    exclude: ['@marcellejs/backend'],
  },
});
