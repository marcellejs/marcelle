/* eslint-env node */
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';
import demos from './demos/demo-list';

export default defineConfig({
  root: 'demos',
  plugins: [
    externalGlobals({ 'onnxruntime-web': 'ort' }),
    svelte({ configFile: '../svelte.config.js' }),
  ],
  resolve: {
    alias: {
      '@marcellejs/onnx': resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'demos/index.html'),
        ...demos
          .map((x) => x.path)
          .reduce((a, x) => ({ ...a, [x]: resolve(__dirname, `demos/${x}/index.html`) }), {}),
      },
    },
  },
});
