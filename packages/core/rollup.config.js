import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
// import { plugin as analyze } from 'rollup-plugin-analyzer';
import { terser } from 'rollup-plugin-terser';
import filesize from 'rollup-plugin-filesize';
import vue from 'rollup-plugin-vue';
import pkg from './package.json';

let plugins = [resolve(), commonjs(), typescript(), vue()];
if (process.env.NODE_ENV === 'production') {
  plugins = plugins.concat([
    terser(),
    filesize(),
    //analyze(),
  ]);
}

const esOutput = {
  file: pkg.module,
  format: 'es',
  sourcemap: true,
};

const umdOutput = {
  file: pkg.main,
  format: 'umd',
  name: 'marcelle',
  // sourcemap: true,
  globals: {
    // '@tensorflow/tfjs-core': 'tf',
    // '@tensorflow/tfjs-converter': 'tf',
    // apexcharts: 'ApexCharts',
    // 'element-ui': 'ELEMENT',
    // meyda: 'Meyda',
    // 'pouchdb-browser': 'PouchDB',
    vue: 'Vue',
    // vuex: 'Vuex',
  },
};

export default {
  input: 'src/index.ts',
  plugins,
  external: [
    // '@tensorflow/tfjs-core',
    // '@tensorflow/tfjs-converter',
    // 'apexcharts',
    // 'element-ui',
    // 'meyda',
    // 'pouchdb-browser',
    'vue',
    // 'vuex',
  ],
  output: [esOutput, umdOutput],
};
