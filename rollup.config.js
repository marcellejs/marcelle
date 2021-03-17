import commonjs from '@rollup/plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import preprocess from 'svelte-preprocess';
import postcss from 'rollup-plugin-postcss';
import progress from 'rollup-plugin-progress';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import sizes from 'rollup-plugin-sizes';
import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';
import path from 'path';
import pkg from './package.json';

const production = !process.env.ROLLUP_WATCH;
const analyze = true;

const plugins = [
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
  }),
  postcss({
    extract: true,
    extract: path.resolve('dist/marcelle.css'),
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

const esBuild = {
  input: 'src/index.ts',
  plugins: plugins.concat([production && filesize(), analyze && sizes({ details: false })]),
  external: Object.keys(pkg.dependencies),
  output: [
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
    },
  ],
};

const browserBuild = {
  input: 'src/index.ts',
  plugins: plugins.concat([
    production && terser(),
    production && filesize(),
    analyze && sizes({ details: false }),
  ]),
  output: [
    {
      file: pkg.main,
      format: 'es',
      sourcemap: true,
    },
    production && {
      file: pkg.browser,
      format: 'umd',
      name: 'marcelle',
      sourcemap: true,
    },
  ],
  onwarn(warning, warn) {
    // suppress eval warnings
    if (warning.code === 'EVAL') return;
    warn(warning);
  },
};

export default production ? [esBuild, browserBuild] : esBuild;
