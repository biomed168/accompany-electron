import {
  app,
  BrowserWindow,
  WebContentsView,
  ipcMain,
  shell,
  dialog,
  systemPreferences,
} from 'electron';
import log from '@/main/logger';
import {
  WIN_CLOSE_CHANNEL,
  WIN_MAXIMIZE_CHANNEL,
  WIN_MINIMIZE_CHANNEL,
} from './window-channels';
import fs from 'fs-extra';
import settings from '@/main/settings';
import path from 'path';

const logger = log.scope('window');

export function addWindowEventListeners(mainWindow: BrowserWindow) {
  ipcMain.handle(WIN_MINIMIZE_CHANNEL, () => {
    mainWindow.minimize();
  });
  ipcMain.handle(WIN_MAXIMIZE_CHANNEL, () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });
  ipcMain.handle(WIN_CLOSE_CHANNEL, () => {
    mainWindow.close();
  });

  mainWindow.on('resize', () => {
    mainWindow.webContents.send('window-on-resize', mainWindow.getBounds());
  });

  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'allow' };
  });
}

export function originalStdListeners(mainWindow: BrowserWindow) {
  // 捕获 stderr 并将其发送到渲染进程
  const originalStderrWrite = process.stderr.write.bind(process.stderr);
  process.stderr.write = (
    chunk: Uint8Array | string,
    encodingOrCallback?: BufferEncoding | ((err?: Error | undefined) => void),
    callback?: (err?: Error | undefined) => void,
  ): boolean => {
    // 移除 ANSI 颜色码
    const output = chunk
      .toString()
      .replace(/\x1B\[([0-9]{1,3}(;[0-9]{1,2};?)?)?[mGK]/g, '');
    mainWindow.webContents.send('app-on-cmd-output', output);

    // 检查 encodingOrCallback 是编码还是回调函数
    if (typeof encodingOrCallback === 'string') {
      return originalStderrWrite(chunk, encodingOrCallback, callback);
    } else {
      return originalStderrWrite(chunk, encodingOrCallback);
    }
  };

  // 捕获 stdout 并将其发送到渲染进程
  const originalStdoutWrite = process.stdout.write.bind(process.stdout);
  process.stdout.write = (
    chunk: Uint8Array | string,
    encodingOrCallback?: BufferEncoding | ((err?: Error | undefined) => void),
    callback?: (err?: Error | undefined) => void,
  ): boolean => {
    // 移除 ANSI 颜色码
    const output = chunk
      .toString()
      .replace(/\x1B\[([0-9]{1,3}(;[0-9]{1,2};?)?)?[mGK]/g, '');
    mainWindow.webContents.send('app-on-cmd-output', output);

    // 检查 encodingOrCallback 是编码还是回调函数
    if (typeof encodingOrCallback === 'string') {
      return originalStdoutWrite(chunk, encodingOrCallback, callback);
    } else {
      return originalStdoutWrite(chunk, encodingOrCallback);
    }
  };
}

export function devToolsListener(mainWindow: BrowserWindow) {
  setTimeout(() => {
    mainWindow.webContents.openDevTools();
  }, 100);
  ipcMain.handle('app-open-dev-tools', () => {
    mainWindow.webContents.openDevTools();
  });
}

export function shellListener(mainWindow: BrowserWindow) {
  ipcMain.handle('shell-open-external', (_event, url) => {
    shell.openExternal(url);
  });

  ipcMain.handle('shell-open-path', (_event, path) => {
    shell.openPath(path);
  });
}

export function dialogListener(mainWindow: BrowserWindow) {
  ipcMain.handle('dialog-show-open-dialog', (event, options) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) {
      throw new Error('No associated BrowserWindow found for open dialog');
    }
    return dialog.showOpenDialogSync(window, options);
  });

  ipcMain.handle('dialog-show-save-dialog', (event, options) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) {
      throw new Error('No associated BrowserWindow found for save dialog');
    }
    return dialog.showSaveDialogSync(window, options);
  });

  ipcMain.handle('dialog-show-message-box', (event, options) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) {
      throw new Error('No associated BrowserWindow found for message box');
    }
    return dialog.showMessageBoxSync(window, options);
  });

  ipcMain.handle('dialog-show-error-box', (_event, title, content) => {
    return dialog.showErrorBox(title, content);
  });
}

