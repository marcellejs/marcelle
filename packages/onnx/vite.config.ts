/* eslint-env node */
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import externalGlobals from 'rollup-plugin-external-globals';
import { resolve } from 'path';

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
    outDir: resolve(__dirname, 'dist'),
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'marcelle-onnx',
      fileName: 'marcelle-onnx',
    },
    rollupOptions: {
      external: ['@marcellejs/core'],
    },
  },
});
