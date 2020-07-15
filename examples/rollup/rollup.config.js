import css from 'rollup-plugin-css-only';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
// import { plugin as analyze } from 'rollup-plugin-analyzer';
import { terser } from 'rollup-plugin-terser';
import filesize from 'rollup-plugin-filesize';
import livereload from 'rollup-plugin-livereload';
import svelte from 'rollup-plugin-svelte';
import preprocess from 'svelte-preprocess';
import pkg from './package.json';

const production = !process.env.ROLLUP_WATCH;

function serve() {
  let started = false;

  return {
    writeBundle() {
      if (!started) {
        started = true;

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require('child_process') // eslint-disable-line global-require
          .spawn('npm', ['run', 'start', '--', '--dev'], {
            stdio: ['ignore', 'inherit', 'inherit'],
            shell: true,
          });
      }
    },
  };
}

const plugins = [
  css({ output: 'public/extra.css' }),
  svelte({
    dev: !production,
    css: (c) => {
      c.write('public/bundle.css');
    },
    preprocess: preprocess({
      postcss: true,
    }),
  }),
  typescript(),
  resolve({
    browser: true,
    dedupe: ['svelte'],
  }),
  commonjs(),
  copy({
    targets: [
      { src: 'src/index.html', dest: 'public' },
      {
        src: 'node_modules/@marcellejs/core/dist/bundle.css',
        dest: 'public',
        rename: 'marcelle.css',
      },
    ],
  }),
  // In dev mode, call `npm run start` once
  // the bundle has been generated
  !production && serve(),

  // Watch the `public` directory and refresh the
  // browser on changes when not in production
  !production && livereload('public'),

  // If we're building for production (npm run build
  // instead of npm run dev), minify
  production && terser(),
  production && filesize(),
  // production && analyze(),
];

const umdOutput = {
  file: pkg.main,
  format: 'umd',
  name: 'marcelle-app',
  sourcemap: true,
  globals: {
    '@tensorflow/tfjs-core': 'tf',
    '@tensorflow/tfjs-converter': 'tf',
  },
};

export default {
  input: 'src/index.ts',
  plugins,
  external: ['@tensorflow/tfjs-core', '@tensorflow/tfjs-converter'],
  output: umdOutput,
};
