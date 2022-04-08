/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const colors = require('tailwindcss/colors');

const production = !process.env.ROLLUP_WATCH;
process.env.NODE_ENV = production ? JSON.stringify('production') : JSON.stringify('development');

module.exports = {
  content: ['./src/**/*.{css,js,jsx,ts,tsx,svelte}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.gray,
      blue: colors.sky,
      green: colors.emerald,
      indigo: colors.indigo,
      teal: colors.teal,
      red: colors.rose,
      yellow: colors.amber,
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
