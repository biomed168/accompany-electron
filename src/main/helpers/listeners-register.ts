import { BrowserWindow } from 'electron';
import { addThemeEventListeners } from '@/main/helpers/ipc/theme/theme-listeners';
import { addWindowEventListeners } from '@/main/helpers/ipc/window/window-listeners';

export default function registerListeners(mainWindow: BrowserWindow) {
  addWindowEventListeners(mainWindow);
  addThemeEventListeners();
}
