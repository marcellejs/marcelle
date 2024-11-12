export default {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  plugins: ['prettier-plugin-svelte', 'prettier-plugin-tailwindcss'],
  tailwindConfig: './packages/core/tailwind.config.cjs',
  overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }],
};
