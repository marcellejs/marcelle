import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Marcelle',
  description: 'An Interactive Machine Learning Toolkit',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {
        text: 'Guides',
        link: '/guides/',
      },
      {
        text: 'API Reference',
        link: '/api/',
      },
      {
        text: 'Examples',
        link: 'https://marcelle-demos-next.netlify.app/',
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
          ],
        },
        {
          text: '@marcellejs/gui-widgets',
          collapsed: true,
          items: [
            { text: 'Guide', link: '/api/gui-widgets/' },
            { text: 'API', link: '/api/gui-widgets/components' },
          ],
        },
        {
          text: '@marcellejs/backend',
          collapsed: true,
          items: [{ text: 'Configuration', link: '/api/backend/' }],
        },
        {
          text: '@marcellejs/layouts',
          collapsed: true,
          items: [
            { text: 'Dashboards', link: '/api/dashboard' },
            { text: 'Wizards', link: '/api/wizard' },
          ],
        },
        {
          text: '@marcellejs/onnx',
          collapsed: true,
          items: [
            { text: 'Guide', link: '/api/onnx/' },
            { text: 'API', link: '/api/onnx/components' },
          ],
        },
        {
          text: '@marcellejs/tensorflow',
          collapsed: true,
          items: [
            { text: 'Guide', link: '/api/tensorflow/' },
            { text: 'API', link: '/api/tensorflow/components' },
          ],
        },
        {
          text: 'Python',
          collapsed: true,
          items: [{ text: 'API', link: '/api/python' }],
        },
      ],
      '/': [
        {
          text: 'Getting Started',
          collapsed: true,
          items: [
            { text: 'Introduction', link: '/guides/' },
            { text: 'Quickstart', link: '/guides/quickstart' },
            { text: 'Creating Marcelle Apps', link: '/guides/installation' },
            {
              text: 'Using components',
              link: '/guides/using-components',
            },
            { text: 'Reactive pipelines', link: '/guides/reactive-pipelines' },
            { text: 'Creating a new component', link: '/guides/creating-components' },
            {
              text: 'Adding server-side data storage',
              link: '/guides/data-storage',
            },
          ],
        },
        {
          text: 'Machine Learning Models',
          collapsed: true,
          items: [
            { text: 'Introduction', link: '/guides/machine-learning-models/' },
            {
              text: 'How to use my model?',
              link: '/guides/machine-learning-models/model-decision-tree',
            },
            {
              text: 'Client-side inference',
              link: '/guides/machine-learning-models/client-side-inference',
            },
            {
              text: 'Server-side inference',
              link: '/guides/machine-learning-models/server-side-inference',
            },
            {
              text: 'Training Models with Marcelle Data',
              link: '/guides/machine-learning-models/train-models-marcelle',
            },
          ],
        },
        {
          text: 'Data Management',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/guides/data-management/' },
            {
              text: 'Server-side data storage',
              link: '/guides/data-management/server-side-data-storage',
            },
            { text: 'Authentication', link: '/guides/data-management/authentication' },
            { text: 'Security', link: '/guides/data-management/security' },
          ],
        },
        {
          text: 'Deployment',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/guides/deployment/' },
            { text: 'Example using Nginx and PM2', link: '/guides/deployment/nginx-pm2' },
            { text: 'Example using Docker', link: '/guides/deployment/docker' },
          ],
        },
        {
          text: 'Development Tools',
          collapsed: true,
          items: [
            { text: 'App Generation', link: '/guides/devtools/app-generation' },
            { text: 'DevTools', link: '/guides/devtools/devtools' },
            { text: 'Setting Up a Development Environment', link: '/guides/devtools/setting-up' },
          ],
        },
      ],
    },

    outline: 'deep',

    socialLinks: [
      { icon: 'github', link: 'https://github.com/marcellejs/marcelle' },
      { icon: 'discord', link: '#' },
    ],

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/marcellejs/marcelle/edit/main/docs/:path',
    },
  },

  markdown: {
    lineNumbers: true,
  },
  lastUpdated: true,
  ignoreDeadLinks: 'localhostLinks',
});
