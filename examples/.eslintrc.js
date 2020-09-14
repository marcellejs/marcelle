module.exports = {
  root: true,
  env: {
    browser: true,
  },
  extends: ['airbnb-base'],
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
    'operator-linebreak': 'off',
  },
};
