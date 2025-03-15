/* eslint-env node */
import commonjs from '@rollup/plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import postcss from 'rollup-plugin-postcss';
import progress from 'rollup-plugin-progress';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import svelte from 'rollup-plugin-svelte';
import terser from '@rollup/plugin-terser';
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
    extract: path.resolve('dist/marcelle-tensorflow.css'),
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
];

const browserBuild = {
  input: 'src/index.ts',
  plugins: plugins.concat([production && terser(), production && filesize()]),
  output: [
    {
      file: pkg.main,
      format: 'es',
      sourcemap: true,
      inlineDynamicImports: true,
    },
    production && {
      file: pkg.browser,
      format: 'umd',
      name: 'marcelle',
      sourcemap: true,
      inlineDynamicImports: true,
    },
  ],
  onwarn(warning, warn) {
    // suppress eval warnings
    if (warning.code === 'EVAL') return;
    warn(warning);
  },
};

export default browserBuild;
