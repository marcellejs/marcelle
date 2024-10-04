module.exports = {
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  env: {
    browser: true,
  },
  plugins: ['svelte', 'prettier'],
  extends: ['eslint:recommended', 'plugin:svelte/recommended', 'prettier'],
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
    },
  ],
  ignorePatterns: [
    'node_modules/*',
    'dist/*',
    'types',
    '.prettierrc.js',
    '.eslintrc.js',
    'tailwind.config.js',
  ],
};
