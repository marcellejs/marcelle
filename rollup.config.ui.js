/* eslint-env node */
import commonjs from '@rollup/plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import preprocess from 'svelte-preprocess';
import postcss from 'rollup-plugin-postcss';
import progress from 'rollup-plugin-progress';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import sizes from 'rollup-plugin-sizes';
import svelte from 'rollup-plugin-svelte';
import typescript from '@rollup/plugin-typescript';
import path from 'path';

const production = !process.env.ROLLUP_WATCH;
const analyze = false;

const uiBuild = {
  input: 'src/ui/index.ts',
  plugins: [
    replace({
      'process.env.NODE_ENV': process.env.ROLLUP_WATCH
        ? JSON.stringify('development')
        : JSON.stringify('production'),
      preventAssignment: true,
    }),
    svelte({
      emitCss: true,
      preprocess: preprocess({
        postcss: true,
      }),
      compilerOptions: {
        hydratable: true,
      },
    }),
    postcss({
      extract: path.resolve('dist/ui.css'),
      sourceMap: true,
      minimize: production,
    }),
    resolve({
      browser: true,
      preferBuiltins: false,
      dedupe: ['svelte'],
    }),
    commonjs(),
    typescript(),
    progress(),
    production && filesize(),
    analyze && sizes({ details: false }),
  ],
  output: {
    file: 'dist/ui.js',
    format: 'es',
    sourcemap: true,
  },
};

export default uiBuild;
