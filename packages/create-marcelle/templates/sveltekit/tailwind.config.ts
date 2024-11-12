import typography from '@tailwindcss/typography';
import daisyui from 'daisyui';
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {},
  },

  plugins: [typography, daisyui],

  daisyui: {
    themes: true,
    darkTheme: 'dark',
    // prefix: '',
    logs: true,
    themeRoot: ':root',
  },
} satisfies Config;
