import '../src/ui/css/styles.css';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  backgrounds: {
    values: [
      {
        name: 'light',
        value: '#F8F8F8',
      },
      {
        name: 'dashboard',
        value: 'rgb(237, 242, 247)',
      },
      {
        name: 'dark',
        value: '#333333',
      },
    ],
  },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  options: {
    storySort: (a, b) =>
      a[1].kind === b[1].kind ? 0 : a[1].id.localeCompare(b[1].id, undefined, { numeric: true }),
  },
};
