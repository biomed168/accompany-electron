import path from 'path'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import type { ConfigEnv, UserConfig } from 'vite'
import { defineConfig } from 'vite'
import { pluginExposeRenderer } from './vite.base.config'
import Checker from 'vite-plugin-checker'

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'renderer'>
  const { root, mode, forgeConfigSelf } = forgeEnv
  const name = forgeConfigSelf.name ?? ''

  return {
    root,
    mode,
    base: './',
    build: {
      outDir: `.vite/renderer/${name}`,
    },
    plugins: [
      Checker({
        typescript: true,
      }),
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
  } as UserConfig
})