export function viewListener(mainWindow: BrowserWindow) {
  ipcMain.handle(
    'view-load',
    (
      event,
      url,
      bounds: { x: number; y: number; width: number; height: number },
      options?: {
        navigatable?: boolean;
      },
    ) => {
      const {
        x = 0,
        y = 0,
        width = mainWindow.getBounds().width,
        height = mainWindow.getBounds().height,
      } = bounds;
      const { navigatable = false } = options || {};

      logger.debug('view-load', url);
      const view = new WebContentsView();
      mainWindow.contentView.addChildView(view);

      view.setBounds({
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(width),
        height: Math.round(height),
      });

      view.webContents.on('did-navigate', (_event, url) => {
        event.sender.send('view-on-state', {
          state: 'did-navigate',
          url,
        });
      });
      view.webContents.on(
        'did-fail-load',
        (_event, _errorCode, errrorDescription, validatedURL) => {
          event.sender.send('view-on-state', {
            state: 'did-fail-load',
            error: errrorDescription,
            url: validatedURL,
          });
          (view.webContents as any).destroy();
          mainWindow.contentView.removeChildView(view);
        },
      );
      view.webContents.on('did-finish-load', () => {
        view.webContents
          .executeJavaScript(`document.documentElement.innerHTML`)
          .then((html) => {
            event.sender.send('view-on-state', {
              state: 'did-finish-load',
              html,
            });
          });
      });

      view.webContents.on('will-redirect', (detail) => {
        event.sender.send('view-on-state', {
          state: 'will-redirect',
          url: detail.url,
        });

        logger.debug('will-redirect', detail.url);
      });

      view.webContents.on('will-navigate', (detail) => {
        event.sender.send('view-on-state', {
          state: 'will-navigate',
          url: detail.url,
        });

        logger.debug('will-navigate', detail.url);
        if (!navigatable) {
          logger.debug('prevent navigation', detail.url);
          detail.preventDefault();
        }
      });
      view.webContents.loadURL(url);
    },
  );
  ipcMain.handle('view-remove', () => {
    logger.debug('view-remove');
    mainWindow.contentView.children.forEach((view) => {
      mainWindow.contentView.removeChildView(view);
    });
  });

  ipcMain.handle('view-hide', () => {
    logger.debug('view-hide');
    const view = mainWindow.contentView.children[0];
    if (!view) return;

    view.setVisible(false);
  });

  ipcMain.handle(
    'view-show',
    (
      _event,
      bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
      },
    ) => {
      const view = mainWindow.contentView.children[0];
      if (!view) return;

      logger.debug('view-show', bounds);
      view.setVisible(true);
    },
  );

  ipcMain.handle('view-scrape', (event, url) => {
    logger.debug('view-scrape', url);
    const view = new WebContentsView();
    view.setVisible(false);
    mainWindow.contentView.addChildView(view);

    view.webContents.on('did-navigate', (_event, url) => {
      event.sender.send('view-on-state', {
        state: 'did-navigate',
        url,
      });
    });
    view.webContents.on(
      'did-fail-load',
      (_event, _errorCode, errrorDescription, validatedURL) => {
        event.sender.send('view-on-state', {
          state: 'did-fail-load',
          error: errrorDescription,
          url: validatedURL,
        });
        (view.webContents as any).destroy();
        mainWindow.contentView.removeChildView(view);
      },
    );
    view.webContents.on('did-finish-load', () => {
      view.webContents
        .executeJavaScript(`document.documentElement.innerHTML`)
        .then((html) => {
          event.sender.send('view-on-state', {
            state: 'did-finish-load',
            html,
          });
          (view.webContents as any).destroy();
          mainWindow.contentView.removeChildView(view);
        });
    });

    view.webContents.loadURL(url);
  });
}

export function appListener(mainWindow: BrowserWindow) {
  ipcMain.handle('app-platform-info', () => {
    return {
      platform: process.platform,
      arch: process.arch,
      version: process.getSystemVersion(),
    };
  });

  ipcMain.handle('app-reset', () => {
    fs.removeSync(settings.libraryPath());
    fs.removeSync(settings.file());

    app.relaunch();
    app.exit();
  });

  ipcMain.handle('app-reset-settings', () => {
    fs.removeSync(settings.file());

    app.relaunch();
    app.exit();
  });

  ipcMain.handle('app-relaunch', () => {
    app.relaunch();
    app.exit();
  });

  ipcMain.handle('app-reload', () => {
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
      mainWindow.loadFile(
        path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
      );
    }
  });

  ipcMain.handle('app-is-packaged', () => {
    return app.isPackaged;
  });

  ipcMain.handle('app-quit', () => {
    app.quit();
  });
}

export function systemPreferencesListener(mainWindow: BrowserWindow) {
  ipcMain.handle(
    'system-preferences-media-access',
    async (_event, mediaType: 'microphone' | 'camera') => {
      if (process.platform === 'linux') return true;
      if (process.platform === 'win32')
        return systemPreferences.getMediaAccessStatus(mediaType) === 'granted';

      if (process.platform === 'darwin') {
        const status = systemPreferences.getMediaAccessStatus(mediaType);
        logger.debug('system-preferences-media-access', status);
        if (status !== 'granted') {
          const result = await systemPreferences.askForMediaAccess(mediaType);
          return result;
        } else {
          return true;
        }
      }
    },
  );
}
