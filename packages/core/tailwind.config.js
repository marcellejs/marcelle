const production = !process.env.ROLLUP_WATCH;

module.exports = {
  purge: {
    enabled: production,
    content: ['./src/**/*.svelte'],
  },
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
};
