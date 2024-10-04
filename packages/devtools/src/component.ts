/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import { bold, green } from 'kleur/colors';
import prompts from 'prompts';
import { kebabCase, camelCase, pascalCase } from 'change-case';
import { dist, mkdirp } from './utils.js';

const onCancel = () => {
  process.exit();
};

export async function generateComponent(cwd: string): Promise<void> {
  let dst = path.join(cwd, 'src', 'components');
  const isViteAppJs = fs.existsSync(path.join(dst, 'index.js'));
  const isViteAppTs = fs.existsSync(path.join(dst, 'index.ts'));
  let typescript = isViteAppTs;
  let foundCompDir = isViteAppJs || isViteAppTs;
  if (!foundCompDir) {
    dst = path.join(cwd, 'src', 'lib', 'marcelle', 'components');
    const isKitAppJs = fs.existsSync(path.join(dst, 'index.js'));
    const isKitAppTs = fs.existsSync(path.join(dst, 'index.ts'));
    typescript = isKitAppTs;
    foundCompDir = isKitAppJs || isKitAppTs;
  }

  while (!foundCompDir) {
    ({ dst } = await prompts(
      [
        {
          type: 'text',
          name: 'dst',
          message: 'We could not find a component folder. Where is it located?',
          initial: path.join(cwd, 'src', 'components'),
        },
      ],
      { onCancel },
    ));
    const isCustomAppJs = fs.existsSync(path.join(dst, 'index.js'));
    const isCustomAppTs = fs.existsSync(path.join(dst, 'index.ts'));
    typescript = isCustomAppTs;
    foundCompDir = isCustomAppJs || isCustomAppTs;
  }

  const { name, type } = await prompts(
    [
      {
        type: 'text',
        name: 'name',
        message: 'What is the name of your component?',
      },
      {
        type: 'select',
        name: 'type',
        message: 'What type of component to you want?',
        choices: [
          { title: 'Skeleton component with a Svelte UI [default]', value: 'default' },
          { title: 'Simple Classifier (Tensorflow.js)', value: 'tfjs_classifier' },
          { title: 'Custom Model (Tensorflow.js)', value: 'tfjs_model' },
        ],
        initial: 0,
      },
    ],
    { onCancel },
  );

  const lang = typescript ? 'ts' : 'js';

  const dstComp = path.join(dst, kebabCase(name));
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

  const dir = dist(`templates/component_${type}_${lang}`);
  console.log('dir', dir);
  const files = fs.readdirSync(dir).filter((x) => x !== '.DS_Store');
  for (const srcname of files) {
    let contents = fs.readFileSync(path.join(dir, srcname), 'utf-8');
    contents = contents.replaceAll('/todo', `/${kebabCase(name)}`);
    contents = contents.replaceAll('Todo', pascalCase(name));
    contents = contents.replaceAll('todo', camelCase(name));
    const dstName = srcname.replace('todo', kebabCase(name));
    fs.writeFileSync(path.join(dstComp, dstName), contents);
    console.log(`\tadded: ${green('src/components/' + dstName)}`);
  }
  let contents = fs.readFileSync(path.join(dst, `index.${lang}`), 'utf-8').trim();
  const exportLine = `export * from './${kebabCase(name)}';`;
  contents = `${contents}${contents ? '\n' : ''}${exportLine}\n`;
  fs.writeFileSync(path.join(dst, `index.${lang}`), contents);
  console.log(`\tmodified: ${green('src/components/index.' + lang)}`);

  console.log('To use your component:');
  console.log(bold(green(`\timport { ${camelCase(name)} } from './components';`)));
}
