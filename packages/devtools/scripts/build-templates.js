import fs from 'fs';
import path from 'path';
import prettier from 'prettier';
import { transform } from 'sucrase';
import glob from 'tiny-glob/sync.js';
import { preprocess } from 'svelte/compiler';
import preprocessPlugin from 'svelte-preprocess';
import { copy, mkdirp, rimraf } from '../utils.js';
// import { createRequire } from 'module';

// const require = createRequire(import.meta.url);
// let backendDefaultConfig = require('@marcellejs/backend/config/default.json');
// const backendProdConfig = require('@marcellejs/backend/config/production.json');

function convert_typescript(typescript) {
  const transformed = transform(typescript, {
    transforms: ['typescript'],
  });

  return prettier.format(transformed.code, {
    parser: 'babel',
    useTabs: true,
    singleQuote: true,
    trailingComma: 'none',
    printWidth: 100,
  });
}

async function convert_svelte(source, filename) {
  const out_contents = (
    await preprocess(source, preprocessPlugin(), {
      filename,
    })
  ).code;
  return out_contents.replace('<script lang="ts">', '<script>\n');
}

async function generate_templates() {
  const templates = fs.readdirSync('templates').filter((x) => x !== '.DS_Store');

  // Component templates
  for (const template of templates) {
    for (const lang of ['ts', 'js']) {
      const dir = `dist/templates/${template}_${lang}`;
      mkdirp(dir);

      const cwd = path.resolve('templates', template);

      const files = glob('**/*', { cwd, filesOnly: true, dot: true }).filter(
        (x) => x !== '.DS_Store',
      );
      for (let name of files) {
        let contents = fs.readFileSync(path.join(cwd, name), 'utf8');
        if (lang === 'js') {
          if (name.endsWith('.ts')) {
            contents = convert_typescript(contents);
            name = name.replace('.ts', '.js');
          }
          if (name.endsWith('.svelte')) {
            contents = await convert_svelte(contents, name);
          }
        }
        fs.writeFileSync(path.join(dir, name), contents);
      }
    }
  }

  // Backend Configuration files
  const dir = `dist/templates/backend`;
  mkdirp(dir);
  copy('node_modules/@marcellejs/backend/config/default.json', path.join(dir, 'default.json'));
  copy(
    'node_modules/@marcellejs/backend/config/production.json',
    path.join(dir, 'production.json'),
  );
  //   backendDefaultConfig.mongodb = '"mongodb://localhost:27017/<%= h.changeCase.snake(name) %>"';
  //   backendDefaultConfig.database = '<%= database %>';
  //   backendDefaultConfig.authentication.enabled = '<%= auth %>';
  //   let contents = JSON.stringify(backendDefaultConfig, null, '  ');
  //   let header = `---\nto: backend/config/default.json\n---\n`;
  //   contents = `${header}${contents}`;
  //   fs.writeFileSync(path.join(dir, `default.json.ejs.t`), contents);
  //   contents = JSON.stringify(backendProdConfig, null, '  ');
  //   header = `---\nto: backend/config/production.json\n---\n`;
  //   contents = `${header}${contents}`;
  //   fs.writeFileSync(path.join(dir, `production.json.ejs.t`), contents);
  //   const backendVersion = JSON.parse(fs.readFileSync('package.json', 'utf8')).devDependencies[
  //     '@marcellejs/backend'
  //   ].replace('workspace:', '');
  //   contents = `---
  // inject: true
  // to: package.json
  // after: dependencies
  // ---
  // "@marcellejs/backend":"${backendVersion}",`;
  //   fs.writeFileSync(path.join(dir, `package.json.ejs.t`), contents);
}

async function main() {
  rimraf('dist');
  mkdirp('dist');

  await generate_templates();
}

main();
