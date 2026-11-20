import svelte from 'rollup-plugin-svelte';
import { sveltePreprocess } from 'svelte-preprocess';
import { defineConfig } from 'tsdown';
import { svelteDtsPlugin } from '../../scripts/tsdown-plugin-svelte-dts.ts';

export default defineConfig({
  dts: true,
  platform: 'browser',
  exports: true,
  css: {
    transformer: 'postcss',
    fileName: 'marcelle-layouts.css',
  },
  plugins: [
    svelte({ preprocess: sveltePreprocess() }),
    // For Types, see later from the template:
    svelteDtsPlugin({
      declarationDir: './dist',
      libRoot: './src',
      tsconfig: 'tsconfig.json',
    }),
  ],
});
