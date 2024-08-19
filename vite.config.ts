import path from 'path'
import react from '@vitejs/plugin-react'
import type { UserConfig } from 'vite'
import { defineConfig } from 'vite'
import Checker from 'vite-plugin-checker'

// https://vitejs.dev/config
export default defineConfig((env) => {
  const { mode } = env

  return {
    mode,
    base: './',
    build: {
      outDir: `.vite/dist`,
    },
    plugins: [
      Checker({
        typescript: true,
      }),
      react(),
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
