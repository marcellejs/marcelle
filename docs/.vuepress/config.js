module.exports = {
  title: 'marcelle.js',
  description: 'A Versatile Interactive Machine Learning Toolkit',
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
      {
        text: 'Modules Reference',
        link: '/modules/',
      },
      {
        text: 'Examples',
        link: '/examples/',
      },
    ],
    sidebar: {
      '/api/': ['', 'modules', 'streams', 'interfaces', 'backends'],
      '/modules/': ['', 'sources', 'data', 'models', 'predictions'],
      '/': [
        '/installation',
        '/',
        '/guide/',
        // {
        //   title: 'Guide',
        //   collapsable: false,
        //   children: ['/guide/observables-watchers', '/guide/internal-api'],
        // },
        // {
        //   title: 'Extending',
        //   collapsable: false,
        //   children: ['/extending/', '/extending/custom-components', '/extending/plugins'],
        // },
      ],
    },
  },
};
