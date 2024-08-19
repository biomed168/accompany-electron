import path from 'path';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import type { ConfigEnv, UserConfig } from 'vite';
import { defineConfig } from 'vite';
import { pluginExposeRenderer } from './vite.base.config';
import forgeConfig from './forge.config';

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv;
  const { mode } = forgeEnv;
  const name = forgeConfig.renderer.filter(({ name }) => name != null)[0].name!;
  return {
    mode,
    base: './',
    build: {
      outDir: `.vite/renderer/${name}`,
    },
    plugins: [
      pluginExposeRenderer(name),
      react(),
      viteStaticCopy({
        targets: [
          // {
          //   src: 'assets/*',
          //   dest: 'assets',
          // },
        ],
      }),
    ],
    resolve: {
      preserveSymlinks: true,
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@renderer': path.resolve(__dirname, './src/renderer'),
      },
    },
    optimizeDeps: {},
    clearScreen: false,
  } as UserConfig;
});
