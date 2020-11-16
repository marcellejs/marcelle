import css from 'rollup-plugin-css-only';
import svelte from 'rollup-plugin-svelte';
import preprocess from 'svelte-preprocess';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import progress from 'rollup-plugin-progress';
import { terser } from 'rollup-plugin-terser';
import filesize from 'rollup-plugin-filesize';
import replace from '@rollup/plugin-replace';
import sizes from 'rollup-plugin-sizes';
import pkg from './package.json';

const production = !process.env.ROLLUP_WATCH;
const analyze = true;

const plugins = [
  replace({
    'process.env.NODE_ENV': process.env.ROLLUP_WATCH
      ? JSON.stringify('development')
      : JSON.stringify('production'),
  }),
  css({ output: 'extra.css' }),
  svelte({
    dev: !production,
    css: (c) => {
      c.write('bundle.css');
    },
    preprocess: preprocess({
      postcss: true,
    }),
  }),
  resolve({
    browser: true,
    preferBuiltins: false,
    dedupe: ['svelte'],
  }),
  commonjs(),
  typescript(),
  progress(),
  production && terser(),
  production && filesize(),
  analyze && sizes({ details: false }),
];

const globals = {
  '@tensorflow/tfjs-core': 'tf',
  '@tensorflow/tfjs-converter': 'tf',
  '@tensorflow/tfjs-layers': 'tf',
  '@tensorflow/tfjs-backend-webgl': 'tf',
  '@tensorflow/tfjs-backend-cpu': 'tf',
  '@most/prelude': 'mostPrelude',
  '@most/core': 'mostCore',
  '@most/scheduler': 'mostScheduler',
  'chart.js': 'Chart',
};

const esOutput = {
  file: pkg.module,
  format: 'es',
  sourcemap: true,
};

const umdOutput = {
  file: pkg.main,
  format: 'umd',
  name: 'marcelle',
  sourcemap: true,
  globals,
};

export default {
  input: 'src/index.ts',
  plugins,
  external: Object.keys(globals),
  output: [esOutput, umdOutput],
};
