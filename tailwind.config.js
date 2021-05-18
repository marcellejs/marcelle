const colors = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');

const production = !process.env.ROLLUP_WATCH;

module.exports = {
  mode: 'jit',
  // purge: {
  //   enabled: production,
  //   content: ['./src/**/*.svelte'],
  // },
  purge: ['./src/**/*.{css,js,jsx,ts,tsx,svelte}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.coolGray,
      blue: colors.lightBlue,
      green: colors.emerald,
      indigo: colors.indigo,
      teal: colors.teal,
      red: colors.rose,
      yellow: colors.amber,
    },
  },
  variants: {},
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
