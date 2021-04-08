module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  extends: ['airbnb-typescript/base', 'prettier'],
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
    '@typescript-eslint/lines-between-class-members': 'off',
    'import/prefer-default-export': 'off',
    'no-plusplus': 'off',
    'prefer-destructuring': 'off',
  },
  ignorePatterns: [
    'node_modules/*',
    '**/*.svelte',
    'dist/*',
    'types',
    '.prettierrc.js',
    '.eslintrc.js',
  ],
};
