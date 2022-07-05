const { defaultTheme } = require('vuepress');
const { searchPlugin } = require('@vuepress/plugin-search');

module.exports = {
  title: 'Marcelle',
  description: 'An Interactive Machine Learning Toolkit',
  head: [
    // ['link', { rel: 'icon', href: `/logo.png` }],
    // ['link', { rel: 'apple-touch-icon', href: `/icons/apple-touch-icon-152x152.png` }],
    // ['link', { rel: 'mask-icon', href: '/icons/safari-pinned-tab.svg', color: '#3eaf7c' }],
    // ['meta', { name: 'msapplication-TileImage', content: '/icons/msapplication-icon-144x144.png' }],
  ],
  serviceWorker: false,
  plugins: [
    searchPlugin({
      // options
    }),
  ],
  theme: defaultTheme({
    repo: 'marcellejs/marcelle',
    docsDir: 'docs',
    navbar: [
      {
        text: 'Guide',
        link: '/guide/',
      },
      {
        text: 'API Reference',
        link: '/api/',
      },
      {
        text: 'Examples',
        link: 'https://demos.marcelle.dev/',
      },
      {
        text: 'Credits',
        link: '/credits/',
      },
    ],
    sidebar: {
      '/api/': [
        {
          text: 'Core',
          collapsable: false,
          children: [
            '/api/component',
            '/api/streams',
            '/api/data-storage',
            '/api/models',
            '/api/utilities',
          ],
        },
        // 'components',
        {
          text: 'Components',
          collapsable: false,
          children: [
            '/api/components/charts',
            '/api/components/data-sources',
            '/api/components/data-displays',
            '/api/components/model-interfaces',
            '/api/components/models',
            '/api/components/prediction-displays',
            '/api/components/widgets',
          ],
        },
        {
          text: 'Layouts',
          collapsable: false,
          children: ['/api/dashboard', '/api/wizard'],
        },
        '/api/python',
      ],
      '/': [
        '/installation',
        {
          text: 'Guide',
          collapsable: false,
          children: [
            '/guide/',
            '/guide/getting-started',
            '/guide/creating-components',
            // '/guide/adding-a-backend',
          ],
        },
        '/cli',
      ],
    },
  }),
};
