const webpackDevDependencies = ts =>
  Object.assign(
    {},
    {
      'cross-env': '^7.0.2',
      'css-loader': '^5.0.1',
      'mini-css-extract-plugin': '^1.2.1',
      serve: '^11.3.2',
      'style-loader': '^2.0.0',
      svelte: '^3.29.4',
      'svelte-loader': '^2.13.6',
      webpack: '^4.44.2',
      'webpack-cli': '^4.2.0',
      'webpack-dev-server': '^3.11.0',
    },
    ts ? { typescript: '^4.0.5', 'ts-loader': '^8.0.9' } : {},
  );

const viteDependencies = { svelte: '^3.38.2' };
const viteDevDependencies = { vite: '^2.3.7', '@sveltejs/vite-plugin-svelte': '^1.0.0-next.11' };

const eslintDevDependencies = (ts, prettier) =>
  Object.assign(
    {},
    {
      eslint: '^7.28.0',
      'eslint-plugin-import': '^2.23.4',
      'eslint-plugin-svelte3': '^3.2.0',
    },
    ts
      ? {
          '@typescript-eslint/eslint-plugin': '^4.22.1',
          '@typescript-eslint/parser': '^4.22.1',
        }
      : {},
    prettier
      ? {
          'eslint-config-prettier': '^8.3.0',
          'eslint-plugin-prettier': '^3.4.0',
          prettier: '^2.2.0',
        }
      : {},
  );

module.exports = function makePkgConfig(generator) {
  const { props } = generator;
  const ts = props.language === 'ts';

  const dependencies = { '@marcellejs/core': '^0.5.0' };
  const devDependencies = {};
  let scripts = {};
  if (props.linting.includes('eslint')) {
    Object.assign(devDependencies, eslintDevDependencies(ts, props.linting.includes('prettier')));
  }
  if (props.buildTool === 'vite') {
    scripts = {
      dev: 'vite',
      build: 'vite build',
    };
    Object.assign(dependencies, viteDependencies);
    Object.assign(devDependencies, viteDevDependencies);
  } else if (props.buildTool === 'webpack') {
    scripts = {
      dev: 'cross-env NODE_ENV=development webpack serve --content-base public',
      build: 'cross-env NODE_ENV=production webpack',
    };
    Object.assign(devDependencies, webpackDevDependencies(ts));
  }

  const pkg = {
    name: props.name,
    description: props.description,
    version: '0.0.0',
    main: 'public/bundle.js',
    keywords: ['marcelle'],
    license: 'MIT',
    author: {
      name: generator.user.git.name(),
      email: generator.user.git.email(),
    },
    scripts,
    dependencies,
    devDependencies,
  };

  return pkg;
};
