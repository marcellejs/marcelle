/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const colors = require('tailwindcss/colors');
const daisyui = require('daisyui');

const production = !process.env.ROLLUP_WATCH;
process.env.NODE_ENV = production ? JSON.stringify('production') : JSON.stringify('development');

module.exports = {
  content: [
    './src/**/*.{css,js,jsx,ts,tsx,svelte}',
    './node_modules/@marcellejs/design-system/dist/*.{css,js,jsx,ts,tsx,svelte}',
  ],
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
  plugins: [daisyui],
  daisyui: {
    themes: true, // false: only light + dark | true: all themes | array: specific themes like this ["light", "dark", "cupcake"]
    darkTheme: 'dark', // name of one of the included themes for dark mode
    base: false, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    prefix: '', // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
    themeRoot: ':root', // The element that receives theme color CSS variables
  },
  corePlugins: {
    preflight: true,
  },
};
