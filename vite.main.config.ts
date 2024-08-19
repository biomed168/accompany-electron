import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';
import type { ConfigEnv, UserConfig } from 'vite';
import { defineConfig, mergeConfig } from 'vite';
import {
  getBuildConfig,
  getBuildDefine,
  pluginHotRestart,
  external,
} from './vite.base.config';

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv;
  const define = getBuildDefine(forgeEnv);
  const config: UserConfig = {
    build: {
      lib: {
        entry: './main/index.ts',
        fileName: () => '[name].js',
        formats: ['es'],
      },
      rollupOptions: {
        external: [...external],
        output: {
          strict: false,
        },
        plugins: [],
      },
      commonjsOptions: {
        transformMixedEsModules: true,
        defaultIsModuleExports: true,
        esmExternals: true,
      },
    },
    plugins: [
      pluginHotRestart('restart'),
      viteStaticCopy({
        targets: [],
      }),
    ],
    define,
    resolve: {
      // Load the Node.js entry.
      mainFields: ['module', 'jsnext:main', 'jsnext'],
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@main': path.resolve(__dirname, './src/main'),
        // '@commands': path.resolve(__dirname, './src/commands'),
      },
    },
  };

  return mergeConfig(getBuildConfig(forgeEnv), config);
});
