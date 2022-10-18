/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */
import fs from 'fs';
import { preprocess } from 'svelte/compiler';
import preprocessPlugin from 'svelte-preprocess';

const config = {
  preprocess: preprocessPlugin({
    postcss: true,
  }),
};
// import * as path from 'path';
// import { createRequire } from 'module';
// import colors from 'kleur';

/**
 * Strip out lang="X" or type="text/X" tags. Doing it here is only a temporary solution.
 * See https://github.com/sveltejs/kit/issues/2450 for ideas for places where it's handled better.
 *
 * @param {string} content
 */
function strip_lang_tags(content) {
  /**
   * @param {string} tagname
   */
  function strip_lang_tag(tagname) {
    const regexp = new RegExp(
      `/<!--[^]*?-->|<${tagname}(\\s[^]*?)?(?:>([^]*?)<\\/${tagname}>|\\/>)`,
      'g',
    );
    // eslint-disable-next-line no-param-reassign
    content = content.replace(regexp, (tag, attributes) => {
      if (!attributes) return tag;
      const idx = tag.indexOf(attributes);
      return (
        tag.substring(0, idx) +
        attributes.replace(/\s(type|lang)=(["']).*?\2/, ' ') +
        tag.substring(idx + attributes.length)
      );
    });
  }
  strip_lang_tag('script');
  strip_lang_tag('style');
  return content;
}

function mkdirp(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (/** @type {any} */ e) {
    if (e.code === 'EEXIST') return;
    throw e;
  }
}

async function main() {
  const components = ['src/core/ViewContainer.svelte'];

  for (const filename of components) {
    const source = fs.readFileSync(filename, 'utf8');
    const fname = filename.split('/')[filename.split('/').length - 1];
    const out_contents = strip_lang_tags(
      (await preprocess(source, config.preprocess, { filename: fname })).code,
    );
    mkdirp('dist/svelte');
    fs.writeFileSync(`dist/svelte/${fname}`, out_contents);
  }
  const indexFile = components
    .map((filename) => filename.split('/')[filename.split('/').length - 1])
    .map(
      (filename) => `export { default as  ${filename.split('.svelte')[0]} } from './${filename}'`,
    )
    .join('\n');
  fs.writeFileSync(`dist/svelte/index.js`, indexFile);
}

main();
