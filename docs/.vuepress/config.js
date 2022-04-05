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
  plugins: ['@vuepress/plugin-search'],
  themeConfig: {
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
          children: ['component', 'streams', 'data-storage', 'models', 'utilities'],
        },
        // 'components',
        {
          text: 'Components',
          collapsable: false,
          children: [
            'components/charts',
            'components/data-sources',
            'components/data-displays',
            'components/model-interfaces',
            'components/models',
            'components/prediction-displays',
            'components/widgets',
          ],
        },
        {
          text: 'Layouts',
          collapsable: false,
          children: ['dashboard', 'wizard'],
        },
        'python',
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
  },
};
