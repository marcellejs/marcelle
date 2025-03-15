/* eslint-env node */
import commonjs from '@rollup/plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import postcss from 'rollup-plugin-postcss';
import progress from 'rollup-plugin-progress';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import svelte from 'rollup-plugin-svelte';
import typescript from '@rollup/plugin-typescript';
import path from 'path';
import pkg from './package.json' with { type: 'json' };

const production = !process.env.ROLLUP_WATCH;

const plugins = [
  replace({
    'process.env.NODE_ENV': process.env.ROLLUP_WATCH
      ? JSON.stringify('development')
      : JSON.stringify('production'),
    preventAssignment: true,
  }),
  svelte({
    emitCss: true,
  }),
  postcss({
    extract: path.resolve('dist/marcelle-layouts.css'),
    sourceMap: true,
    minimize: false, // production (bug with tailwind: march 2025)
  }),
  resolve({
    browser: true,
    preferBuiltins: false,
    dedupe: ['svelte'],
  }),
  commonjs(),
  typescript(),
  progress(),
];

const esBuild = {
  input: 'src/index.ts',
  plugins: plugins.concat([production && filesize()]),
  external: Object.keys(pkg.dependencies),
  output: [
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
      inlineDynamicImports: true,
    },
  ],
};

export default esBuild;
