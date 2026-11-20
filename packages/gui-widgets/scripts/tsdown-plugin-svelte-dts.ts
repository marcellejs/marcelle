import { resolve } from 'node:path';
import process from 'node:process';
import { emitDts } from 'svelte2tsx';

interface Options {
  declarationDir?: string;
  libRoot?: string;
  tsconfig?: string;
  svelteShimsPath?: string;
}

export function svelteDtsPlugin(options: Options = {}) {
  const cwd = process.cwd();

  return {
    name: 'tsdown-plugin-svelte-dts',
    async closeBundle() {
      const {
        declarationDir = './dist',
        libRoot = './src',
        tsconfig = 'tsconfig.json',
        svelteShimsPath = 'node_modules/svelte2tsx/svelte-shims-v4.d.ts',
      } = options;

      const declarationDirAbs = resolve(cwd, declarationDir);

      try {
        await emitDts({
          declarationDir: declarationDirAbs,
          svelteShimsPath: resolve(cwd, svelteShimsPath),
          libRoot: resolve(cwd, libRoot),
          tsconfig: resolve(cwd, tsconfig),
        });

        console.log('Svelte DTS generation complete');
      } catch (error) {
        console.error('❌ Svelte DTS generation failed:', error);
        throw error;
      }
    },
  };
}
