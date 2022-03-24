module.exports = {
  env: {
    browser: true,
  },
  extends: ['airbnb-base', 'prettier'],
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
    'import/no-extraneous-dependencies': 'off',
    'prefer-object-spread': 'off',
    'no-param-reassign': 'off',
    'no-underscore-dangle': 'off',
  },
};
