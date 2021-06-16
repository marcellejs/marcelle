const sveltePreprocess = require('svelte-preprocess');

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx|svelte)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    {
      name: '@storybook/addon-postcss',
      options: {
        postcssLoaderOptions: {
          implementation: require('postcss'),
        },
      },
    },
    '@storybook/addon-svelte-csf',
    '@storybook/addon-a11y',
  ],
  svelteOptions: {
    preprocess: require('svelte-preprocess')({ postcss: true }),
  },
};
