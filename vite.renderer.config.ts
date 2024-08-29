import path from 'path';
import react from '@vitejs/plugin-react';
import type { ConfigEnv, UserConfig } from 'vite';
import { defineConfig } from 'vite';
import { pluginExposeRenderer } from './vite.base.config';

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'renderer'>;
  const { root, mode, forgeConfigSelf } = forgeEnv;
  const name = forgeConfigSelf.name ?? '';

  return {
    root,
    mode,
    base: './',
    publicDir: './src/renderer/public',
    build: {
      outDir: `.vite/renderer/${name}`,
    },
    assetsInclude: ['**/*.wasm'],
    plugins: [pluginExposeRenderer(name), react()],
    resolve: {
      preserveSymlinks: true,
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@main': path.resolve(__dirname, './src/main'),
        '@renderer': path.resolve(__dirname, './src/renderer'),
      },
    },
    clearScreen: false,
  } as UserConfig;
});
