module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['svelte', '@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/strict',
    'plugin:@typescript-eslint/stylistic',
    'plugin:svelte/recommended',
    'prettier',
  ],
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      // Parse the `<script>` in `.svelte` as TypeScript by adding the following configuration.
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
  ],
  rules: {
    '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
  },
  ignorePatterns: [
    'node_modules/*',
    'dist/*',
    'types',
    '.prettierrc.js',
    '.eslintrc.js',
    'tailwind.config.js',
  ],
};
