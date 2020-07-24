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
  },
};
