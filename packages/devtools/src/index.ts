#!/usr/bin/env node
/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import { bold, gray, red } from 'kleur/colors';
import prompts from 'prompts';
import { generateComponent } from './component.js';
import { configureBackend, exportBackend } from './backend.js';

const thisPkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));
const { version } = thisPkg;

const onCancel = () => {
  process.exit();
};

export default async function cli(): Promise<void> {
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
