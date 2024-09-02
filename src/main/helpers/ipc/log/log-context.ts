import { LOG_MODE_INFO } from './log-channels';

export function exposeLogContext() {
  const { ipcRenderer } = window.require('electron');
  return {
    logMode: {
      info: (...args) => ipcRenderer.invoke(LOG_MODE_INFO, ...args),
    },
  };
}
