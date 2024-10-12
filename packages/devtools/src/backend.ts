/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import { bold, cyan, green } from 'kleur/colors';
import prompts from 'prompts';
import { snakeCase } from 'scule';
import { Octokit } from '@octokit/rest';
import fetch from 'node-fetch';
import { copy, dist, mkdirp } from './utils.js';

const thisPkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));
const backendVersion = thisPkg.devDependencies['@marcellejs/backend'].replace('workspace:', '');

const onCancel = () => {
  process.exit();
};

interface PackageJson {
  name: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
}

export async function configureBackend(cwd: string, pkg: PackageJson): Promise<void> {
  // const { database, auth } = await prompts(
  //   [
  //     {
  //       type: 'select',
  //       name: 'database',
  //       message: 'What kind of database do you want to use?',
  //       choices: [
  //         { title: 'NeDB', value: 'nedb' },
  //         { title: 'MongoDB', value: 'mongodb' },
  //       ],
  //       initial: 0,
  //     },
  //     {
  //       type: 'toggle',
  //       name: 'auth',
  //       message: 'Do you want to use authentication?',
  //     },
  //   ],
  //   { onCancel },
  // );

  // let dbname = '';
  // if (database === 'mongodb') {
  //   dbname = snakeCase(pkg.name);
  //   ({ dbname } = await prompts(
  //     [
  //       {
  //         type: 'text',
  //         name: 'dbname',
  //         message: 'What database name do you want to use with mongodb?',
  //         initial: dbname,
  //       },
  //     ],
  //     { onCancel },
  //   ));
  // }

  let dbname = snakeCase(pkg.name);
  const res = await prompts(
    [
      {
        type: 'text',
        name: 'dbname',
        message: 'What database name do you want to use with mongodb?',
        initial: dbname,
      },
      {
        type: 'toggle',
        name: 'auth',
        message: 'Do you want to use authentication?',
      },
    ],
    { onCancel },
  );
  dbname = res.dbname;
  const { auth } = res;

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
      const config = JSON.parse(fs.readFileSync(path.join(dir, srcname), 'utf-8'));
      config.mongodb = `mongodb://localhost:27017/${dbname}`;
      config.database = 'mongodb';
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

  mkdirp(path.join(dst, 'public'));

  const files2 = fs.readdirSync(dir).filter((x) => x === 'index.html');
  for (const srcname of files2) {
    copy(path.join(dir, srcname), path.join(dst, 'public', srcname));
    console.log(`\tadded: ${green('backend/public/' + srcname)}`);
  }

  let dependencies: PackageJson['dependencies'] = {
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

async function writeBackendFiles(dstDir: string, githubPath: string, octokit: Octokit) {
  const files = await octokit.rest.repos.getContent({
    owner: 'marcellejs',
    repo: 'marcelle',
    path: githubPath,
    ref: 'develop', // TODO: Update this with version
    // ref: backendVersion.replace('^', 'v'),
  });
  mkdirp(dstDir);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const { name, type, download_url } of (files as any).data) {
    if (name === 'config' && type === 'dir') {
      continue;
    } else if (type === 'dir') {
      await writeBackendFiles(`${dstDir}/${name}`, `${githubPath}/${name}`, octokit);
    } else {
      const contents = await fetch(download_url).then((res) => res.text());
      fs.writeFileSync(`${dstDir}/${name}`, contents);
      console.log(`\tadded: ${green(`${dstDir}/${name}`)}`);
    }
  }
}

export async function exportBackend(cwd: string): Promise<void> {
  const { confirm } = await prompts(
    [
      {
        type: 'confirm',
        name: 'confirm',
        message: 'This feature is still experimental, continue?',
      },
    ],
    { onCancel },
  );
  if (!confirm) return;

  const octokit = new Octokit();
  writeBackendFiles(`${cwd}/backend`, 'packages/backend', octokit);
}
