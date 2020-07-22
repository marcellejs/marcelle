/* eslint-disable @typescript-eslint/no-var-requires */
const { resolve } = require('path');
const { readdirSync, lstatSync } = require('fs');

const PACKAGE_DIRS = ['packages/', 'examples/']; // this could be replaced utilizing the globs in package.json's "workpackges" or from the lerna.json config

// get files in packages
function noExtra(PACKAGE_DIR) {
  return (
    readdirSync(resolve(__dirname, PACKAGE_DIR))
      // filter for non-hidden dirs to get a list of packages
      .filter(
        (entry) =>
          entry.substr(0, 1) !== '.' &&
          lstatSync(resolve(__dirname, PACKAGE_DIR, entry)).isDirectory(),
      )
      // map to override rules pointing to local and root package.json for rule
      .map((entry) => ({
        files: [`${PACKAGE_DIR}${entry}/**/*`],
        rules: {
          'import/no-extraneous-dependencies': [
            'error',
            {
              devDependencies: true,
              optionalDependencies: false,
              peerDependencies: false,
              packageDir: [__dirname, resolve(__dirname, PACKAGE_DIR, entry)],
            },
          ],
        },
      }))
  );
}

const noExtraneousOverrides = PACKAGE_DIRS.reduce((x, p) => x.concat(noExtra(p)), []);

module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'svelte3'],
  extends: ['airbnb/base', 'plugin:@typescript-eslint/recommended'],
  overrides: [
    {
      files: ['**/*.svelte'],
      processor: 'svelte3/svelte3',
      rules: {
        'import/first': 'off',
        'import/no-mutable-exports': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    },
    ...noExtraneousOverrides,
  ],
  settings: {
    'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  rules: {
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        mjs: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/prefer-default-export': 'off',
    'lines-between-class-members': 'off',
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-unused-expressions': 'error',
    'no-unused-expressions': 'off',
    'object-curly-newline': 'off',
    'arrow-parens': 'off',
    'implicit-arrow-linebreak': 'off',
    'no-plusplus': 'off',
    'operator-linebreak': 'off',
    'function-paren-newline': 'off',
    // Place to specify ESLint rules. Can be used to overwrite rules specified
    // from the extended configs
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
  },
};
