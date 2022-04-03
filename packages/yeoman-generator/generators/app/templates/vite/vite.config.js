/* eslint-env node */
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default {
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
};
