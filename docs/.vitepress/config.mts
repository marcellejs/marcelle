import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Marcelle',
  description: 'An Interactive Machine Learning Toolkit',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
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
          items: [
            { text: 'Component API', link: '/api/component' },
            { text: 'Streams', link: '/api/streams' },
            { text: 'Data Storage', link: '/api/data-storage' },
            { text: 'Models', link: '/api/models' },
            { text: 'Utilities', link: '/api/utilities' },
          ],
        },
        // 'components',
        {
          text: 'Components',
          items: [
            { text: 'Charts', link: '/api/components/charts' },
            { text: 'Data sources', link: '/api/components/data-sources' },
            { text: 'Data displays', link: '/api/components/data-displays' },
            { text: 'Model interfaces', link: '/api/components/model-interfaces' },
            { text: 'Models', link: '/api/components/models' },
            { text: 'Prediction displays', link: '/api/components/prediction-displays' },
            { text: 'Widgets', link: '/api/components/widgets' },
          ],
        },
        {
          text: 'Layouts',
          items: [
            { text: 'Dashboards', link: '/api/dashboard' },
            { text: 'Wizards', link: '/api/wizard' },
          ],
        },
        {
          text: 'Python',
          link: '/api/python',
        },
      ],
      '/': [
        { text: 'Installation', link: '/installation' },
        {
          text: 'Guide',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Creating Components', link: '/guide/creating-components' },
            // '/guide/adding-a-backend',
          ],
        },
        { text: 'CLI', link: '/cli' },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/marcellejs/marcelle' },
      { icon: 'discord', link: '#' },
    ],

    search: {
      provider: 'local',
    },
  },

  markdown: {
    lineNumbers: true,
  },

  ignoreDeadLinks: 'localhostLinks',
});
