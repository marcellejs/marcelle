module.exports = {
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  env: {
    browser: true,
  },
  plugins: ['svelte3', 'prettier'],
  extends: ['eslint:recommended', 'prettier'],
  overrides: [
    {
      files: ['*.svelte'],
      processor: 'svelte3/svelte3',
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
