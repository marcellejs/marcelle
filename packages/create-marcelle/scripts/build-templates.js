import fs from 'fs';
import path from 'path';
import parser from 'gitignore-parser';
import * as prettier from 'prettier';
import { transform } from 'sucrase';
import glob from 'tiny-glob/sync.js';
import { mkdirp, rimraf } from '../utils.js';
import { replaceAsync } from './utils.js';

/** @param {string} typescript */
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

/** @param {Set<string>} shared */
async function generate_templates(shared) {
  // TODO: check if directory instead
  const templates = fs.readdirSync('templates').filter((x) => x !== '.DS_Store');

  for (const template of templates) {
    const dir = `dist/templates/${template}`;
    const assets = `${dir}/assets`;
    mkdirp(assets);

    const cwd = path.resolve('templates', template);

    const gitignore_file = path.join(cwd, '.gitignore');
    if (!fs.existsSync(gitignore_file)) throw new Error('Template must have a .gitignore file');
    const gitignore = parser.compile(fs.readFileSync(gitignore_file, 'utf-8'));

    const ignore_file = path.join(cwd, '.ignore');
    if (!fs.existsSync(ignore_file)) throw new Error('Template must have a .ignore file');
    const ignore = parser.compile(fs.readFileSync(ignore_file, 'utf-8'));

    const meta_file = path.join(cwd, '.meta.json');
    if (!fs.existsSync(meta_file)) throw new Error('Template must have a .meta.json file');

    /** @type {import('../types/internal.js').File[]} */
    const ts = [];

    for (const name of glob('**/*', { cwd, filesOnly: true, dot: true })) {
      // the package.template.json thing is a bit annoying — basically we want
      // to be able to develop and deploy the app from here, but have a different
      // package.json in newly created projects (based on package.template.json)
      if (name === 'package.template.json') {
        let contents = fs.readFileSync(path.join(cwd, name), 'utf8');
        // TODO package-specific versions
        const thisPkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        contents = contents.replace(
          '"@marcellejs/core": "workspace:*"',
          `"@marcellejs/core": "${
            thisPkg.devDependencies['@marcellejs/core'].split('workspace:')[1]
          }"`,
        );
        contents = contents.replace(
          '"@marcellejs/design-system": "workspace:*"',
          `"@marcellejs/design-system": "${
            thisPkg.devDependencies['@marcellejs/design-system'].split('workspace:')[1]
          }"`,
        );
        contents = contents.replace(
          '"@marcellejs/devtools": "workspace:*"',
          `"@marcellejs/devtools": "${
            thisPkg.devDependencies['@marcellejs/devtools'].split('workspace:')[1]
          }"`,
        );
        fs.writeFileSync(`${dir}/package.json`, contents);
        return;
      }

      // ignore files that are written conditionally
      if (shared.has(name)) return;

      // ignore contents of .gitignore or .ignore
      if (!gitignore.accepts(name) || !ignore.accepts(name) || name === '.ignore') return;

      if (/\.(js|ts|html|svelte|svelte\.md)$/.test(name)) {
        const contents = fs.readFileSync(path.join(cwd, name), 'utf8');
        ts.push({
          name,
          contents,
        });
      } else {
        const dest = path.join(assets, name.replace(/^\./, 'DOT-'));
        mkdirp(path.dirname(dest));
        fs.copyFileSync(path.join(cwd, name), dest);
      }
    }

    /** @type {import('../types/internal.js').File[]} */
    const js = [];

    for (const file of ts) {
      // The app.d.ts file makes TS/JS aware of some ambient modules, which are
      // also needed for JS projects if people turn on "checkJs" in their jsonfig
      if (file.name.endsWith('.d.ts')) {
        if (file.name.endsWith('app.d.ts')) js.push(file);
      } else if (file.name.endsWith('.html')) {
        js.push({
          name: file.name,
          contents: file.contents.replace('src="/src/index.ts"', 'src="/src/index.js"'),
        });
      } else if (file.name.endsWith('.ts')) {
        js.push({
          name: file.name.replace(/\.ts$/, '.js'),
          contents: await convert_typescript(file.contents),
        });
      } else if (file.name.endsWith('.svelte')) {
        // we jump through some hoops, rather than just using svelte.preprocess,
        // so that the output preserves the original formatting to the extent
        // possible (e.g. preserving double line breaks). Sucrase is the best
        // tool for the job because it just removes the types; Prettier then
        // tidies up the end result
        const contents = replaceAsync(
          file.contents,
          /<script([^>]+)>([\s\S]+?)<\/script>/g,
          async (m, attrs, typescript) => {
            // Sucrase assumes 'unused' imports (which _are_ used, but only
            // in the markup) are type imports, and strips them. This step
            // prevents it from drawing that conclusion
            const imports = [];
            const import_pattern = /import (.+?) from/g;
            let import_match;
            while ((import_match = import_pattern.exec(typescript))) {
              const word_pattern = /[a-z_$][a-z0-9_$]*/gi;
              let word_match;
              while ((word_match = word_pattern.exec(import_match[1]))) {
                imports.push(word_match[0]);
              }
            }

            const suffix = `\n${imports.join(',')}`;

            const transformed = transform(typescript + suffix, {
              transforms: ['typescript'],
            }).code.slice(0, -suffix.length);

            const result = await prettier
              .format(transformed, {
                parser: 'babel',
                useTabs: true,
                singleQuote: true,
                trailingComma: 'none',
                printWidth: 100,
              })
              .then((res) => res.trim().replace(/^(.)/gm, '\t$1'));

            return `<script${attrs.replace(' lang="ts"', '')}>\n${result}\n</script>`;
          },
        );

        js.push({
          name: file.name,
          contents,
        });
      } else {
        js.push(file);
      }
    }

    fs.copyFileSync(meta_file, `${dir}/meta.json`);
    fs.writeFileSync(`${dir}/files.ts.json`, JSON.stringify(ts, null, '\t'));
    fs.writeFileSync(`${dir}/files.js.json`, JSON.stringify(js, null, '\t'));
  }
}

