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
  themeConfig: {
    repo: 'marcellejs/marcelle',
    docsDir: 'docs',
    nav: [
      {
        text: 'Guide',
        link: '/guide/',
      },
      {
        text: 'API Reference',
        link: '/api/',
      },
      // {
      //   text: 'Cookbook',
      //   link: '/cookbook/',
      // },
      {
        text: 'Examples',
        link: '/examples/',
      },
    ],
    sidebar: {
      // '/api/': ['', 'modules', 'streams', 'interfaces', 'backends'],
      '/api/': [
        '',
        {
          title: 'Modules',
          collapsable: false,
          children: [
            '/api/modules/',
            '/api/modules/data',
            '/api/modules/inputs',
            '/api/modules/models',
            '/api/modules/training',
            '/api/modules/predictions',
            '/api/modules/visualization',
            '/api/modules/widgets',
          ],
        },
        'streams',
        'interfaces',
        'backends',
      ],
      '/': [
        '/installation',
        {
          title: 'Guide',
          collapsable: false,
          children: [
            '/guide/',
            '/guide/quickstart',
            '/guide/generating-an-app',
            '/guide/creating-modules',
            '/guide/adding-a-backend',
          ],
        },
        '/cli',
      ],
    },
  },
};
