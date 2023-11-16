/* eslint-env node */
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';
import meta from './meta.js';

const subpackages_path = ['mobilenet-tetris', 'umap', 'webcam2'];

function injectHtml({ tags = [] } = {}) {
  return {
    name: 'vite:injectHtml',
    transformIndexHtml: {
      enforce: 'pre',
      transform(html, { path }) {
        if (subpackages_path.includes(path.split('/')[1]) && html.includes('src="/src/')) {
          const p = path.split('/index.html')[0].split('/')[1];
          return {
            html: html.split('src="/src/').join(`src="/${p}/src/`),
            tags: [],
          };
        } else {
          return {
            html,
            tags,
          };
        }
      },
    },
  };
}

const toCamelCase = (str) => {
  const s =
    str &&
    str
      .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
      .map((x) => x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase())
      .join('');
  return s.slice(0, 1).toLowerCase() + s.slice(1);
};

const demos = process.env.NODE_ENV === 'production' ? meta.filter((x) => !x.draft) : meta;
console.log('process.env.NODE_ENV', process.env.NODE_ENV);
console.log('demos', demos);

export default defineConfig({
  plugins: [
    injectHtml({
      injectData: {
        demos,
      },
    }),
    svelte({ emitCss: false }),
  ],
  server: {
    force: true,
    port: 3000,
  },
  build: {
    rollupOptions: {
      input: demos.reduce(
        (o, x) => ({
          ...o,
          [toCamelCase(x.path)]: resolve(__dirname, x.path, 'index.html'),
        }),
        {
          main: resolve(__dirname, 'index.html'),
        },
      ),
    },
  },
});
