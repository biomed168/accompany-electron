import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import { MakerZIP } from '@electron-forge/maker-zip'
import { MakerDeb } from '@electron-forge/maker-deb'
import { VitePlugin } from '@electron-forge/plugin-vite'

const config = {
  packagerConfig: {
    asar: {
      // 用于指定哪些目录或文件在打包时应该被排除在 ASAR 文件之外，保持它们的原始格式
      // 有些文件（如二进制文件、动态库等）在 ASAR 文件中可能会出现问题，因此需要将它们排除在外
      unpackDir: '{.vite/build/lib,.vite/build/samples}',
    },
    icon: './src/renderer/assets/icon.png',
    name: 'Accompany',
    executableName: 'accompany',
    protocols: [
      {
        name: 'Accompany',
        schemes: ['accompany'],
      },
    ],
  },
  makers: [
    {
      name: '@electron-forge/maker-dmg',
      config: {
        icon: './src/renderer/assets/icon.png',
      },
    },
    new MakerSquirrel({
      name: 'Accompany',
      setupIcon: './src/renderer/assets/icon.ico',
    }),
    new MakerZIP({}),
    new MakerDeb({
      options: {
        name: 'accompany',
        productName: 'Accompany',
        icon: './assets/icon.png',
        mimeType: ['x-scheme-handler/accompany'],
      },
    }),
  ],
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: 'src/main/index.ts',
          config: 'vite.main.config.ts',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    {
      // 自动处理原生模块的解压，确保它们在 Electron 应用程序中可以正常工作
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
}

export default config
