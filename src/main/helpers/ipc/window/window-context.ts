import {
  WIN_MINIMIZE_CHANNEL,
  WIN_MAXIMIZE_CHANNEL,
  WIN_CLOSE_CHANNEL,
} from './window-channels';

export function exposeWindowContext() {
  const { ipcRenderer } = window.require('electron');
  return {
    electronWindow: {
      minimize: () => ipcRenderer.invoke(WIN_MINIMIZE_CHANNEL),
      maximize: () => ipcRenderer.invoke(WIN_MAXIMIZE_CHANNEL),
      close: () => ipcRenderer.invoke(WIN_CLOSE_CHANNEL),
    },
  };
}
