#!/usr/bin/env node
/* eslint-env node */
/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import { bold, gray, cyan, green, red } from 'kleur/colors';
import prompts from 'prompts';
import { paramCase, camelCase, pascalCase, snakeCase } from 'change-case';
import { copy, dist, mkdirp } from './utils.js';
import degit from 'tiged';

const thisPkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));
const { version } = thisPkg;
const backendVersion = thisPkg.devDependencies['@marcellejs/backend'].replace('workspace:', '');

const onCancel = () => {
  process.exit();
};

async function generateComponent(cwd) {
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

async function configureBackend(cwd, pkg) {
  const { database, auth } = await prompts(
    [
      {
        type: 'select',
        name: 'database',
        message: 'What kind of database do you want to use?',
        choices: [
          { title: 'NeDB', value: 'nedb' },
          { title: 'MongoDB', value: 'mongodb' },
        ],
        initial: 0,
      },
      {
        type: 'toggle',
        name: 'auth',
        message: 'Do you want to use authentication?',
      },
    ],
    { onCancel },
  );

  let dbname = '';
  if (database === 'mongodb') {
    dbname = snakeCase(pkg.name);
    ({ dbname } = await prompts(
      [
        {
          type: 'text',
          name: 'dbname',
          message: 'What database name do you want to use with mongodb?',
          initial: dbname,
        },
      ],
      { onCancel },
    ));
  }

  const dst = path.join(cwd, 'backend');
  if (fs.existsSync(path.join(dst, 'config', 'default.json'))) {
    const { confirm } = await prompts(
      [
        {
          type: 'confirm',
          name: 'confirm',
          message: 'This will overwrite existing configuration files. Do you want to continue?',
        },
      ],
      { onCancel },
    );
    if (!confirm) {
      return;
    }
  }
  mkdirp(path.join(dst, 'config'));

  const dir = dist('templates/backend');
  const files = fs.readdirSync(dir).filter((x) => x.endsWith('.json'));
  for (const srcname of files) {
    if (srcname === 'default.json') {
      let config = JSON.parse(fs.readFileSync(path.join(dir, srcname), 'utf-8'));
      config.mongodb = `mongodb://localhost:27017/${dbname}`;
      config.database = database;
      config.authentication.enabled = auth;
      fs.writeFileSync(
        path.join(dst, 'config', 'default.json'),
        JSON.stringify(config, null, '  '),
      );
    } else {
      copy(path.join(dir, srcname), path.join(dst, 'config', srcname));
    }
    console.log(`\tadded: ${green('backend/config/' + srcname)}`);
  }

  let dependencies = {
    ...pkg.dependencies,
    '@marcellejs/backend': backendVersion,
  };
  dependencies = Object.keys(dependencies)
    .sort()
    .reduce((res, key) => ({ ...res, [key]: dependencies[key] }), {});
  const newPkg = pkg;
  newPkg.dependencies = dependencies;
  newPkg.scripts = { ...newPkg.scripts, backend: 'marcelle-backend' };
  fs.writeFileSync(path.join(cwd, 'package.json'), JSON.stringify(newPkg, null, '  '));
  console.log(`\tmodified: ${green('package.json')}`);

  console.log('\nNext steps:');
  let i = 1;
  console.log(`  ${i++}: ${bold(cyan('npm install'))} (or pnpm install, etc)`);
  console.log(`  ${i++}: edit configs in ${bold(cyan('backend/config'))}`);
  console.log(`  ${i++}: Run the server using ${bold(cyan('npm run backend'))}`);
}

async function exportBackend(cwd) {
  // TODO: Add repo tag => marcellejs/marcelle#v1.2.3 + monorepo subdir
  const emitter = degit('marcellejs/marcelle', {
    cache: true,
    force: true,
    verbose: true,
  });

  emitter.on('info', (info) => {
    console.log(info.message);
  });

  await emitter.clone(path.join(cwd, 'backend'));
  console.log('done');
}

async function main() {
  console.log(gray(`\nmarcelle devtools version ${version}`));

  const cwd = process.cwd();
  const hasPkg = fs.existsSync(path.join(cwd, 'package.json'));
  const pkg = hasPkg && JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf-8'));
  const isMarcelle =
    hasPkg &&
    (pkg.name === '@marcellejs/core' || Object.keys(pkg.dependencies).includes('@marcellejs/core'));
  if (!isMarcelle) {
    console.log(
      bold(
        red(
          'This does does not seem to be a Marcelle application (missing package.json or @marcellejs/core depdendency)',
        ),
      ),
    );
    return null;
  }

  const { action } = await prompts(
    [
      {
        type: 'select',
        name: 'action',
        message: 'What do you want to do?',
        choices: [
          { title: 'Create a component', value: 'component' },
          { title: 'Manage the backend', value: 'backend' },
        ],
        initial: 0,
      },
    ],
    { onCancel },
  );

  console.log('action', action);

  if (action === 'component') {
    return generateComponent(cwd);
  }

  const { backend_action } = await prompts(
    [
      {
        type: 'select',
        name: 'backend_action',
        message: 'What do you want to do?',
        choices: [
          { title: 'Setup a backend for the project', value: 'create' },
          { title: 'Export the backend (to modify its source code)', value: 'export' },
        ],
        initial: 0,
      },
    ],
    { onCancel },
  );
  if (backend_action === 'create') {
    return configureBackend(cwd, pkg);
  }

  if (backend_action === 'export') {
    return exportBackend(cwd);
  }

  return null;
}

main();
