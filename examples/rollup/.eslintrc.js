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
  plugins: ['svelte3'],
  extends: [
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
    // 'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
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
  ],
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
    'object-curly-newline': 'off',
    '@typescript-eslint/lines-between-class-members': 'off',
    'no-plusplus': 'off',
    'implicit-arrow-linebreak': 'off',
    'function-paren-newline': 'off',
  },
};
