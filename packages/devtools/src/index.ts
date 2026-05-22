#!/usr/bin/env node
/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import { bold, gray, red } from 'kleur/colors';
import prompts from 'prompts';
import { generateComponent } from './component.js';
import { configureBackend, exportBackend } from './backend.js';
import { generateSystemUserScript, generateNginxPM2Configs } from './deployment.js';

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
          { title: 'Prepare the deployment', value: 'deploy' },
        ],
        initial: 0,
      },
    ],
    { onCancel },
  );

  if (action == 'component') {
    return generateComponent(cwd);
  } else if (action == 'backend') {
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
  } else if (action == 'deploy') {
    const { deployment_tech } = await prompts(
      [
        {
          type: 'select',
          name: 'deployment_tech',
          message: 'Which technologies to use?',
          choices: [{ title: 'Deploy my app with Nginx & PM2', value: 'nginxPM2' }],
          initial: 0,
        },
      ],
      { onCancel },
    );

    if (deployment_tech == 'nginxPM2') {
      const { setupSystemUser } = await prompts(
        [
          {
            type: 'confirm',
            name: 'setupSystemUser',
            message:
              'Do you want to deploy you app with a system user (on a linux environment)? (recommended: more secure)',
          },
        ],
        { onCancel },
      );
      const { hasBackend } = await prompts(
        [
          {
            type: 'confirm',
            name: 'hasBackend',
            message: 'Is your app using a Marcelle Backend?',
          },
        ],
        { onCancel },
      );
      const { hasPythonServer } = await prompts(
        [
          {
            type: 'confirm',
            name: 'hasPythonServer',
            message: 'Is your app using a Python server to serve ML models?',
          },
        ],
        { onCancel },
      );
      let modelServingFct = 'none';
      if (hasPythonServer) {
        ({ modelServingFct } = await prompts(
          [
            {
              type: 'text',
              name: 'modelServingFct',
              message:
                'What is the name of the function to use with Ray to serve ML models in Python?',
            },
          ],
          { onCancel },
        ));
      }
      const { gitPath } = await prompts(
        [
          {
            type: 'text',
            name: 'gitPath',
            message: 'What is the git path to your Marcelle app? (https link to the git repo)',
          },
        ],
        { onCancel },
      );
      const { appName } = await prompts(
        [
          {
            type: 'text',
            name: 'appName',
            message: 'What is the name of the app? (no whitespace)',
          },
        ],
        { onCancel },
      );
      const { domainName } = await prompts(
        [
          {
            type: 'text',
            name: 'domainName',
            message: 'What is the domain name that you are going to use? (no whitespace)',
          },
        ],
        { onCancel },
      );

      if (setupSystemUser) {
        generateSystemUserScript(cwd);
        //cwd: string, hasSystemUser: bool, hasBackend: bool, hasPythonServer: bool, gitPath: string, domainName: string
        generateNginxPM2Configs(
          cwd,
          setupSystemUser,
          hasBackend,
          hasPythonServer,
          modelServingFct,
          appName,
          gitPath,
          domainName,
        );
        console.log('Inside ! Domain: ' + domainName);
      } else {
        console.log('Outside ! Domain: ' + domainName);
      }
    }
  }

  return null;
}
