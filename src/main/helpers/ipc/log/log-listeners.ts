import { LOG_MODE_INFO } from './log-channels';
import { ipcMain, app } from 'electron';
import log from '@/main/logger';

export function addLogEventListeners() {
  ipcMain.handle(LOG_MODE_INFO, (_event, msg) => {
    console.log('----', msg);
    return log.info(msg);
  });
}

export default {
  addLogEventListeners,
};
