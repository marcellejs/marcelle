/* eslint-env node */
import commonjs from '@rollup/plugin-commonjs';
import externalGlobals from 'rollup-plugin-external-globals';
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
import pkg from './package.json' assert { type: 'json' };

const production = !process.env.ROLLUP_WATCH;
const analyze = false;

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
      typescript: true,
      postcss: true,
    }),
  }),
  postcss({
    extract: path.resolve('dist/marcelle.css'),
    sourceMap: true,
    minimize: production,
  }),
  resolve({
    browser: true,
    preferBuiltins: false,
    dedupe: ['svelte'],
  }),
  externalGlobals({ 'onnxruntime-web': 'ort' }),
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
      inlineDynamicImports: true,
    },
  ],
};

export default esBuild;
