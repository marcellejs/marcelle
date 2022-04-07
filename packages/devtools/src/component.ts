/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import { bold, green } from 'kleur/colors';
import prompts from 'prompts';
import { paramCase, camelCase, pascalCase } from 'change-case';
import { dist, mkdirp } from './utils.js';

const onCancel = () => {
  process.exit();
};

export async function generateComponent(cwd: string): Promise<void> {
  const { name } = await prompts(
    [
      {
        type: 'text',
        name: 'name',
        message: 'What is the name of your component?',
      },
    ],
    { onCancel },
  );
  const dst = path.join(cwd, 'src', 'components');
  const typescript = fs.existsSync(path.join(dst, 'index.ts'));
  const lang = typescript ? 'ts' : 'js';

  const dstComp = path.join(dst, paramCase(name));
  if (fs.existsSync(dstComp)) {
    const { confirm } = await prompts(
      [
        {
          type: 'confirm',
          name: 'confirm',
          message: 'This will overwrite existing files. Do you want to continue?',
        },
      ],
      { onCancel },
    );
    if (!confirm) {
      return;
    }
  }
  mkdirp(dstComp);

  const dir = dist(`templates/component_${lang}`);
  console.log('dir', dir);
  const files = fs.readdirSync(dir).filter((x) => x !== '.DS_Store');
  for (const srcname of files) {
    let contents = fs.readFileSync(path.join(dir, srcname), 'utf-8');
    contents = contents.replaceAll('/todo', `/${paramCase(name)}`);
    contents = contents.replaceAll('Todo', pascalCase(name));
    contents = contents.replaceAll('todo', camelCase(name));
    const dstName = srcname.replace('todo', paramCase(name));
    fs.writeFileSync(path.join(dstComp, dstName), contents);
    console.log(`\tadded: ${green('src/components/' + dstName)}`);
  }
  let contents = fs.readFileSync(path.join(dst, `index.${lang}`), 'utf-8').trim();
  const exportLine = `export * from './${paramCase(name)}';`;
  contents = `${contents}${contents ? '\n' : ''}${exportLine}\n`;
  fs.writeFileSync(path.join(dst, `index.${lang}`), contents);
  console.log(`\tmodified: ${green('src/components/index.' + lang)}`);

  console.log('To use your component:');
  console.log(bold(green(`\timport { ${camelCase(name)} } from './components';`)));
}
