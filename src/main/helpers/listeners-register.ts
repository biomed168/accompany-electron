import { BrowserWindow } from 'electron';
import { addThemeEventListeners } from '@/main/helpers/ipc/theme/theme-listeners';
import {
  addWindowEventListeners,
  shellListener,
  dialogListener,
  devToolsListener,
  appListener,
  systemPreferencesListener,
  originalStdListeners,
} from '@/main/helpers/ipc/window/window-listeners';
import { addSettingsEventListeners } from '@/main/helpers/ipc/settings/settings-listeners';
import { addLogEventListeners } from '@/main/helpers/ipc/log/log-listeners';

export default function registerListeners(mainWindow: BrowserWindow) {
  addSettingsEventListeners();
  addWindowEventListeners(mainWindow);
  addThemeEventListeners();
  shellListener(mainWindow);
  dialogListener(mainWindow);
  devToolsListener(mainWindow);
  appListener(mainWindow);
  systemPreferencesListener(mainWindow);
  originalStdListeners(mainWindow);
  addLogEventListeners();
}
