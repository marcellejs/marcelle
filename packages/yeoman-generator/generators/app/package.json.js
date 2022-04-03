module.exports = function makePkgConfig(generator) {
  const { props } = generator;
  const ts = props.language === 'ts';

  const dependencies = { '@marcellejs/core': '^0.5.1' };
  const devDependencies = {
    '@sveltejs/vite-plugin-svelte': '^1.0.0-next.11',
    eslint: '^8.11.0',
    'eslint-config-prettier': '^8.3.0',
    'eslint-plugin-import': '^2.23.4',
    'eslint-plugin-prettier': '^4.0.0',
    'eslint-plugin-svelte3': '^3.2.0',
    prettier: '^2.2.0',
    svelte: '^3.46.4',
    vite: '^2.3.7',
  };

  if (ts) {
    Object.assign(devDependencies, {
      '@typescript-eslint/eslint-plugin': '^5.15.0',
      '@typescript-eslint/parser': '^5.15.0',
    });
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
    scripts: {
      dev: 'vite',
      build: 'vite build',
    },
    dependencies,
    devDependencies,
  };

  return pkg;
};
