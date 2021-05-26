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
      '/api/': [
        '',
        'streams',
        'data-storage',
        'core-components',
        'interface-components',
        // {
        //   title: 'Components',
        //   collapsable: false,
        //   children: [
        //     '/api/components/',
        //     '/api/components/core-components',
        //     '/api/components/interface-components',
        //     // '/api/components/data',
        //     // '/api/components/inputs',
        //     // '/api/components/models',
        //     // '/api/components/training',
        //     // '/api/components/predictions',
        //     // '/api/components/visualization',
        //     // '/api/components/widgets',
        //   ],
        // },
        'layouts',
        'processors',
        'utilities',
      ],
      '/': [
        '/installation',
        {
          title: 'Guide',
          collapsable: false,
          children: [
            '/guide/',
            '/guide/getting-started',
            '/guide/creating-modules',
            // '/guide/adding-a-backend',
          ],
        },
        '/cli',
      ],
    },
  },
};