async function generate_shared() {
  const cwd = path.resolve('shared');

  /** @type {Set<string>} */
  const shared = new Set();

  /** @type {Array<{ name: string, include: string[], exclude: string[], contents: string }>} */
  const files = [];

  for (const file of glob('**/*', { cwd, filesOnly: true, dot: true })) {
    if (file === '.DS_Store') return null;
    const contents = fs.readFileSync(path.join(cwd, file), 'utf8');

    /** @type {string[]} */
    const include = [];

    /** @type {string[]} */
    const exclude = [];

    let name = file;

    if (file.startsWith('+') || file.startsWith('-')) {
      const [conditions, ...rest] = file.split(path.sep);

      const pattern = /([+-])([a-z]+)/g;
      let match;
      while ((match = pattern.exec(conditions))) {
        const set = match[1] === '+' ? include : exclude;
        set.push(match[2]);
      }

      name = rest.join('/');
    }

    if (name.endsWith('.ts') && !include.includes('typescript')) {
      const js_name = name.replace(/\.ts$/, '.js');
      shared.add(js_name);

      files.push({
        name: js_name,
        include: [...include],
        exclude: [...exclude, 'typescript'],
        contents: await convert_typescript(contents),
      });

      include.push('typescript');
    }

    shared.add(name);

    files.push({ name, include, exclude, contents });
  }

  files.sort((a, b) => a.include.length + a.exclude.length - (b.include.length + b.exclude.length));

  fs.writeFileSync('dist/shared.json', JSON.stringify({ files }, null, '\t'));

  shared.delete('package.json');
  return shared;
}

async function main() {
  rimraf('dist');
  mkdirp('dist');

  const shared = await generate_shared();
  await generate_templates(shared);
}

main();
